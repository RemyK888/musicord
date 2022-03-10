import { FFmpegAudioFilters } from './FFmpegAudioFilters';

export { version } from '../package.json';

export * from './Musicord';
export const AudioFilters = new FFmpegAudioFilters();