/*import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';


import { ApplicationCommandSchema } from '../src/ApplicationCommandSchema';

const commandsSchema = new ApplicationCommandSchema({
  play: {
    description: 'ssfdf',
    implemented: true,
    options: {
      name: 'coucou',
      description: 'dsfgfgdgf',
      required: true,
      type: 3
    }
  }
});

const rest = new REST({ version: '10' }).setToken('NzU3MTQzOTIzODM4OTQzMzE0.X2cHOg.EZy3srHnox8gAkdrnB7C8ZJubxA');

(async () => {
  try {
    console.log('Started refreshing application [/] commands.');

    await rest.put(
      Routes.applicationGuildCommands('757143923838943314', '835896457018081300'),
      { body: commandsSchema.extract() },
    )

    console.log('Successfully reloaded application [/] commands.');
  } catch (error) {
    console.error(error);
  }
})();

*/

import { Client } from 'discord.js';

import { Musicord, AudioFilters } from '../src/index';

const client = new Client({
  intents: 32767
})

const musicordPlayer = new Musicord(client, {
  ytApiKey: 'dfgdfg'
});

//import AudioFilters from '../src/FFmpegAudioFilters';

console.log(AudioFilters.customEqualizer({
  band1: 99,
  band2: 45,
  band3: 54,
  band4: 53,
  band5: 52,
  band6: 51,
  band7: 50,
  band8: 49,
  band9: 48,
  band10: 47,
}))

client.on('messageCreate', (message) => {
  if(message.content === '!play') {
    //musicordPlayer.play('sdfsdf', message.member?.voice.channel);
    if(message.guild && message.member && message.member.voice.channel) {
      const queue = musicordPlayer.initQueue(message.guild, {
        textChannel: message.channel,
        voiceChannel: message.member.voice.channel
      })
      queue.setFilter(AudioFilters.rotatingAudio);
      queue.play('https://www.youtube.com/watch?v=wBRsDOjcye4', message.member.voice.channel);
    }
  }
})


client.login('NzI2NTEwNjE3MDQ5MTcwMDAx.XveVvQ.12etQbBLG4oes2U1fE8sUTgXg_w')

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