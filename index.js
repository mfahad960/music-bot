const { Client, GatewayIntentBits } = require('discord.js');
const { Player, QueryType, Queue } = require("discord-player");
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { token, bot_channel_id } = require("./config.json");

const PREFIX = '!';         // Command prefix for the bot

// Create a new Discord client
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
});

// Add the player on the client
const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});
player.extractors.register(YoutubeiExtractor);

client.once('ready', async () => {
    console.log(`${client.user.tag} is online!`);

    const messageContent = 'Hello ! MusicBot is online!';

    try {
        // Fetch the channel
        const channel = client.channels.cache.get(bot_channel_id) || await client.channels.fetch(bot_channel_id);

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

// Handle message-based commands
client.on('messageCreate', async (message) => {
    // if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    if (message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        const query = args.join(' ');
        if (!query) return message.reply('Please provide a song name or URL!');

        const channel = message.member.voice.channel;
        if (!channel) return message.reply('You need to be in a voice channel to play music!');

        // Create or retrieve a queue for the guild
        const queue = player.nodes.create(message.guild, {
            metadata: {
                channel: message.channel
            }
        });

        try {
            // Join the voice channel
            if (!queue.connection) await queue.connect(channel);
        } catch (error) {
            queue.destroy();
            return message.reply('Could not join your voice channel!');
        }

        // Search for the song from YouTube using the extractor
        let searchResult;
        try {
            searchResult = await player.search(query, {
                requestedBy: message.author,
                searchEngine: QueryType.YOUTUBE_VIDEO
            });
        } catch (error) {
            return message.reply('Error during the search: ' + error.message);
        }

        // console.log(searchResult.tracks);

        if (!searchResult || !searchResult.tracks || !searchResult.tracks.length) {
            return message.reply('No results found!');
        }

        const track = searchResult.tracks[0];

        // console.log(track);

        if (!track) {
            return message.reply('Error: Invalid track data. Could not read track identifier.');
        }

        // Manually set the identifier if it's missing
        if (!track.identifier) {
            track.identifier = track.url.split('v=')[1]; // Extract the YouTube video ID
        }

        queue.addTrack(track);
        console.log(queue.player);

        // console.log(queue.options);

        // console.log('Track properties:', {
        //     url: track.url,
        //     title: track.title,
        //     duration: track.duration,
        //     extractor: track.extractor
        // });

        if (!queue.playing) await queue.play();
        message.reply(`Now playing: **${track.title}**`);
    }
});

// Login to Discord with your bot token
client.login(token);