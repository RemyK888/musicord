import { FFmpegAudioFilters } from './structures/FFmpegAudioFilters';

export { version } from '../package.json';

export * from './structures/Musicord';
export const AudioFilters = new FFmpegAudioFilters();
