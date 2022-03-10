import { FFmpegCustomEqualizerOptions } from '../utils/Interfaces';

export class FFmpegAudioFilters {
  get ultraBassBoost(): string {
    return 'asubboost=dry=1:wet=1';
  }

  get rotatingAudio(): string {
    return 'apulsator=hz=0.09';
  }

  get mono(): string {
    return 'pan=1c|c0=0.9*c0+0.1*c1';
  }

  get extraStereo(): string {
    return 'extrastereo';
  }

  get vibrato(): string {
    return 'vibrato';
  }

  get reverse(): string {
    return 'areverse';
  }

  get flanger(): string {
    return 'flanger';
  }

  public pingPongDelay(value: number) {
    if (!value || typeof value !== 'number') throw new TypeError('');
    return `adelay=${value}|0|${Math.round(value / 3)}`;
  }

  public speed(value: number): string {
    if (!value || !this.isBetween(value, 50, 1000)) throw new TypeError('');
    return `atempo${value / 100}`;
  }

  public tremolo(value: number): string {
    if (!value || !this.isBetween(value, 0.1, 20000)) throw new TypeError('');
    return `tremolo${value}`;
  }

  public volume(value: number): string {
    if (!value || typeof value !== 'number') throw new TypeError('');
    return `volume=volume=${value}`;
  }

  public customEqualizer(options: FFmpegCustomEqualizerOptions): string {
    if (!options || (typeof options !== 'object' && Object.getPrototypeOf(options) == Object.prototype))
      throw new TypeError('');
    let toReturn = 'superequalizer=';
    for (const [band, gain] of Object.entries(Object(options)))
      toReturn += `${
        Number(String(band).replace('band', '')) == 1
          ? '1b=' + Number(gain) / 100 + ':'
          : Number(String(band).replace('band', '')) * 2 -
            String(band).replace('band', '').length +
            'b=' +
            Number(gain) / 100 +
            ':'
      }`;
    return toReturn.slice(0, -1);
  }

  public customFilter(filter: string): string {
    if (!filter || typeof filter !== 'string') throw new TypeError('');
    return filter;
  }

  /**
   * Check if a value is within a range of numbers
   * @param {number} n The number to check
   * @param {number} min The min number
   * @param {number} max The max number
   * @returns {boolean}
   * @private
   */
  private isBetween(n: number | any, min: number, max: number): boolean {
    return n >= min && n <= max;
  }
}
