const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require("discord-player");

// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('ping')
// 		.setDescription('Replies with Pong!'),
// 	async execute({client, interaction}) {
// 		await interaction.reply('Pong!');
// 	},
// };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube')
    .addStringOption(option =>
      option.setName("searchterms").setDescription("search keywords").setRequired(true)
    ),
  
  async execute({client, interaction}) {
    const query = interaction.options.getString('searchterms');

    if (!interaction.member.voice.channel) return interaction.reply("You need to be in a Voice Channel to play a song.");

    console.log(client.player);

    // Create or retrieve a queue for the guild
    const queue = await client.player.nodes.create(interaction.guild, {
        metadata: {
            channel: interaction.channel
        }
    });

    // Wait until you are connected to the channel
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

    // Search for the song using the discord-player
    const result = await client.player.search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE_VIDEO
    })

    if (!result || !result.tracks || !result.tracks.length) {
      return interaction.reply('No results found!');
    }

    const track = result.tracks[0];
    console.log("Track Info: ");
    console.log(track.title);
    console.log(track.author);
    console.log(track.url);
    console.log(track.duration);
    console.log(track.description);

    if (!track) {
        return message.reply('Error: Invalid track data. Could not read track identifier.');
    }

    queue.addTrack(track);

    if (!queue.playing) await queue.play();
    message.reply(`Now playing: **${track.title}**`);
  }
};