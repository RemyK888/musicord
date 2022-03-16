import { Guild, Client } from 'discord.js';

import { InitQueueOptions, MusicordOptions, QueueOptions } from '../utils/Interfaces';
import { Player } from './Player';

export class Musicord {
  public readonly client: Client;
  public readonly options: MusicordOptions | {} = {};
  public readonly queue: Map<string, QueueOptions> = new Map();

  /**
   * Create a new Musicord
   * @param {Client} client [Discord.Js client ](https://discord.js.org/#/docs/discord.js/stable/class/Client)
   * @param {MusicordOptions} options Musicord options
   */
  constructor(client: Client, options?: MusicordOptions) {
    if (!client || client instanceof Client === false) throw new TypeError('');
    if (options && ('ytApiKey' in options || (<MusicordOptions>(<unknown>options)).ytApiKey !== undefined))
      this.options = options;
    this.client = client;
    console.log(this.options);
  }

  public initQueue(guild: Guild, options: InitQueueOptions): Player {
    if (!guild || guild instanceof Guild === false) throw new TypeError('');
    if (!options || typeof options !== 'object') throw new TypeError('');
    if (!this.queue.get(guild.id))
      this.queue.set(guild.id, {
        guild: guild,
        textChannel: options.textChannel,
        voiceChannel: options.voiceChannel,
        connection: null,
        songs: [],
        volume: options.advancedOptions?.volume ?? 0.5,
        playing: false,
        filters: []
      });
    else {
      const currentQueue = this.queue.get(guild.id);
      if (options.textChannel !== currentQueue?.textChannel || options.voiceChannel !== currentQueue.voiceChannel)
        this.queue.set(guild.id, {
          guild: guild,
          textChannel: options.textChannel,
          voiceChannel: options.voiceChannel,
          connection: null,
          songs: currentQueue?.songs ?? [],
          volume:
            typeof currentQueue?.volume !== 'undefined' ? currentQueue.volume : options.advancedOptions?.volume ?? 0.5,
          playing: false,
          filters: currentQueue?.filters ?? [],
        });
    }
    return new Player(this.queue, guild);
  }

  public getQueue(guild: Guild): QueueOptions | undefined {
    if (!guild || guild instanceof Guild == false) throw new TypeError('');
    return this.queue.get(guild.id);
  }
}
