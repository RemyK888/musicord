import { Guild, StageChannel, VoiceChannel } from 'discord.js';
import { VoiceConnection, joinVoiceChannel, NoSubscriberBehavior, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import prism from 'prism-media';
import { pipeline } from 'stream';

import { QueueOptions } from '../utils/Interfaces';

export class Player {
  public guild: Guild;
  public filters: string[] = [];
  private queue: Map<string, QueueOptions>;
  constructor(queue: Map<string, QueueOptions>, guild: Guild) {
    if (!queue || queue.constructor !== Map) throw new Error('');
    if (!guild || guild instanceof Guild == false) throw new Error('');
    this.queue = queue;
    this.guild = guild;
  }

  public assignVoiceConnection(connection: VoiceConnection): void {
    if (!connection || connection instanceof VoiceConnection == false) throw new TypeError('');
    this.queue.set(this.guild.id, {
      connection: connection
    });
  }

  public addSong(song: string) {
    this.queue.get(this.guild.id)?.songs?.push(song);
  }

  public createVoiceConnection(): void {
    const serverQueue = this.queue.get(this.guild.id);
    const voiceConnection = joinVoiceChannel({
      channelId: serverQueue?.voiceChannel?.id as string,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
    });
    this.queue.set(this.guild.id, {
      connection: voiceConnection
    });
  } 

  public setFilter(filter: string | string[]) { 
    if(!filter) throw new TypeError('');
  }

  public async play(song: string, channel: VoiceChannel | StageChannel) {
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
    const resource = createAudioResource((await this.createWritableStream('https://youtu.be/O4v1Mwyg-GM')) as any);
    player.play(resource);

    voiceConnection.subscribe(player);
  }

  private async createWritableStream(url: string): Promise<NodeJS.WritableStream> {
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
}
