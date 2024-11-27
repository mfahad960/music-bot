const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnect from the voice channel.'),

    async execute({client, interaction}) {
        await interaction.deferReply();
        let queue = client.player.nodes.get(interaction.guild);

        if (!interaction.member.voice.channel) return interaction.editReply(`You need to be in a voice channel to use commands ❌`);

        if (!queue || !queue.connection) return interaction.editReply(`Not connected to any voice channel! ❌`);
        try{
            await queue.delete();
            return interaction.editReply(`Left the voice channel. See you next time. ✅`);
        } catch (error) {
            console.log(error);
            return interaction.editReply(`An error occured when leaving the voice channel. ❌`)
        }
    }
}