import { EventEmitter } from 'events';
import { Guild, GuildTextBasedChannel, StageChannel, TextChannel, VoiceBasedChannel, VoiceChannel } from 'discord.js';
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
  AudioPlayerError,
} from '@discordjs/voice';
import prism from 'prism-media';

import { SongSearcher } from './SongSearcher';
import { InitQueueOptions, QueueOptions, Range, Song, AdvancedQueueOptions } from '../utils/Interfaces';
import {
  youTubePattern,
  audioPattern,
  ExtendedAudioPlayerStatus,
  PlayerEvents,
  youTubePlaylistPattern,
  ProgressBarOptions,
  PrismOpusEncoderEvents,
} from '../utils/Constants';

const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const ClientVoiceSettings = {
  deaf: true,
  requestToSpeak: false,
  suppressed: false,

  [Symbol.iterator]: function* () {},

  /**
   * Sets if the client is deaf
   * @param {boolean} state
   * @returns {void}
   */
  setDeaf(state: boolean): void {
    this.deaf = state ?? false;
  },

  /**
   * Generates a speak request if needed
   * @param {boolean} state
   * @returns {void}
   */
  speakRequest(state: boolean): void {
    this.requestToSpeak = state ?? false;
  },

  /**
   * Sets the suppressed option
   * @param {boolean} state
   * @returns {void}
   */
  setSuppressed(state: boolean): void {
    this.suppressed = state ?? false;
  },
};

