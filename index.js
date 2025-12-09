const { GatewayIntentBits, Client, Options } = require('discord.js')
const { createAudioPlayer, createAudioResource , StreamType, demuxProbe, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice')
const play = require('play-dl')
const fs = require('fs')
require('dotenv').config()

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: ['CHANNEL', 'MESSAGE']
})

const token = process.env.TOKEN;

client.on('messageCreate', async message => {
    
    if (message.content.startsWith('!play')) {
        
        if (!message.member.voice?.channel) return message.channel.send('Connect to a Voice Channel')
        
        const connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })

        
        let args = message.content.split('play')[1]
        let yt_info = await play.search(args, {
            limit: 1
        })

        console.log('Search completed:' + yt_info);
        
        let stream = await play.stream(
            yt_info,
            { discordPlayerCompatibility : true }
        )
        
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
    }
})

client.on('clientReady', () => {
    console.log(`We have logged in as ${client.user.tag}!`)
})

client.login(token);