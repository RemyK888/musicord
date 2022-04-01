const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client } = require('discord.js');
const { Musicord, ApplicationCommandSchema } = require('musicord');

const client = new Client({
  intents: 32767
});

const commandsSchema = new ApplicationCommandSchema({
  play: {
    description: 'Play a song',
    implemented: true,
    options: {
      name: 'link',
      description: 'YouTube URL',
      required: true,
      type: 3
    }
  }
});

const musicordPlayer = new Musicord();
const rest = new REST({ version: '10' }).setToken('token');

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands('client id', 'guild id'),
      { body: commandsSchema.extract() },
    )
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', (interaction) => {
if(!command.isCommand()) return; 
if (interaction.commandName === 'play') {
      const msgArgs = interaction.options.get('link').value
      if (!msgArgs) return interaction.reply('Argument required');
      const msgMember = interaction.guild.members.cache.get(interaction.member.user.id);
      if (msgMember && msgMember.voice.channel) {
        if (musicordPlayer.existQueue(interaction.guild)) {
          const queue = musicordPlayer.getQueue(interaction.guild);
          if (queue) await queue.play(msgArgs, msgMember.voice.channel);
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild);
          if (queueInfo && queue) interaction.reply(`${queueInfo.songs[1].title} has been added to the queue`)
        } else {
          const queue = musicordPlayer.initQueue(interaction.guild, {
            textChannel: interaction.channel ,
            voiceChannel: msgMember.voice.channel
          });
          if (queue) {
            interaction.deferReply();
            await queue.play(msgArgs, msgMember.voice.channel)
          }
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild);
          if (queueInfo) return await interaction.editReply(`Playing ${queueInfo.songs[0].title}`)
        }
      }
    }
});

client.login('token');