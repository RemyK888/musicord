const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client } = require('discord.js');

const { ApplicationCommandSchema, Musicord } = require('../src/index');


const commandsSchema = new ApplicationCommandSchema({
  play: {
    description: 'Play a song',
    implemented: true,
    options: {
      name: 'link',
      description: 'Youtube link of the video',
      required: true,
      type: 3
    }
  },
  stop: {
    description: 'Stop currently song',
    implemented: true,
  },
  setvolume: {
    description: 'Change the Volume of the current music',
    implemented: true,
    options: {
      name: 'volume',
      description: 'Desired volume between 1 and 100',
      required: true,
      type: 3
    }
  },
  pause: {
    description: 'Pause the music',
    implemented: true
  },
  resume: {
    description: 'Resume the music',
    implemented: true
  },
  skip: {
    description: 'Skip a song of queue',
    implemented: true
  }
});

const rest = new REST({ version: '10' }).setToken('BOT_TOKEN');

(async () => {
  try {
    console.log('Started refreshing application [/] commands.');

    await rest.put(
      Routes.applicationGuildCommands('BOT_ID', 'GUILD_ID'),
      { body: commandsSchema.extract() },
    )

    console.log('Successfully reloaded application [/] commands.');
  } catch (error) {
    console.error(error);
  }
})();


const client = new Client({
  intents: 32767
})

const musicordPlayer = new Musicord();

client.on('interactionCreate', async (interaction) => {
  if (interaction && interaction.isCommand()) {
    if (interaction.commandName === 'play') {
      const msgArgs = interaction.options.get('link').value
      if (!msgArgs) return interaction.reply('Pas d\'argument inséré');
      const msgMember = interaction.guild.members.cache.get(interaction.member.user.id);
      if (msgMember && msgMember.voice.channel) {
        if (musicordPlayer.existQueue(interaction.guild)) {
          const queue = musicordPlayer.getQueue(interaction.guild);
          if (queue) await queue.play(msgArgs, msgMember.voice.channel);
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild);
          if (queueInfo && queue) {
            if (queue.isPlaying) return interaction.reply(`${queueInfo.songs[1].title} a été ajouté à la playlist`)
            else return interaction.reply(`${queueInfo.songs[1].title} a été ajouté à la playlist`)
          }
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
          if (queueInfo) return await interaction.editReply(`En train de jouer ${queueInfo.songs[0].title}`)
        }
      }
    } else if (interaction.commandName === 'stop') {
      if (musicordPlayer.existQueue(interaction.guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild );
        queue.stop()
        interaction.reply('La musique a bien été arrêtée')
      }
    } else if (interaction.commandName === 'setvolume') {
      const msgArgs = interaction.options.get('volume')?.value
      if (!msgArgs) return interaction.reply('Pas d\'argument inséré');
      if (isNaN(msgArgs)) return interaction.reply('Le volume doit être un nombre compris entre 0 et 100')
      if (msgArgs < 0 || msgArgs > 100) return interaction.reply('Le volume doit être un nombre compris entre 0 et 100')
      if (musicordPlayer.existQueue(interaction.guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild);
        queue.setVolume(msgArgs / 100)
        interaction.reply('Le volume a bien été changé')
      }
    }
    else if (interaction.commandName === 'pause') {
      if (musicordPlayer.existQueue(interaction.guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild);
        queue.pause();
        interaction.reply('La musique a bien été mise en pause')
      }
    }
    else if (interaction.commandName === 'skip') {
      if (musicordPlayer.existQueue(interaction.guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild);
        queue.skip()
        interaction.reply('La musique a bien été sautée')
      }
    }
    else if (interaction.commandName === 'resume') {
      if (musicordPlayer.existQueue(interaction.guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild);
        queue.resume()
        interaction.reply('La musique a bien été remise en route')
      }
    }
  } else return
})

client.login('BOT_TOKEN')