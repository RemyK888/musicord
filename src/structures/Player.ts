import { VoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Guild } from 'discord.js';
import { QueueOptions } from '../utils/Interfaces';

export class Player {
  public guild: Guild;
  private queue: Map<string, QueueOptions>;
  constructor(queue: Map<string, QueueOptions>, guild: Guild) {
    if (!queue || queue.constructor !== Map) throw new Error('');
    if (!guild || guild instanceof Guild == false) throw new Error('');
    this.queue = queue;
    this.guild = guild;
  }

  public subscribeVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection == false) throw new TypeError('');
    this.queue.set(this.guild.id, {
      connection: connection,
    });
  }

  public createVoiceConnection(): void {
    const serverQueue = this.queue.get(this.guild.id);
    joinVoiceChannel({
      channelId: serverQueue?.voiceChannel?.id as string,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
    });
  }

  public play() {}
}