export declare interface Player extends EventEmitter {
  /**
   * Emitted when a track starts.
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @param {Song} listener
   * @event Player#trackStart
   */
  on(
    event: 'trackStart',
    listener: (channel: TextChannel | GuildTextBasedChannel, song: Song) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when a track is finished.
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @param {Song} listener
   * @event Player#trackFinished
   */
  on(
    event: 'trackFinished',
    listener: (channel: TextChannel | GuildTextBasedChannel, song: Song) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when the music is turned off
   * @param {Guild} listener
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @event Player#pause
   */
  on(
    event: 'pause',
    listener: (guild: Guild, channel: TextChannel | GuildTextBasedChannel) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when the music is turned on
   * @param {Guild} listener
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @event Player#resume
   */
  on(
    event: 'resume',
    listener: (guild: Guild, channel: TextChannel | GuildTextBasedChannel) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when the music is stopped
   * @param {Guild} listener
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @event Player#stop
   */
  on(
    event: 'stop',
    listener: (guild: Guild, channel: TextChannel | GuildTextBasedChannel) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when the client is connected to a voice channel.
   * This event will not be emitted is you used the `assignVoiceConnection()` method.
   * @param {Guild} listener
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @param {VoiceBasedChannel|VoiceChannel} listener
   * @event Player#connected
   */
  on(
    event: 'connected',
    listener: (
      guild: Guild,
      channel: TextChannel | GuildTextBasedChannel,
      voiceChannel: VoiceBasedChannel | VoiceChannel,
    ) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when the client is disconnected to a voice channel.
   * @param {Guild} listener
   * @param {TextChannel|GuildTextBasedChannel} listener
   * @param {VoiceBasedChannel|VoiceChannel} listener
   * @event Player#disconnected
   */
  on(
    event: 'disconnected',
    listener: (
      guild: Guild,
      channel: TextChannel | GuildTextBasedChannel,
      voiceChannel: VoiceBasedChannel | VoiceChannel,
    ) => void | Promise<void> | any,
  ): this;

  /**
   * Emitted when an error occured
   * @param {AudioPlayerError|Error|string|any} listener
   * @event Player#error
   */
  on(event: 'error', listener: (error: AudioPlayerError | Error | string | any) => void | Awaited<void> | any): this;

  /**
   * Emitted when a debug information is communicated by Discord.Js/voice
   * @param {string} listener
   * @event Player#debug
   */
  on(event: 'debug', listener: (msg: string) => void | Awaited<void> | any): this;
}

export class Player extends EventEmitter {
  public clientVoiceSettings: typeof ClientVoiceSettings = ClientVoiceSettings;
  public readonly guild: Guild;
  public readonly options: AdvancedQueueOptions | any;
  private _queue: Map<string, QueueOptions>;
  private _songSearcher: SongSearcher = new SongSearcher();

  /**
   * Creates a new Player.
   * @param {Map<string, QueueOptions>} queue The Musicord queue
   * @param {Guild} guild current guild
   */
  constructor(queue: Map<string, QueueOptions>, guild: Guild, options?: InitQueueOptions) {
    super({
      captureRejections: true,
    });
    if (!queue || queue.constructor !== Map) throw new Error('The queue is required to create a player');
    if (!guild || guild instanceof Guild == false) throw new Error('The guild is required to create a player');
    this._queue = queue;

    /**
     * The current guild
     * @type {Guild}
     */
    this.guild = guild;

    if (options && options.advancedOptions) Object.assign(this.options, options?.advancedOptions);
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
  get isPlaying(): boolean {
    return this._queue.get(this.guild.id)?.playing ?? false;
  }

  /**
   * Gets the queue volume
   * @returns {number}
   */
  get volume(): number {
    return this._queue.get(this.guild.id)?.volume ?? 0.5;
  }

  /**
   * Gets the queue filters
   * @returns {string[]}
   */
  get filters(): string[] {
    return this._queue.get(this.guild.id)?.filters ?? [];
  }

  /**
   * Gets the queue songs
   * @returns {Song[]}
   */
  get queue(): Song[] {
    return this._queue.get(this.guild.id)?.songs ?? [];
  }

  /**
   * Assigns an existing voice connection to the queue.
   * @param {VoiceConnection} connection {@link https://discord.js.org/#/docs/voice/stable/class/VoiceConnection Voice connection}
   * @returns {void}
   */
  public assignVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection === false) throw new TypeError('A voice connection is required to assign it to the queue');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) currentQueue.connection = connection;
  }

  /**
   * Adds a song to the queue.
   * @param {Song|string} song *YT url, custom .mp3 url or searched song*
   * @returns {Promise<void>}
   */
  public async addSong(song: Song | string): Promise<void> {
    if (!song) throw new TypeError('A song is required to add it to the queue');
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
   * Adds playlist songs to the queue
   * Only the first 100 songs will be added.
   * @param {string} url
   * @returns {Promise<void>}
   */
  public async addPlaylist(url: string): Promise<void> {
    if (!url || !url.includes('list') || !youTubePlaylistPattern.test(url)) throw new TypeError('A valid YouTube playlist URL is required to add videos from this playlist to the queue');
    const playlist = await this._songSearcher.fetchPlaylist(url);
    for (const video of playlist) {
      await this.addSong(video.url);
    }
  }

  /**
   * Set the ressource or channel bitrate.
   * Default value is 64000.
   * @param {number} value
   * @returns {void}
   */
  public setBitrate(value?: number): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      if ((value && currentQueue.ressource) || currentQueue.playing)
        currentQueue.ressource?.encoder?.setBitrate(value as number);
      else if (currentQueue.voiceChannel) currentQueue.voiceChannel.bitrate = 64000;
    }
  }

  /**
   * Creates a voice connection if a voice channel is stored in the queue.
   * @returns {void}
   */
  public createVoiceConnection(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && !currentQueue.voiceChannel) return;
    if (currentQueue) {
      currentQueue.connection = joinVoiceChannel({
        channelId: currentQueue.voiceChannel?.id as string,
        guildId: this.guild.id,
        adapterCreator: this.guild.voiceAdapterCreator,
      });
      this.emit(PlayerEvents.Connected, this.guild, currentQueue.textChannel, currentQueue?.voiceChannel);
    }
  }

  /**
   * Adds a filter to the queue.
   * @param {string} filter
   */
  public setFilter(filter: string, applied?: boolean): void {
    if (!filter || typeof filter !== 'string') throw new TypeError('A filter is required to apply it');
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      if (applied === false) {
        if (filter in currentQueue.filters && currentQueue.filters.length > 0)
          currentQueue.filters.slice(currentQueue.filters.indexOf(filter), 1);
      } else {
        if (!currentQueue.filters || currentQueue.filters.length > 0) this.resetFilters();
        currentQueue.filters.push(filter);
      }
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
   * Gets all the queue songs
   * @returns {Song[]|undefined}
   */
  public getSongs(): Song[] | undefined {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) return currentQueue.songs;
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
      this.emit(PlayerEvents.Stop, this.guild, currentQueue.textChannel);
      currentQueue.connection?.destroy();
      this._queue.delete(this.guild.id);
    }
  }

  /**
   * Skips the current song.
   * @returns {void}
   */
  public skip(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      currentQueue.ressource?.audioPlayer?.stop();
    }
  }

