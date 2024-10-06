const { Client, GatewayIntentBits } = require('discord.js');
const { Player, usePlayer } = require("discord-player");
const { YouTubeExtractor } = require('discord-player-youtubei');
const { token } = require("./config.json");

const channelId = '1087794554574475284';

// Create a new Discord client
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') || message.author.bot) return;
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online!`);

    const messageContent = 'Hello there! I am MusicBot at your service. UWOoohh SEGGGGggSSSS';

    try {
        // Fetch the channel
        const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId);

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

// Login to Discord with your bot token
client.login(token);