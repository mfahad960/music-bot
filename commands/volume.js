const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set new volume or get current volume.')
    .addIntegerOption(option =>
        option.setName('volume')
            .setDescription('Enter new volume')
            .setRequired(false)
    ),

    async execute({client, interaction}) {
        await interaction.deferReply();
        const newVolume = interaction.options.getInteger('volume');
        let queue = client.player.nodes.get(interaction.guild);

        if (!queue || !queue.isPlaying()) return interaction.editReply(`No song in current queue! ❌`);

        if (!interaction.member.voice.channel) return interaction.editReply(`You need to be in a voice channel to use commands ❌`);

        if (!newVolume && newVolume != 0) {
            // Get and display the current volume
            const currentVolume = queue.node.volume;
            return interaction.editReply(`The current volume is **${currentVolume}%**.`);
        } else {
            if (newVolume < 1 || newVolume > 100) {
                return interaction.editReply(`Input volume level out of range. ❌`);
            }
            const success = queue.node.setVolume(newVolume);
            if (success) {
                const currentVolume = queue.node.volume;
                return interaction.editReply(`Volume set to **${currentVolume}%** ✅`);
            }
        }
    }
}