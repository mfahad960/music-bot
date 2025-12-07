require('dotenv').config();

const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { Player } = require("discord-player");
const { DefaultExtractors } = require('@discord-player/extractor');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1265238110023712789"
const GUILD_ID = "775765883397341244"
const BOT_CHANNEL_ID = "1087794554574475284"

global.client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
});

// Load commands
const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Create player with FFmpeg enabled
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        // filter: 'audioonly'
    },
    // skipFFmpeg: false
});

// Event listeners
player.events.on('error', (queue, error) => {
    console.error('❌ General player error:', error);
});

player.events.on('playerError', (queue, error) => {
    console.error('❌ Player error:', error);
    if (queue?.metadata?.channel) {
        queue.metadata.channel.send('There was an error playing the track!');
    }
});

player.events.on('playerStart', (queue, track) => {
    console.log(`▶️ Started playing: ${track.title}`);
    queue.metadata.channel.send(`Now playing: **${track.title}** 🎶`);
});

player.events.on('audioTrackAdd', (queue, track) => {
    console.log(`➕ Track added: ${track.title}`);
});

player.events.on('disconnect', (queue) => {
    console.log('👋 Disconnected from voice channel');
});

player.events.on('emptyChannel', (queue) => {
    console.log('📭 Voice channel is empty');
});

player.events.on('emptyQueue', (queue) => {
    console.log('📋 Queue finished');
});

client.player = player;

client.once('ready', async () => {
    // Load extractors AFTER client is ready

    try {
        await player.extractors.loadMulti(DefaultExtractors);
        console.log('✅ Extractors loaded:', player.extractors.store.map(e => e.identifier).join(', '));
    } catch (error) {
        console.error('Failed to load extractors:', error);
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    console.log("Deploying slash commands");
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        {body: commands})
    .then(() => console.log('Successfully updated commands for guild ' + GUILD_ID))
    .catch(console.error);

    console.log(`${client.user.tag} is online!`);
    
    try {
        const channel = client.channels.cache.get(BOT_CHANNEL_ID) || 
                       await client.channels.fetch(BOT_CHANNEL_ID);

        if (channel) {
            channel.send('MusicBot is online!')
                .then(() => console.log('Message sent successfully'))
                .catch(error => console.error('Error sending message:', error));
        }
    } catch (error) {
        console.error('Error fetching channel:', error);
    }
});

client.on("interactionCreate", async interaction => {
    if(!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute({client, interaction});
    } catch(error) {
        console.error('Error executing command:', error);
        
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: "There was an error executing this command", 
                    ephemeral: true 
                });
            } else if (interaction.deferred && !interaction.replied) {
                await interaction.editReply("There was an error executing this command");
            }
        } catch (replyError) {
            console.error('Could not send error message:', replyError);
        }
    }
});

client.login(TOKEN);