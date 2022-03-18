import { EventEmitter } from 'events';
import { Guild, StageChannel, VoiceChannel } from 'discord.js';
import {
  VoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  AudioPlayer,
  entersState,
} from '@discordjs/voice';
import prism from 'prism-media';
import { pipeline } from 'stream';

import { SongSearcher } from './SongSearcher';
import { QueueOptions, Range, Song } from '../utils/Interfaces';
import { youTubePattern, audioPattern } from '../utils/Constants';

const dwayneTheBlock = () => {};

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

  /**
   * @param {VoiceConnection} connection
   */
  public assignVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection === false) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) currentQueue.connection = connection;
  }

  public async addSong(song: Song | string): Promise<void> {
    if (!song) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.songs) {
      if (typeof song === 'string' && youTubePattern.test(song)) {
        const extractedVideo = await this._songSearcher.extractVideoInfo(song);
        currentQueue.songs.push(extractedVideo);
      } else if (typeof song === 'string' && audioPattern.test(song)) {
        currentQueue.songs.push({
          url: song,
          streamURL: song,
        } as Song);
      } else return;
    }
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
    if (currentQueue) {
      if (!currentQueue.filters) this.resetFilters();
      if (Array.isArray(filter)) currentQueue.filters.push(...filter);
      else currentQueue.filters.push(filter);
    }
  }

  public resetFilters(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) currentQueue.filters = [];
    else return;
  }

  public nextSong(): string | undefined {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.songs && Object.entries(currentQueue.songs).length >= 1) {
      return currentQueue.songs[0].url;
    }
  }

  public stop(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      currentQueue.connection?.destroy();
      currentQueue.playing = false;
      currentQueue.connection = undefined;
      currentQueue.songs = [];
      currentQueue.ressource = undefined;
    }
  }

  public pause(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.ressource) {
      if (currentQueue.ressource.audioPlayer?.state.status === AudioPlayerStatus.Playing)
        currentQueue.ressource.audioPlayer?.pause(true);
    }
  }

  public resume(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.ressource) {
      if (
        currentQueue.ressource.audioPlayer?.state.status === AudioPlayerStatus.Paused ||
        currentQueue.ressource.audioPlayer?.state.status === AudioPlayerStatus.AutoPaused
      )
        currentQueue.ressource.audioPlayer?.unpause();
    }
  }

  public setVolume(volume: Range<0, 101>): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      currentQueue.ressource?.volume?.setVolumeLogarithmic(volume * 2);
      currentQueue.volume = volume;
    }
  }

  public async play(song: Song | string, channel?: VoiceChannel | StageChannel): Promise<void> {
    if (!song) throw new TypeError('');
    let currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      if (currentQueue.playing === true) return await this.addSong(typeof song === 'string' ? song : song.url);
      if (!(currentQueue.connection instanceof VoiceConnection)) {
        if (channel || currentQueue.voiceChannel !== undefined) {
          currentQueue.connection = joinVoiceChannel({
            guildId: this.guild.id,
            channelId: (currentQueue.voiceChannel !== undefined ? currentQueue.voiceChannel.id : channel?.id) as string,
            adapterCreator: this.guild.voiceAdapterCreator,
          });
        } else return;
      }
      if (currentQueue.songs === [] || currentQueue.songs[0]?.url !== song)
        await this.addSong(typeof song === 'string' ? song : song.url);
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: ('pause' || 'play') as NoSubscriberBehavior,
        },
      });
      currentQueue.ressource = createAudioResource(this._createWritableStream(currentQueue.songs[0].streamURL) as any, {
        inputType: 'opus' as StreamType,
        inlineVolume: true,
      });
      currentQueue.ressource.volume?.setVolumeLogarithmic(currentQueue.volume * 2);
      currentQueue.connection?.subscribe(player);
      player.play(currentQueue.ressource);
      console.log(currentQueue.ressource?.encoder);
      currentQueue.playing = true;
      try {
        await entersState(player, AudioPlayerStatus.Playing, 5000);
      } catch (error) {
        throw new Error(error as string);
      }
      this._handleVoiceState(player);
    }
  }

  private _handleVoiceState(player: AudioPlayer) {
    player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
      let currentQueue = this._queue.get(this.guild.id);
      if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
        if (currentQueue) {
          currentQueue.playing = false;
          currentQueue.songs.shift();
          if (Object.keys(currentQueue.songs).length === 0) {
            currentQueue.connection?.destroy();
            currentQueue.connection = undefined;
            currentQueue.ressource = undefined;
          } else return this.play(currentQueue.songs[0].url as string);
        }
      }
    });
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
      dwayneTheBlock,
    );
  }

  private _generateFFmpegArgsSchema(url: string): string[] {
    const FFmpegArgs = ['-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_delay_max', '5'];
    FFmpegArgs.push('-i', url, '-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.filters) {
      for (const filter of currentQueue.filters) {
        FFmpegArgs.push('-af', filter);
      }
    }
    return FFmpegArgs;
  }
}
