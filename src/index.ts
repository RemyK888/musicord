import { FFmpegAudioFilters } from './structures/FFmpegAudioFilters';

export { version } from '../package.json';

export * from './structures/Musicord';
export * from './structures/SongSearcher';
export const AudioFilters = new FFmpegAudioFilters();
