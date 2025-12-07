const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects the bot from the voice channel'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
        }

        const connection = voiceChannel.members.find(member => member.user.id === interaction.client.user.id);

        if (!connection) {
            return interaction.reply({ content: 'The bot is not connected to a voice channel.', ephemeral: true });
        }

        interaction.guild.members.me.voice.disconnect();
        await interaction.reply('Disconnected from the voice channel.');
    },
};