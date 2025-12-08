const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the previously paused song.'),

    async execute({client, interaction}) {
        await interaction.deferReply();
        let queue = client.player.nodes.get(interaction.guild);

        if (!interaction.member.voice.channel) return interaction.editReply(`You need to be in a voice channel to use commands ❌`);

        if (!queue) return interaction.editReply(`No song in current queue! ❌`);

        if (queue.node.isPlaying()) return interaction.editReply(`Song is already playing! ❌`);

        const success = queue.node.resume();
        if (success) return interaction.editReply(`Song resumed ✅`);
    }
}