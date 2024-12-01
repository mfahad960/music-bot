const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType, QueueRepeatMode } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song from YouTube')
    .addStringOption(option =>
      option.setName("input")
        .setDescription('Enter a search term or a link')
        .setRequired(true)
    ),

  async execute({client, interaction}) {
    await interaction.deferReply();

    const query = interaction.options.getString('input');
    let queue = client.player.nodes.get(interaction.guild);
    let embed = new EmbedBuilder();

    if (!queue) {
      queue = client.player.nodes.create(interaction.guild, {
        metadata: {
            channel: interaction.channel
        },
        volume: 150,                  // Default volume
        leaveOnEmpty: true,
        leaveOnEmptyCooldown: 30000,  // 30 seconds
        leaveOnEnd: true,
        leaveOnEndCooldown: 30000     // 30 seconds
      });
    }

    queue.setRepeatMode(QueueRepeatMode.QUEUE);
    const tracks = queue.tracks.toArray(); //Converts the queue into a array of tracks
    const currentTrack = queue.currentTrack; //Gets the current track being played

    if (!interaction.member.voice.channel) return interaction.editReply(`You need to be in a voice channel to play a song... ❌`);

    try {
      // Join the voice channel
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch (error) {
      console.log(error);
      return interaction.editReply('Could not join the voice channel! ❌');
    }

    // Search for the song using the discord-player
    const result = await client.player.search(query, {
        requestedBy: interaction.member,
        searchEngine: QueryType.AUTO
    })

    // If song not found
    if (!result || !result.tracks || !result.tracks.length) {
      return interaction.editReply(`No results found! ❌`);
    }
    const track = result.tracks[0];

    if (tracks.some(trackFound => trackFound.url === track.url) || currentTrack?.url === track.url)
      return interaction.editReply(`The track **${track.title}** is already in the queue ❌`);

    let username = interaction.member.user.globalName;
    let nickname = interaction.member.nickname;

    if (!nickname) nickname = "no nickname";

    if (tracks.length === 0 && currentTrack === null) {
      // Display the currently playing track if it's the first in the queue
      // await interaction.editReply(`Now playing: **${track.cleanTitle}** - ${track.duration} 🎶`);
      embed
        .setDescription(`**[${track.title}](${track.url})** is now playing 🎶`)
        .setThumbnail(track.thumbnail)
        .setFooter({ text: `Duration: ${track.duration}\n` + 
                            `Requested by: ${username} (${nickname})`})
    } else {
      // Track is added to the queue if something is currently playing
      // await interaction.editReply(`Added to queue: **${track.cleanTitle}** - ${track.duration} ✅`);
      embed
        .setDescription(`**[${track.title}](${track.url})** has been added to the queue ✅`)
        .setThumbnail(track.thumbnail)
        .setFooter({ text: `Duration: ${track.duration}\n` + 
                            `Requested by: ${username} (${nickname})`})
    }

    queue.addTrack(track);
    if (!queue.isPlaying()) await queue.node.play();
      
    await interaction.editReply({ 
      embeds: [embed]
    });
  }
};