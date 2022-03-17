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
  }
});

const rest = new REST({ version: '10' }).setToken('NzU3MTQzOTIzODM4OTQzMzE0.X2cHOg.8TmOwUm8lWJUYP7e88oLNjiMDhk');

(async () => {
  try {
    console.log('Started refreshing application [/] commands.');

    await rest.put(
      Routes.applicationGuildCommands('757143923838943314', '715924331682594959'),
      { body: commandsSchema.extract() },
    )

    console.log('Successfully reloaded application [/] commands.');
  } catch (error) {
    console.error(error);
  }
})();



import { AnyChannel, Client, Guild } from 'discord.js';

import { Musicord, AudioFilters } from '../src/index';

const client = new Client({
  intents: 32767
})

const musicordPlayer = new Musicord(client, {
  ytApiKey: 'dfgdfg'
});

// @ts-ignore
client.on('interactionCreate', async (interaction) => {
  if(interaction && interaction.isCommand()) {
    if(interaction.commandName === 'play') {
      const msgArgs = interaction.options.get('lien')?.value
      if(!msgArgs) return interaction.reply('Pas d\'argument inséré');
      // @ts-ignore
      const msgMember = interaction.guild.members.cache.get(interaction.member.user.id);
      // @ts-ignore
      if(msgMember && msgMember.voice.channel) {
        if (musicordPlayer.existQueue(interaction.guild as Guild)) {
          const queue = musicordPlayer.getQueue(interaction.guild as Guild);
          if(queue) await queue.play(msgArgs as any, msgMember.voice.channel);
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild as Guild);
          if(queueInfo) interaction.reply(`En train de jouer ${queueInfo.songs[0].title}`)
        } else {
          const queue = musicordPlayer.initQueue(interaction.guild as Guild, {
            textChannel: interaction.channel as AnyChannel,
            voiceChannel: msgMember.voice.channel
          })
          if(queue) await queue.play(msgArgs as any, msgMember.voice.channel)
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild as Guild);
          if(queueInfo) interaction.reply(`En train de jouer ${queueInfo.songs[0].title}`)
        }
      }
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


client.login('NzU3MTQzOTIzODM4OTQzMzE0.X2cHOg.8TmOwUm8lWJUYP7e88oLNjiMDhk')

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