const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType, QueueRepeatMode } = require("discord-player");
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playyt')
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
        // return interaction.editReply('You need to be in a voice channel! ❌');
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

      // Connect to voice channel
      try {
        if (!queue.connection) {
          await queue.connect(interaction.member.voice.channel);
          console.log('✅ Connected to voice channel');
        }
      } catch (error) {
        console.error('Connection error:', error);
        // return interaction.editReply('Could not join the voice channel! ❌');
      }

        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        // Search with better error handling
        console.log('🔍 Searching for:', query);

        let yt_info;
      
        yt_info = await play.search(query, {
            limit: 1
        })

        console.log('Search completed:' + yt_info);

        let stream = await play.stream(yt_info)

        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
        
        player.play(resource)

        connection.subscribe(player)

    } catch (error) {
      console.error('Error in play command:', error);
      console.error('Stack:', error.stack);
    }
  }
};