import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';


import { ApplicationCommandSchema } from '../src/structures/ApplicationCommandSchema';

const commandsSchema = new ApplicationCommandSchema({
  play: {
    description: 'Jouer un morceau',
    implemented: true,
    options: {
      name: 'lien',
      description: 'Lien YouTube de la vidéo',
      required: true,
      type: 3
    }
  },
  stop: {
    description: 'Arreter la musique en cours',
    implemented: true,
  },
  setvolume: {
    description: 'Changer le Volume de la musique en cours',
    implemented: true,
    options: {
      name: 'volume',
      description: 'Volume désiré entre 1 et 100',
      required: true,
      type: 3
    }
  },
  pause: {
    description: 'Mettre la musique en pause',
    implemented: true
  },
  resume: {
    description: 'Reprendre la musique en cours',
    implemented: true
  },
  ping: {
    description: 'CA VA MARCHER',
    implemented: true
  },
  skip: {
    description: 'Saute un son de la playlist',
    implemented: true
  },
  getplaylist: {
    description: 'Recuperer les infos d\'une playlist ou d\'un mix',
    implemented: true,
    options: {
      name: 'lien',
      description: 'Lien de la playlist/mix',
      required: true,
      type: 3
    }
  }
});

const rest = new REST({ version: '10' }).setToken('NzI2NTEwNjE3MDQ5MTcwMDAx.XveVvQ.Bf5AZEARQNhnIF3AKALa108eJSs');

(async () => {
  try {
    console.log('Started refreshing application [/] commands.');

    await rest.put(
      Routes.applicationGuildCommands('726510617049170001', '715924331682594959'),
      { body: commandsSchema.extract() },
    )

    console.log('Successfully reloaded application [/] commands.');
  } catch (error) {
    console.error(error);
  }
})();



import { AnyChannel, Client, Guild, TextInputStyle, ActionRow, EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import { ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder } from '@discordjs/builders'

import { Musicord, AudioFilters, SongSearcher } from '../src/index';

const client = new Client({
  intents: 32767
})

const musicordPlayer = new Musicord();
const searcher = new SongSearcher();

// @ts-ignore
client.on('interactionCreate', async (interaction) => {
  if (interaction && interaction.isCommand()) {
    if (interaction.commandName === 'play') {
      const msgArgs = interaction.options.get('lien')?.value
      if (!msgArgs) return interaction.reply('Pas d\'argument inséré');
      // @ts-ignore
      const msgMember = interaction.guild.members.cache.get(interaction.member.user.id);
      // @ts-ignore
      if (msgMember && msgMember.voice.channel) {
        if (musicordPlayer.existQueue(interaction.guild as Guild)) {
          const queue = musicordPlayer.getQueue(interaction.guild as Guild);
          if (queue) await queue.play(msgArgs as any, msgMember.voice.channel);
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild as Guild);
          if (queueInfo && queue) {
            if (queue.isPlaying) return interaction.reply(`${queueInfo.songs[1].title} a été ajouté à la playlist`)
            else return interaction.reply(`${queueInfo.songs[1].title} a été ajouté à la playlist`)
          }
        } else {
          const queue = musicordPlayer.initQueue(interaction.guild as Guild, {
            textChannel: interaction.channel as GuildTextBasedChannel ,
            voiceChannel: msgMember.voice.channel
          });
          if (queue) {
            interaction.deferReply();
            //queue.setFilter(AudioFilters.rotatingAudio)
            await queue.play(msgArgs as any, msgMember.voice.channel)
          }
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild as Guild);
          if (queueInfo) return await interaction.editReply(`En train de jouer ${queueInfo.songs[0].title}`)
        }
      }
    } else if (interaction.commandName === 'stop') {
      if (musicordPlayer.existQueue(interaction.guild as Guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild as Guild);
        // @ts-ignore
        queue.stop()
        interaction.reply('La musique a bien été arrêtée')
      }
    } else if (interaction.commandName === 'setvolume') {
      const msgArgs: any = interaction.options.get('volume')?.value
      if (!msgArgs) return interaction.reply('Pas d\'argument inséré');
      if (isNaN(msgArgs)) return interaction.reply('Le volume doit être un nombre compris entre 0 et 100')
      if (msgArgs < 0 || msgArgs > 100) return interaction.reply('Le volume doit être un nombre compris entre 0 et 100')
      if (musicordPlayer.existQueue(interaction.guild as Guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild as Guild);
        // @ts-ignore
        queue.setVolume(msgArgs / 100)
        interaction.reply('Le volume a bien été changé')
      }
    }
    else if (interaction.commandName === 'pause') {
      if (musicordPlayer.existQueue(interaction.guild as Guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild as Guild);
        // @ts-ignore
        queue.pause();
        interaction.reply('La musique a bien été mise en pause')
      }
    }
    else if (interaction.commandName === 'skip') {
      if (musicordPlayer.existQueue(interaction.guild as Guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild as Guild);
        // @ts-ignore
        queue.skip()
        interaction.reply('La musique a bien été sautée')
      }
    }
    else if (interaction.commandName === 'resume') {
      if (musicordPlayer.existQueue(interaction.guild as Guild)) {
        const queue = musicordPlayer.getQueue(interaction.guild as Guild);
        // @ts-ignore
        queue.resume()
        interaction.reply('La musique a bien été remise en route')
      }
    }
    else if (interaction.commandName === 'ping') {
      const btn = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('button-test')
            .setLabel('CA MARCHE')
            .setStyle(1),       
        ) as any
      interaction.reply({ content: 'coucou', components: [btn] })
    }
    else if (interaction.commandName === 'getplaylist') {
      const msgArgs = interaction.options.get('lien')?.value
      if (!msgArgs) return interaction.reply('Pas d\'argument inséré');
      const data = await searcher.extractPlaylistInfo(msgArgs as string)
      
      interaction.reply(data.title + ' | ' + data.description)
    }
  } else return
})


/*
// @ts-ignore
client.on('messageCreate', (message) => {
  if (message.content.startsWith('!play')) {

    const msgArgs = message.content.split(' ').slice(1).join();
    if (!msgArgs) {
      return message.channel.send("Pas d'argument")
    }
    console.log(msgArgs)
    if (message.guild && message.member && message.member.voice.channel) {
      if (musicordPlayer.existQueue(message.guild)) {
        const queue = musicordPlayer.getQueue(message.guild)
        // @ts-ignore
        console.log(musicordPlayer.getQueueInfo(message.guild).songs);
        // @ts-ignore
        queue.play(msgArgs, message.member.voice.channel);
      } else {
        const queue = musicordPlayer.initQueue(message.guild, {
          textChannel: message.channel,
          voiceChannel: message.member.voice.channel
        })
        queue.play(msgArgs, message.member.voice.channel)
      }

    }
  }
})

*/


client.login('NzI2NTEwNjE3MDQ5MTcwMDAx.XveVvQ.Bf5AZEARQNhnIF3AKALa108eJSs')

/*

import { SongSearcher } from '../src/index';

const songSearcher = new SongSearcher();


(async () => {
  const songs = await songSearcher.search('end of the beginning central cee', {
    maxResults: 2
  });
  console.log(songs[0])
  const song = await songSearcher.extractVideoInfo('https://www.youtube.com/watch?v=O4v1Mwyg-GM');
  //console.log(song)
})();
*/