  /**
   * Pauses the music.
   * @returns {void}
   */
  public pause(): void {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue && currentQueue.ressource) {
      if (currentQueue.ressource.audioPlayer?.state.status === AudioPlayerStatus.Playing) {
        currentQueue.ressource.audioPlayer?.pause(true);
        this.emit(PlayerEvents.Pause, this.guild, currentQueue.textChannel);
      }
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
      ) {
        currentQueue.ressource.audioPlayer?.unpause();
        this.emit(PlayerEvents.Resume, this.guild, currentQueue.textChannel);
      }
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
    if (!song) throw new TypeError('A song is required to play it');
    let currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      if (currentQueue.playing === true) {
        if (song.toString().includes('list') && youTubePlaylistPattern.test(song as string))
          return this.addPlaylist(song as string);
        else return await this.addSong(typeof song === 'string' ? song : song.url);
      }
      if (!(currentQueue.connection instanceof VoiceConnection)) {
        if (channel || currentQueue.voiceChannel !== undefined) {
          currentQueue.connection = joinVoiceChannel({
            guildId: this.guild.id,
            channelId: (currentQueue.voiceChannel !== undefined ? currentQueue.voiceChannel.id : channel?.id) as string,
            adapterCreator: this.guild.voiceAdapterCreator,
          });
          this.emit(PlayerEvents.Connected, this.guild, currentQueue.textChannel, currentQueue.voiceChannel ?? channel);
        } else return;
      }
      if (song.toString().includes('list') && youTubePlaylistPattern.test(song as string))
        this.addPlaylist(song as string);
      else {
        if (currentQueue.songs === [] || currentQueue.songs[0]?.url !== song)
          await this.addSong(typeof song === 'string' ? song : song.url);
      }
      if (currentQueue.songs.length === 0) return;
      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: ('pause' || 'play') as NoSubscriberBehavior,
        },
      });
      this._setClientVoiceSettings(currentQueue.voiceChannel);
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
      this.emit(PlayerEvents.TrackStart, currentQueue.textChannel, currentQueue.songs[0]);
      this._handleVoiceState(player);
    } else return;
  }

  /**
   * Generates the current song progress bar.
   * @returns {string|undefined}
   */
  public generateSongSlideBar(): string | undefined {
    const currentQueue = this._queue.get(this.guild.id);
    if (currentQueue) {
      return (
        ProgressBarOptions.line
          .repeat(
            Math.round(
              ProgressBarOptions.size *
                ((currentQueue.ressource?.playbackDuration as number) / currentQueue.songs[0].msDuration),
            ),
          )
          .replace(/.$/, ProgressBarOptions.slider) +
        ProgressBarOptions.line.repeat(
          ProgressBarOptions.size -
            Math.round(
              ProgressBarOptions.size *
                ((currentQueue.ressource?.playbackDuration as number) / currentQueue.songs[0].msDuration),
            ),
        )
      );
    }
  }

  /**
   * Sets the client voice settings for the current guild
   * @returns {void}
   * @private
   */
  private _setClientVoiceSettings(voiceChannel: VoiceBasedChannel | undefined): void {
    this.guild.me?.voice.setDeaf(this.clientVoiceSettings.deaf);
    if (voiceChannel?.isStage()) {
      this.guild.me?.voice.setRequestToSpeak(this.clientVoiceSettings.requestToSpeak);
      this.guild.me?.voice.setSuppressed(this.clientVoiceSettings.suppressed);
    }
  }

  /**
   * Awaits player events and handles them.
   * @param {AudioPlayer} player
   * @returns {Promise<void>}
   * @private
   */
  private async _handleVoiceState(player: AudioPlayer): Promise<void> {
    player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
      let currentQueue = this._queue.get(this.guild.id);
      if (oldState.status === AudioPlayerStatus.Playing && newState.status === AudioPlayerStatus.Idle) {
        if (currentQueue) {
          currentQueue.playing = false;
          const lastSong = currentQueue.songs[0];
          currentQueue.songs.shift();
          if (Object.keys(currentQueue.songs).length === 0) {
            currentQueue.connection?.destroy();
            currentQueue.connection = undefined;
            currentQueue.ressource = undefined;
            this.emit(PlayerEvents.Disconnected, this.guild, currentQueue.textChannel);
          } else {
            this.emit(PlayerEvents.TrackFinished, currentQueue.textChannel, lastSong);
            if (this.options && typeof this.options.autoNextSong === 'boolean' && this.options.autoNextSong === false)
              return;
            else return this.play(currentQueue.songs[0].url as string);
          }
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
   * @private
   */
  private _createWritableStream(url: string): NodeJS.WritableStream {
    const FFmpegTranscoder: prism.FFmpeg = new prism.FFmpeg({
      args: this._generateFFmpegArgsSchema(url),
      shell: false,
    });
    const opusEncoder: prism.opus.Encoder = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
    const FFmpegStream = FFmpegTranscoder.pipe(opusEncoder);
    FFmpegStream.on(PrismOpusEncoderEvents.Close, () => {
      FFmpegTranscoder.destroy();
      opusEncoder.destroy();
    });
    FFmpegStream.on(PrismOpusEncoderEvents.Error, (err) => {
      FFmpegTranscoder.destroy();
      try {
        opusEncoder.destroy();
      } catch (encoderErr) {
        this.emit(PlayerEvents.StreamError, encoderErr);
      }
      this.emit(PlayerEvents.Error, String(err.message));
    });
    return FFmpegStream;
  }

  /**
   * Generates FFmpeg args.
   * @param {string} url
   * @returns {string[]}
   * @private
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
