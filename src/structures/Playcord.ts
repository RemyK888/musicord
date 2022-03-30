import { Guild } from 'discord.js';

import { version } from '../../package.json';
import { InitQueueOptions, PlaycordOptions, QueueOptions } from '../utils/Interfaces';
import { Player } from './Player';

export class Playcord {
  public readonly options: PlaycordOptions | {} = {};
  public readonly queue: Map<string, QueueOptions> = new Map();

  /**
   * Create a new Playcord
   * @param {PlaycordOptions} options Playcord options
   */
  constructor(options?: PlaycordOptions) {
    Object.assign(this.options, options);
  }

  /**
   * Playcord version
   * @type {string}
   */
  get version(): string {
    return version;
  }

  /**
   * Initializes a new queue if it does not exist.
   * Update the queue if it already exists.
   * @param {Guild} guild Message guild
   * @param {InitQueueOptions} options Options to init queue *(required)*
   * @returns {Player} An audio player
   */
  public initQueue(guild: Guild, options: InitQueueOptions): Player {
    if (!guild || guild instanceof Guild === false) throw new TypeError('A Guild is required to initialize a queue');
    if (!options || typeof options !== 'object') throw new TypeError('Some options are required to initialize a queue');
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
   * @returns {void} Void
   */
  public deleteQueue(guild: Guild): void {
    if (this.existQueue(guild)) this.queue.delete(guild.id);
  }

  /**
   * Chekcks if a queue exists
   * @param {Guild} guild The queue guild
   * @returns {boolean} Boolean
   */
  public existQueue(guild: Guild): boolean {
    return this.queue.has(guild.id);
  }

  /**
   * Gets a specific queue
   * @param {Guild} guild The queue guild
   * @returns {Player|undefined} Player|undefined
   */
  public getQueue(guild: Guild): Player | undefined {
    if (!guild || guild instanceof Guild == false) throw new TypeError('A Guild is required to initialize a queue');
    if (this.existQueue(guild)) return new Player(this.queue, guild);
    else return undefined;
  }

  /**
   * Gets queue infos
   * @param {Guild} guild The queue guild
   * @returns {QueueOptions|undefined} QueueOptions|undefined
   */
  public getQueueInfo(guild: Guild): QueueOptions | undefined {
    return this.queue.get(guild.id);
  }

  /**
   * Generates what will be stored in the queue.
   * @param {Guild} guild The queue guild
   * @param {InitQueueOptions} options Options to init the queue
   * @returns {QueueOptions} QueueOptions
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
