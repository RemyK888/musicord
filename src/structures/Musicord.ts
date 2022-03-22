import { Guild } from 'discord.js';

import { version } from '../../package.json';
import { InitQueueOptions, MusicordOptions, QueueOptions } from '../utils/Interfaces';
import { Player } from './Player';

export class Musicord {
  public readonly options: MusicordOptions | {} = {};
  public readonly queue: Map<string, QueueOptions> = new Map();

  /**
   * Create a new Musicord
   * @param {MusicordOptions} options Musicord options
   */
  constructor(options?: MusicordOptions) {
    Object.assign(this.options, options);
  }

  /**
   * Musicord version
   * @type {string}
   */
  get version(): string {
    return version;
  }

  /**
   * Initializes a new queue if it does not exist.
   * Update the queue if it already exists.
   * @param {Guild} guild
   * @param {InitQueueOptions} options
   * @returns {Player}
   */
  public initQueue(guild: Guild, options: InitQueueOptions): Player {
    if (!guild || guild instanceof Guild === false) throw new TypeError('');
    if (!options || typeof options !== 'object') throw new TypeError('');
    if (!this.existQueue(guild)) this.queue.set(guild.id, this._generateQueueSchema(guild, options));
    else {
      const currentQueue = this.queue.get(guild.id);
      if (options.textChannel !== currentQueue?.textChannel || options.voiceChannel !== currentQueue.voiceChannel)
        this.queue.set(guild.id, this._generateQueueSchema(guild, options));
    }
    return new Player(this.queue, guild, options);
  }

  /**
   * Deletes the queue for this guild
   * @param {Guild} guild The queue guild
   * @returns {void}
   */
  public deleteQueue(guild: Guild): void {
    if (this.existQueue(guild)) this.queue.delete(guild.id);
  }

  /**
   * Chekcks if a queue exists
   * @param {Guild} guild
   * @returns {boolean}
   */
  public existQueue(guild: Guild): boolean {
    return this.queue.has(guild.id);
  }

  /**
   * Gets a specific queue
   * @param {Guild} guild
   * @returns {Player|undefined}
   */
  public getQueue(guild: Guild): Player | undefined {
    if (!guild || guild instanceof Guild == false) throw new TypeError('');
    if (this.existQueue(guild)) return new Player(this.queue, guild);
    else return undefined;
  }

  /**
   * Gets queue infos
   * @param {Guild} guild
   * @returns {QueueOptions|undefined}
   */
  public getQueueInfo(guild: Guild): QueueOptions | undefined {
    return this.queue.get(guild.id);
  }

  /**
   * Generates what will be stored in the queue.
   * @param {Guild} guild
   * @param {InitQueueOptions} options
   * @returns {QueueOptions}
   */
  private _generateQueueSchema(guild: Guild, options: InitQueueOptions): QueueOptions {
    return {
      guild: guild,
      textChannel: options.textChannel,
      voiceChannel: options.voiceChannel ?? undefined,
      connection: null,
      songs: [],
      volume: options.advancedOptions?.volume ?? 0.5,
      playing: false,
      filters: [],
    };
  }
}
