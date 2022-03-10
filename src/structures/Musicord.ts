import ytdl from 'ytdl-core';
import prism from 'prism-media';
import { pipeline } from 'stream';
import { EventEmitter } from 'events';
import { VoiceChannel, StageChannel, Guild, GuildResolvable, Client } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioResource,
} from '@discordjs/voice';

import { InitQueueOptions, MusicordOptions } from '../utils/Interfaces';

async function createWritableStream(url: string): Promise<NodeJS.WritableStream> {
  const songInfo = await ytdl.getInfo(url);
  const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
  return pipeline(
    [
      new prism.FFmpeg({
        args: [
          '-reconnect',
          '1',
          '-reconnect_streamed',
          '1',
          '-reconnect_delay_max',
          '5',
          '-i',
          songInfo.formats[0].url,
          '-analyzeduration',
          '0',
          '-loglevel',
          '0',
          '-f',
          's16le',
          '-ar',
          '48000',
          '-ac',
          '2',
          '-af',
          'superequalizer=1b=1:2b=1:3b=1:4b=1:5b=1:6b=1',
        ],
        shell: false,
      }),
      opus,
    ],
    () => {},
  );
}

export class Musicord extends EventEmitter {
  public client: Client;
  public readonly options: MusicordOptions | {} = {};
  constructor(client: Client, options?: MusicordOptions) {
    super();
    if (!client || client instanceof Client == false) throw new TypeError('');
    if (options && ('ytApiKey' in options || (<MusicordOptions>(<unknown>options)).ytApiKey !== undefined))
      this.options = options;
    this.client = client;
    console.log(this.options);
  }

  public getQueue(guild: Guild | GuildResolvable, options: InitQueueOptions) {}

  public async play(song: string, channel: VoiceChannel | StageChannel | any) {
    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: ('pause' || 'play') as NoSubscriberBehavior,
      },
    });
    const resource = createAudioResource((await createWritableStream('https://youtu.be/O4v1Mwyg-GM')) as any);
    player.play(resource);

    voiceConnection.subscribe(player);
  }
}
