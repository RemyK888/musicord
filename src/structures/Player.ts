import { EventEmitter } from 'events';
import { Guild, StageChannel, VoiceChannel } from 'discord.js';
import {
  VoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from '@discordjs/voice';
import prism from 'prism-media';
import { pipeline } from 'stream';

import { SongSearcher } from './SongSearcher';
import { QueueOptions, Song } from '../utils/Interfaces';
import { youTubePattern, audioPattern, DefaultFFmpegArgs } from '../utils/Constants';

export class Player extends EventEmitter {
  public guild: Guild;
  private _queue: Map<string, QueueOptions>;
  private _songSearcher: SongSearcher = new SongSearcher();
  constructor(queue: Map<string, QueueOptions>, guild: Guild) {
    super();
    if (!queue || queue.constructor !== Map) throw new Error('');
    if (!guild || guild instanceof Guild == false) throw new Error('');
    this._queue = queue;
    this.guild = guild;
  }

  public assignVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection === false) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) currentQueue.connection = connection;
  }

  public addSong(song: Song) {
    this._queue.get(this.guild.id)?.songs?.push(song);
  }

  public createVoiceConnection(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && !currentQueue.voiceChannel) return;
    if (currentQueue)
      currentQueue.connection = joinVoiceChannel({
        channelId: currentQueue.voiceChannel?.id as string,
        guildId: this.guild.id,
        adapterCreator: this.guild.voiceAdapterCreator,
      });
  }

  public setFilter(filter: string | string[]): void {
    if (!filter || (typeof filter !== 'string' && filter instanceof Array === false)) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.filters && typeof filter === 'string') {
      if (Array.isArray(filter)) currentQueue.filters?.push(...filter);
      else currentQueue.filters.push(filter);
    } else if (currentQueue) {
      currentQueue.filters = [];
      return this.setFilter(filter);
    }
  }

  public async play(song: Song | string, channel?: VoiceChannel | StageChannel) {
    if (!song) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue?.connection === (null || undefined) && !channel && !currentQueue?.voiceChannel) return;
    if (currentQueue && !currentQueue.connection)
      currentQueue.connection = joinVoiceChannel({
        channelId: currentQueue.voiceChannel?.id as string,
        guildId: this.guild.id,
        adapterCreator: this.guild.voiceAdapterCreator,
      });
    let extractedSongStreamURL: string = '';
    if (typeof song === 'string' && youTubePattern.test(song)) {
      const extractedVideo = await this._songSearcher.extractVideoInfo(song);
      extractedSongStreamURL = extractedVideo.streamURL;
      currentQueue?.songs?.push(extractedVideo);
    } else if (typeof song === 'string' && audioPattern.test(song)) {
      extractedSongStreamURL = song;
      currentQueue?.songs?.push({
        url: extractedSongStreamURL,
      } as Song);
    } else return;
    const voiceConnection = this._queue.get(this.guild.id)?.connection;
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: ('pause' || 'play') as NoSubscriberBehavior,
      },
    });
    const resource = createAudioResource(this._createWritableStream(extractedSongStreamURL) as any, {
      inputType: 'opus' as StreamType,
    });
    voiceConnection?.subscribe(player);
    player.play(resource);
  }

  private _createWritableStream(url: string): NodeJS.WritableStream {
    const opusEncoder = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
    return pipeline(
      [
        new prism.FFmpeg({
          args: this._generateFFmpegArgsSchema(url),
          shell: false,
        }),
        opusEncoder,
      ],
      () => {},
    );
  }

  private _generateFFmpegArgsSchema(url: string, FFmpegArgs = DefaultFFmpegArgs): string[] {
    FFmpegArgs.push('-i', url, '-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2');
    const currentQueue = this._queue.get(this.guild.id);
    console.log(currentQueue);
    if (currentQueue && currentQueue.filters) {
      for (const filter of currentQueue.filters) {
        FFmpegArgs.push('-af', filter);
      }
    }
    return FFmpegArgs;
  }
}
