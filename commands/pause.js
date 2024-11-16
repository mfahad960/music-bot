const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing song.'),

    async execute({client, interaction}) {
        await interaction.deferReply();
        let queue = client.player.nodes.get(interaction.guild);

        if (!queue || !queue.isPlaying()) return interaction.editReply(`No song in current queue! ❌`);

        if (queue.node.isPaused()) return interaction.editReply(`Song is already paused! ❌`);

        const success = queue.node.setPaused(true);

        if (success) return interaction.editReply(`Song paused ✅`);
    }
}