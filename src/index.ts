import { FFmpegAudioFilters } from './structures/FFmpegAudioFilters';

export { version } from '../package.json';

export * from './structures/Musicord';
export * from './structures/SongSearcher';
export * from './structures/ApplicationCommandSchema';

export const AudioFilters = new FFmpegAudioFilters();

export * from './structures/Player';

export * from './utils/Constants';
export * from './utils/Interfaces';
