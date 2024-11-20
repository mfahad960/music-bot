require('dotenv').config();

const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { Player } = require("discord-player");
const { YoutubeiExtractor } = require('discord-player-youtubei');
const fs = require('fs');

const TOKEN = process.env.TOKEN
const CLIENT_ID = "1265238110023712789"
const GUILD_ID = "775765883397341244"
const BOT_CHANNEL_ID = "1087794554574475284"

// Create a new Discord client
global.client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
});

// Load all commands
const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Add the player to the client
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    }
});
// Register the new Youtubei extractor
player.extractors.register(YoutubeiExtractor, {});
client.player = player;

client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    console.log("Deploying slash commands");
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        {body: commands})
    .then(() => console.log('Successfully updated commands for guild ' + GUILD_ID))
    .catch(console.error);

    console.log(`${client.user.tag} is online!`);
    const messageContent = 'Hello ! MusicBot is online!';

    try {
        // Fetch the channel
        const channel = client.channels.cache.get(BOT_CHANNEL_ID) || await client.channels.fetch(BOT_CHANNEL_ID);

        // Send the message to the channel
        if (channel) {
            channel.send(messageContent)
                .then(() => console.log('Message sent successfully'))
                .catch(error => console.error('Error sending message:', error));
        } else {
            console.log('Channel not found.');
        }
    } catch (error) {
        console.error('Error fetching channel:', error);
    }
});

client.on("interactionCreate", async interaction => {
    // if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute({client, interaction});
    } catch(error) {
        console.error(error);
        await interaction.reply({content: "There was an error executing this command"});
    }

    if (interaction.isButton()) {
        try {
            if (interaction.customId === 'pause-button') {
                console.log(interaction);
                console.log('pause button pressed')
                const pauseCommand = client.commands.get('pause');
                if (pauseCommand) {
                    await pauseCommand.execute({ client, interaction });
                } else {
                    await interaction.reply({ content: "Pause command not found. ❌", ephemeral: true });
                }
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            await interaction.reply({ content: "There was an error handling this button interaction", ephemeral: true });
        }
    }
});

client.login(TOKEN);