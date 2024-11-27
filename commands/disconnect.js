const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect from the voice channel.'),

    async execute({client, interaction}) {
        await interaction.deferReply();
        let queue = client.player.nodes.get(interaction.guild);

        if (!interaction.member.voice.channel || !queue.connection) return interaction.editReply(`Not connected to any voice channel! ❌`);
        const success = queue.disconnect(interaction.member.voice.channel);

        if (success) return interaction.editReply(`Left the voice channel. ✅`);
    }
}