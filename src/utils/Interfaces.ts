import { VoiceConnection } from '@discordjs/voice';
import { Channel, VoiceChannel, ThreadChannel, AnyChannel, Guild, VoiceBasedChannel, StageChannel } from 'discord.js';

export interface MusicordOptions {
  ytApiKey: string;
}

export interface CommandOptions {
  implemented: boolean;
  description: string;
  options?: {
    name: string;
    description: string;
    type: number;
    required?: boolean;
  };
}

export interface ApplicationCommandSchemaOptions {
  play?: CommandOptions;
  pause?: CommandOptions;
}

type DJSSlashCommandsType = 'STRING' | 'BOOLEAN' | 'NUMBER' | 'CHANNEL';

export interface DJSApplicationCommandSchema {
  name: string;
  description: string;
  options?: {
    name?: string;
    type?: DJSSlashCommandsType | any;
    description?: string;
    required?: boolean;
  }[];
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;
export type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export interface InitQueueOptions {
  textChannel: Channel | ThreadChannel | AnyChannel;
  voiceChannel?: VoiceBasedChannel | VoiceChannel | StageChannel;
  advancedOptions?: {
    volume?: Range<0, 101>;
  };
}

export interface FFmpegCustomEqualizerOptions {
  band1?: Range<0, 101>;
  band2?: Range<0, 101>;
  band3?: Range<0, 101>;
  band4?: Range<0, 101>;
  band5?: Range<0, 101>;
  band6?: Range<0, 101>;
  band7?: Range<0, 101>;
  band8?: Range<0, 101>;
  band9?: Range<0, 101>;
  band10?: Range<0, 101>;
}

interface Song {}

export interface QueueOptions {
  guild?: Guild;
  textChannel?: Channel | ThreadChannel | AnyChannel;
  voiceChannel?: VoiceBasedChannel | VoiceChannel | StageChannel;
  connection?: VoiceConnection | null;
  songs?: Song[];
  volume?: number;
  playing?: boolean;
}