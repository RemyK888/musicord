import { FFmpegAudioFilters } from './structures/FFmpegAudioFilters';

export { version } from '../package.json';

export * from './structures/Musicord';
export * from './structures/SongSearcher';
export * from './structures/ApplicationCommandSchema';

export const AudioFilters = new FFmpegAudioFilters();

export * from './structures/Player';

export * as Constants from './utils/Constants';
export * as Interfaces from './utils/Interfaces';
