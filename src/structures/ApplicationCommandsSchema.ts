import { CommandData, DJSApplicationCommandsSchema } from '../utils/Interfaces';

export class ApplicationCommandsSchema {
  public readonly commands: CommandData[];

  /**
   * Creates a new ApplicationCommandSchema.
   * @param {CommandOptions[]} options ApplicationCommandSchema options
   * @constructor
   * @example
   * const { ApplicationCommandSchema } = require()
   * const commandsSchema = new ApplicationCommandSchema([
   *      {
   *        name: 'play',
   *        implemented: true,
   *        description: 'Some description',
   *        options: {
   *            name: 'query',
   *            description: 'The song title you want to play'
   *         }
   *      }
   * ]);
   */
  constructor(options: CommandData[]) {
    if (!options || typeof options !== 'object') throw new TypeError('Options must be an object');

    /**
     * Slash commands
     * @type {CommandData[]}
     */
    this.commands = options;
  }

  /**
   * Extracts slash commands formatted for DJS.
   * @returns {DJSApplicationCommandSchema[] | []}
   * @example
   * await rest.put(Routes.applicationGuildCommands('clientID', 'guildID'), { body: commandsSchema.extract() });
   */
  public extract(): DJSApplicationCommandsSchema[] | [] {
    const slashCommandsName: string[] = Object.keys(this.commands);
    const slashCommandsValues: CommandData[] = Object.values(this.commands);
    const extractData: DJSApplicationCommandsSchema[] = [];
    for (const e in this.commands) {
      if (slashCommandsValues[slashCommandsName.indexOf(e)].implemented == false) continue;
      extractData.push({
        name: slashCommandsValues[slashCommandsName.indexOf(e)].cmdName,
        description: slashCommandsValues[slashCommandsName.indexOf(e)].description,
        options:
          typeof slashCommandsValues[slashCommandsName.indexOf(e)].options == 'undefined' ||
          !slashCommandsValues[slashCommandsName.indexOf(e)].options?.name ||
          !slashCommandsValues[slashCommandsName.indexOf(e)].options?.description
            ? []
            : [
                {
                  name: slashCommandsValues[slashCommandsName.indexOf(e)].options?.name ?? undefined,
                  description: slashCommandsValues[slashCommandsName.indexOf(e)].options?.description ?? undefined,
                  required: slashCommandsValues[slashCommandsName.indexOf(e)].options?.required ?? true,
                  type: this._isBetween(slashCommandsValues[slashCommandsName.indexOf(e)].options?.type, 1, 11)
                    ? slashCommandsValues[slashCommandsName.indexOf(e)].options?.type
                    : 3,
                },
              ],
      });
    }
    return extractData;
  }

  /**
   * Checks if a value is within a range of numbers.
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
