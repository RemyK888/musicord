import { Channel } from 'discord.js';

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

export interface InitQueueOptions {
  channel: Channel;
  advancedOptions: any;
}

type Ran<T extends number> = number extends T ? number : Range<T, []>;
type Range<T extends number, R extends unknown[]> = R['length'] extends T ? R[number] : Range<T, [R['length'], ...R]>;

export interface FFmpegCustomEqualizerOptions {
  band1?: Ran<101>;
  band2?: Ran<101>;
  band3?: Ran<101>;
  band4?: Ran<101>;
  band5?: Ran<101>;
  band6?: Ran<101>;
  band7?: Ran<101>;
  band8?: Ran<101>;
  band9?: Ran<101>;
  band10?: Ran<101>;
}
