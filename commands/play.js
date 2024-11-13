const { SlashCommandBuilder } = require('discord.js');
const { QueryType, useMainPlayer } = require("discord-player");

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
    await interaction.deferReply();
    const query = interaction.options.getString('searchterms');

    if (!interaction.member.voice.channel) return interaction.editReply("You need to be in a Voice Channel to play a song.");

    // Create or retrieve a queue for the guild
    // const queue = await player.nodes.create(interaction.guild, {
    //     metadata: {
    //         channel: interaction.channel
    //     }
    // });

    // Wait until you are connected to the channel
		// if (!queue.connection) await queue.connect(interaction.member.voice.channel)

    // Search for the song using the discord-player
    const result = await client.player.search(query, {
        requestedBy: interaction.member,
        searchEngine: QueryType.AUTO
    })

    // If song not found
    if (!result || !result.tracks || !result.tracks.length) {
      return interaction.editReply(`No results found!`);
    }

    // play the song
    try {
      const { track } = await client.player.play(interaction.member.voice.channel, query, {
          nodeOptions: {
              metadata: {
                  channel: interaction.channel
              },
              volume: 75,
              leaveOnEmpty: true,
              leaveOnEmptyCooldown: 30000,
              leaveOnEnd: true,
              leaveOnEndCooldown: 30000,
          }
      });
      console.log(track);
      await interaction.editReply(`Now playing: **${track.title}**`);
    } catch (error) {
        console.log(`Play error: ${error}`);
        await interaction.editReply('An error occurred while trying to play the song.');
    }
  }
};