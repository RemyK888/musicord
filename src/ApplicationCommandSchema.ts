import { CommandOptions, DJSApplicationCommandSchema, ApplicationCommandSchemaOptions } from './utils/Interfaces';

export class ApplicationCommandSchema {
  public readonly commands: ApplicationCommandSchemaOptions;

  /**
   * Create a new ApplicationCommandSchema
   * @param {ApplicationCommandSchemaOptions} options ApplicationCommandSchema options
   * @constructor
   * @example
   * const { ApplicationCommandSchema } = require()
   * const commandsSchema = new ApplicationCommandSchema({
   *      play: {
   *          implemented: true,
   *          description: 'Some description',
   *          options: {
   *              name: 'query',
   *              description: 'The song title you want to play'
   *          }
   *      }
   * });
   */
  constructor(options: ApplicationCommandSchemaOptions) {
    if (!options || typeof options !== 'object') throw new TypeError('Options must be an object');
    this.commands = options;
  }

  /**
   * Extract slash commands formatted for DJS
   * @returns {DJSApplicationCommandSchema[] | []}
   * @example
   * await rest.put(Routes.applicationGuildCommands('clientID', 'guildID'), { body: commandsSchema.extract() });
   */
  public extract(): DJSApplicationCommandSchema[] | [] {
    const slashCommandsName: string[] = Object.keys(this.commands);
    const slashCommandsValues: CommandOptions[] = Object.values(this.commands);
    const extractData: DJSApplicationCommandSchema[] = [];
    for (const e in this.commands) {
      if (slashCommandsValues[slashCommandsName.indexOf(e)].implemented == false) continue;
      extractData.push({
        name: String(e),
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
                  type: this.isBetween(slashCommandsValues[slashCommandsName.indexOf(e)].options?.type, 1, 11)
                    ? slashCommandsValues[slashCommandsName.indexOf(e)].options?.type
                    : 3,
                },
              ],
      });
    }
    return extractData;
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
