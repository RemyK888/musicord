import { Channel } from "discord.js";

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
  channel: Channel,
  advancedOptions: any;
}

export interface FFmpegCustomEqualizerOptions {
  bands: number
}
