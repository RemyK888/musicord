import { Guild, StageChannel, VoiceChannel } from 'discord.js';
import {
  VoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import prism from 'prism-media';
import { pipeline } from 'stream';

import { QueueOptions, Song } from '../utils/Interfaces';
import { youTubePattern } from '../utils/Constants';

export class Player {
  public guild: Guild;
  public filters: string[] = [];
  private _queue: Map<string, QueueOptions>;
  constructor(queue: Map<string, QueueOptions>, guild: Guild) {
    if (!queue || queue.constructor !== Map) throw new Error('');
    if (!guild || guild instanceof Guild == false) throw new Error('');
    this._queue = queue;
    this.guild = guild;
  }

  public assignVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection == false) throw new TypeError('');
    this._queue.set(this.guild.id, {
      connection: connection,
    });
  }

  public addSong(song: Song) {
    this._queue.get(this.guild.id)?.songs?.push(song);
  }

  public createVoiceConnection(): void {
    const serverQueue = this._queue.get(this.guild.id);
    const voiceConnection = joinVoiceChannel({
      channelId: serverQueue?.voiceChannel?.id as string,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
    });
    this._queue.set(this.guild.id, {
      connection: voiceConnection,
    });
  }

  public setFilter(filter: string | string[]): void {
    if (!filter || (typeof filter !== 'string' && filter instanceof Array === false)) throw new TypeError('');
    if (Array.isArray(filter)) this.filters.push(...filter);
    else this.filters.push(filter);
  }

  public async play(song: string | Song, channel: VoiceChannel | StageChannel) {
    if (!song) throw new TypeError('');
    if (typeof song === 'string' && youTubePattern.test(song)) {
    }
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
    const resource = createAudioResource((await this._createWritableStream('https://youtu.be/O4v1Mwyg-GM')) as any, {
      inputType: 'opus' as StreamType,
    });
    voiceConnection.subscribe(player);
    player.play(resource);
  }

  private async _createWritableStream(url: string): Promise<NodeJS.WritableStream> {
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
            url,
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
}
