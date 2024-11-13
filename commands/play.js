const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
      option.setName("input").setDescription('Enter a search term or a link').setRequired(true)
    ),
  
  async execute({client, interaction}) {
    await interaction.deferReply();
    const query = interaction.options.getString('input');

    if (!interaction.member.voice.channel) return interaction.editReply("You need to be in a voice channel to play a song... ❌");

    let embed = new EmbedBuilder()

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
      return interaction.editReply(`No results found! ❌`);
    }

    try {
      // play the song
      const { track } = await client.player.play(interaction.member.voice.channel, query, {
          nodeOptions: {
              metadata: {
                  channel: interaction.channel
              },
              volume: 100,
              leaveOnEmpty: true,
              leaveOnEmptyCooldown: 30000,
              leaveOnEnd: true,
              leaveOnEndCooldown: 30000,
          }
      });

      // get active queue
      const queue  = client.player.nodes.get(interaction.guild.id)
      console.log(queue.tracks.data);
      
      if (queue.tracks.data.length > 0) {
        // Track is added to the queue if something is currently playing
        // await interaction.editReply(`Added to queue: **${track.cleanTitle}** - ${track.duration} ✅`);
        embed
          .setDescription(`**[${track.title}](${track.url})** has been added to the queue`)
          .setThumbnail(track.thumbnail)
          .setFooter({ text: `Duration: ${track.duration}`})
      } else {
          // Display the currently playing track if it's the first in the queue
          // await interaction.editReply(`Now playing: **${track.cleanTitle}** - ${track.duration} 🎶`);
          embed
          .setDescription(`**[${track.title}](${track.url})** is now playing`)
          .setThumbnail(track.thumbnail)
          .setFooter({ text: `Duration: ${track.duration}`})
      }
    } catch (error) {
        console.log(`Play error: ${error}`);
        await interaction.editReply(`I can\'t join the voice channel... ❌`);
    }

    await interaction.editReply({
      embeds: [embed]
    })
  }
};