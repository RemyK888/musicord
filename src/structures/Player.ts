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
import { InitQueueOptions, QueueOptions, Range, Song } from '../utils/Interfaces';
import {
  youTubePattern,
  audioPattern,
  ExtendedAudioPlayerStatus,
  PlayerEvents,
  youTubePlaylistPattern,
} from '../utils/Constants';

export class Player extends EventEmitter {
  public guild: Guild;
  private _queue: Map<string, QueueOptions>;
  private _songSearcher: SongSearcher = new SongSearcher();

  /**
   * Creates a new Player.
   * @param {Map<string, QueueOptions>} queue The Musicord queue
   * @param {Guild} guild current guild
   */
  constructor(queue: Map<string, QueueOptions>, guild: Guild, options?: InitQueueOptions) {
    super();
    if (!queue || queue.constructor !== Map) throw new Error('');
    if (!guild || guild instanceof Guild == false) throw new Error('');
    this._queue = queue;

    /**
     * The current guild
     * @type {Guild}
     */
    this.guild = guild;

    const currentQueue = this._queue.get(guild.id);
    if (options && options.advancedOptions?.autoJoin === true && currentQueue?.voiceChannel !== null) {
      try {
        this.createVoiceConnection();
      } catch (err) {
        this.emit(PlayerEvents.Error, err);
      }
    }
  }

  /**
   * Checks if the bot is currently playing
   * @returns {boolean}
   */
  public isPlaying(): boolean {
    return this._queue.get(this.guild.id)?.playing ?? false;
  }

  /**
   * Assigns an existing voice connection to the queue.
   * @param {VoiceConnection} connection {@link https://discord.js.org/#/docs/voice/stable/class/VoiceConnection The voice connection}
   * @returns {void}
   */
  public assignVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection === false) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) currentQueue.connection = connection;
  }

  /**
   * Adds a song to the queue.
   * @param {Song|string} song *YT url, custom .mp3 url or searched song*
   * @returns {Promise<void>}
   */
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

  /**
   * Creates a voice connection if a voice channel is stored in the queue.
   * @returns {void}
   */
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

  /**
   * Adds one or more filters to the queue.
   * @param {string|string[]} filter
   */
  public setFilter(filter: string | string[]): void {
    if (!filter || (typeof filter !== 'string' && filter instanceof Array === false)) throw new TypeError('');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      if (!currentQueue.filters) this.resetFilters();
      if (Array.isArray(filter)) currentQueue.filters.push(...filter);
      else currentQueue.filters.push(filter);
    }
  }

  /**
   * Resets the filters.
   * @returns {void}
   */
  public resetFilters(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) currentQueue.filters = [];
    else return;
  }

  /**
   * Gets the next song url.
   * @returns {string|undefined}
   */
  public nextSong(): string | undefined {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.songs && Object.entries(currentQueue.songs).length >= 1) {
      return currentQueue.songs[0].url;
    }
  }

  /**
   * Stops the music, resets the queue, and destroys the voice connection.
   * @returns {void}
   */
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

  /**
   * Pauses the music.
   * @returns {void}
   */
  public pause(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.ressource) {
      if (currentQueue.ressource.audioPlayer?.state.status === AudioPlayerStatus.Playing)
        currentQueue.ressource.audioPlayer?.pause(true);
    }
  }

  /**
   * Resumes the music *(if paused)*.
   * @returns {void}
   */
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

  /**
   * Sets the volumesof the queue.
   * Changes the volume immediately if playing.
   * @param {Range<0, 101>} volume
   */
  public setVolume(volume: Range<0, 101>): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      currentQueue.ressource?.volume?.setVolumeLogarithmic(volume);
      currentQueue.volume = volume;
    }
  }

  /**
   * Shuffles the queue
   * @returns {void}
   */
  public shuffleQueue(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && Object.keys(currentQueue.songs).length > 0) {
      const shuffledQueue = currentQueue.songs.slice();
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [shuffledQueue[i], shuffledQueue[rand]] = [shuffledQueue[rand], shuffledQueue[i]];
      }
      currentQueue.songs = shuffledQueue;
    }
  }

  /**
   * Plays a song.
   * @param {Song|string} song
   * @param {VoiceChannel|StageChannel} channel
   * @returns {Promise<void>}
   */
  public async play(song: Song | string, channel?: VoiceChannel | StageChannel): Promise<void> {
    if (!song) throw new TypeError('');
    let currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      if (currentQueue.playing === true) {
        if (youTubePlaylistPattern.test(song as string)) {
          const playlist = await this._songSearcher.fetchPlaylist(song as string);
          for (const i of playlist) {
            await this.addSong(i.url);
          }
          return;
        } else {
          return await this.addSong(typeof song === 'string' ? song : song.url);
        }
      }
      if (!(currentQueue.connection instanceof VoiceConnection)) {
        if (channel || currentQueue.voiceChannel !== undefined) {
          currentQueue.connection = joinVoiceChannel({
            guildId: this.guild.id,
            channelId: (currentQueue.voiceChannel !== undefined ? currentQueue.voiceChannel.id : channel?.id) as string,
            adapterCreator: this.guild.voiceAdapterCreator,
          });
        } else return;
      }
      if (youTubePlaylistPattern.test(song as string)) {
        const playlist = await this._songSearcher.fetchPlaylist(song as string);
        for await (const i of playlist) {
          await this.addSong(i.url);
        }
      } else {
        if (currentQueue.songs === [] || currentQueue.songs[0]?.url !== song)
          await this.addSong(typeof song === 'string' ? song : song.url);
      }
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: ('pause' || 'play') as NoSubscriberBehavior,
        },
      });
      currentQueue.ressource = createAudioResource(this._createWritableStream(currentQueue.songs[0].streamURL) as any, {
        inputType: 'opus' as StreamType,
        inlineVolume: true,
      });
      currentQueue.ressource.volume?.setVolumeLogarithmic(currentQueue.volume);
      currentQueue.connection?.subscribe(player);
      player.play(currentQueue.ressource);
      currentQueue.playing = true;
      try {
        await entersState(player, AudioPlayerStatus.Playing, 5000);
      } catch (error) {
        throw new Error(error as string);
      }
      this._handleVoiceState(player);
    }
  }

  /**
   * Awaits player events and handles them.
   * @param {AudioPlayer} player
   * @returns {Promise<void>}
   */
  private async _handleVoiceState(player: AudioPlayer): Promise<void> {
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
    player.on(ExtendedAudioPlayerStatus.Error, (err) => {
      this.emit(PlayerEvents.Error, String(err.message));
    });
    player.on(ExtendedAudioPlayerStatus.Debug, (msg) => {
      this.emit(PlayerEvents.Debug, msg);
    });
  }

  /**
   * Creates a writable stream.
   * @param {string} url
   * @returns {NodeJS.WritableStream}
   */
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

  /**
   * Generates FFmpeg args.
   * @param {string} url
   * @returns {string[]}
   */
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
