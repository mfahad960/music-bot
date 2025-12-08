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
    try {
      await interaction.deferReply();

      const query = interaction.options.getString('input');
      
      if (!interaction.member.voice.channel) {
        return interaction.editReply('You need to be in a voice channel! ❌');
      }

      let queue = client.player.nodes.get(interaction.guild);

      if (!queue) {
        queue = client.player.nodes.create(interaction.guild, {
          metadata: {
              channel: interaction.channel
          },
          volume: 100,                  // Default volume
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 30000,  // 30 seconds
          leaveOnEnd: true,
          leaveOnEndCooldown: 30000     // 30 seconds
        });
      }

      queue.setRepeatMode(QueueRepeatMode.QUEUE);
      const tracks = queue.tracks.toArray(); //Converts the queue into a array of tracks
      const currentTrack = queue.currentTrack; //Gets the current track being played

      // Connect to voice channel
      try {
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
          console.log('✅ Connected to voice channel');
        }
      } catch (error) {
        console.error('Connection error:', error);
        return interaction.editReply('Could not join the voice channel! ❌');
      }

      // Search with better error handling
      console.log('🔍 Searching for:', query);
      
      let result;
      try {
        result = await client.player.search(query, {
          requestedBy: interaction.member,
          searchEngine: QueryType.AUTO
        });
        console.log('Search completed. Has tracks?', result?.hasTracks());
      } catch (searchError) {
        console.error('Search error:', searchError);
        return interaction.editReply(`Search failed: ${searchError.message} ❌`);
      }

      if (!result || !result.hasTracks()) {
        console.log('No results found for:', query);
        return interaction.editReply(`No results found for: ${query} ❌\n\nTry:\n- A different video\n- Searching by song name instead of URL\n- Waiting a moment and trying again`);
      }

      const track = result.tracks[0];
      console.log('✅ Found track:', track.title);

      // Check duplicates
      if (tracks.some(t => t.url === track.url) || currentTrack?.url === track.url) {
        return interaction.editReply(`**${track.title}** is already in the queue! ❌`);
      }

      let username = interaction.member.user.globalName || interaction.member.user.username;

      // Build embed
      let embed = new EmbedBuilder();
      
      if (tracks.length === 0 && currentTrack === null) {
        embed.setDescription(`**[${track.title}](${track.url})** is now playing 🎶`);
      } else {
        embed.setDescription(`**[${track.title}](${track.url})** added to queue ✅`);
      }

      if (track.thumbnail && track.thumbnail.trim() !== '') {
        embed.setThumbnail(track.thumbnail);
      }
      
      embed.setFooter({ 
        text: `Duration: ${track.duration}\nRequested by: ${username}` 
      });

      // Add track and play
      queue.addTrack(track);
      console.log('➕ Track added to queue');
      
      if (!queue.isPlaying()) {
        console.log('▶️ Starting playback...');
        await queue.node.play();
      } else {
        console.log('Already playing, track queued');
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in play command:', error);
      console.error('Stack:', error.stack);
      
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply('An error occurred while trying to play the track.');
      } else if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: 'An error occurred while trying to play the track.', 
          ephemeral: true 
        });
      }
    }
  }
};