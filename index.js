const { Client, Intents } = require('discord.js');
var fs = require('fs'); 
const cron = require('node-cron');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});
const token = 'MTI2NTIzODExMDAyMzcxMjc4OQ.GBIN30.PXdrUdkejx5uRp5gYbMTcVq83SvKqgAKWLSXrI';
const channelId = '1265235832206528572';
const filePath = 'day_count.txt';
var day_count = 0;

fs.open(filePath, 'r', function (err, data) {
    if (err) {
        console.error('File does not exist:', err);
    } else {
        console.log('File exists');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading file:', err);
            } else if (data === '') {
              console.log('File exists but is empty');
            } else {
              console.log('File exists and has content');
              day_count = data;
              console.log(day_count);
            }
        });
    }
});

client.once('ready', async () => {
    console.log(`${client.user.username} is online!`);

    // Replace 'Hello, world!' with your desired message content
    const messageContent = 'Hello there! I am FuckZiyanBot at your service. Tell me how you would like to abuse Ziyan.';

    try {
        // Fetch the channel
        const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId);

        // Send the message to the channel
        if (channel) {
            channel.send(messageContent)
                .then(() => console.log('Message sent successfully'))
                .catch(error => console.error('Error sending message:', error));
        } else {
            console.log('Channel not found.');
        }

        cron.schedule('*/5 * * * * *', () => {
            if (channel) {
                day_count++;
                channel.send('<@331089744098361365> Fuck You. Day ' + day_count)
                    .then(() => { 
                        console.log('Scheduled message sent successfully');
                        fs.writeFile(filePath, String(day_count), function (err) {
                            if (err) throw err;
                            console.log('Day Count Updated!');
                        });
                    })
                    .catch(error => console.error('Error sending scheduled message:', error));
            } else {
                console.log('Channel not found for scheduled message.');
            }
        })

    } catch (error) {
        console.error('Error fetching channel:', error);
    }
});

// Listen for messages and reply
client.on('messageCreate', async message => {
    if (message.channel.id === channelId && !message.author.bot) {
        if (message.author.id == 733617528210980875 || message.author.id == 837627006971674674) { //me
            message.reply('Praise the supreme leader!!!')
                .then(() => console.log('Reply sent successfully'))
                .catch(error => console.error('Error sending reply:', error));
        }
        if (message.author.id == 331089744098361365 || message.author.id == 494417143946018817 || message.author.id == 1157755445180645459) { //ziyan, aun
            message.reply('RANDI CHUP!')
                .then(() => console.log('Reply sent successfully'))
                .catch(error => console.error('Error sending reply:', error));
        }
    }
});

client.login(token);