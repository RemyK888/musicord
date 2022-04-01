import { FFmpegCustomEqualizerOptions } from '../utils/Interfaces';

export class FFmpegAudioFilters {
  /**
   * 8D audio
   * @type {string}
   */
  get rotatingAudio(): string {
    return 'apulsator=hz=0.09';
  }

  /**
   * Mono
   * @type {string}
   */
  get mono(): string {
    return 'pan=1c|c0=0.9*c0+0.1*c1';
  }

  /**
   * Augmented stereo
   * @type {string}
   */
  get extraStereo(): string {
    return 'extrastereo';
  }

  /**
   * Vibrato
   * @type {string}
   */
  get vibrato(): string {
    return 'vibrato';
  }

  /**
   * Play the sound in reverse
   * @type {string}
   */
  get reverse(): string {
    return 'areverse';
  }

  /**
   * Flanger
   * @type {string}
   */
  get flanger(): string {
    return 'flanger';
  }

  /**
   * 3D audio
   * @type {string}
   */
  get chorus(): string {
    return 'chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3';
  }

  /**
   * Right then left delay
   * @param {number} value The delay time **in seconds**
   * @returns {string}
   */
  public pingPongDelay(value: number): string {
    if (!value || typeof value !== 'number') throw new TypeError('The time limit as a number is required');
    return `adelay=${Math.round(value * 100)}|0|${Math.round((value * 100) / 3)}`;
  }

  /**
   * Speed sup/down the music
   * @param {number} value The speed value *(between 50% and 1000%)*
   * @returns {string}
   */
  public speed(value: number): string {
    if (!value || !this._isBetween(value, 50, 1000))
      throw new TypeError('A value between 50 and 1000 is required for the speed');
    return `atempo${value / 100}`;
  }

  /**
   * basSSssS goes bRRRRR
   * @param {number} amount Boost intensity
   * @returns {string}
   * @example
   * queue.setFilters(AudioFilters.bassBoost(20));
   */
  public bassBoost(amount: number): string {
    if (!amount || typeof amount !== 'number')
      throw new TypeError('A numerical value is expected in order to generate the filter');
    return `bass=g=${amount}:f=110:w=0.3`;
  }

  /**
   * tRRrrrRRRRemolo
   * @param {number} value Tremolo intensity *(between 0.1 and 20000)*
   * @returns {string}
   */
  public tremolo(value: number): string {
    if (!value || !this._isBetween(value, 0.1, 20000))
      throw new TypeError('The tremolo intensity, between 0.1 and 20000 is required');
    return `tremolo${value}`;
  }

  /**
   * Sets the volume (FFmpeg filter, not Discord bot volume)
   * @param {number} value The volume (no limit)
   * @returns {number}
   */
  public volume(value: number): string {
    if (!value || typeof value !== 'number') throw new TypeError('Volume as a number is required');
    return `volume=volume=${value}`;
  }

  /**
   * 10 band equalizer
   * @param {FFmpegCustomEqualizerOptions} options At least 1 band is required **(percentage)**
   * @returns {string}
   * @example
   * AudioFilters.customEqualizer({
   *    band1: 99,
   *    band2: 45,
   *    band3: 54,
   *    band4: 53,
   *    band5: 52,
   *    band6: 51,
   *    band7: 50,
   *    band8: 49,
   *    band9: 48,
   *    band10: 47,
   * })
   */
  public customEqualizer(options: FFmpegCustomEqualizerOptions): string {
    if (!options || (typeof options !== 'object' && Object.getPrototypeOf(options) == Object.prototype))
      throw new TypeError('At least one band of the equalizer is required.');
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

  /**
   * Adds a custom filter
   * @param {string} filter The filter
   * @returns {string}
   */
  public customFilter(filter: string): string {
    if (!filter || typeof filter !== 'string') throw new TypeError('A textual value is required');
    return filter;
  }

  /**
   * Checks if a value is within a range of numbers
   * @param {number} n The number to check
   * @param {number} min The min number
   * @param {number} max The max number
   * @returns {boolean}
   * @private
   */
  private _isBetween(n: number | any, min: number, max: number): boolean {
    return n >= min && n <= max;
  }
}
