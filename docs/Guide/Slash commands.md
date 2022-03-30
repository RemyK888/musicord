---
name: Slash commands
order: 2
---

# 🔧 Slash commands

In order to integrate slash commands easily to your bot, playcord offers you a customized solution.

## 📀 ApplicationCommandsSchema

The `ApplicationCommandsSchema` class, directly integrated in the package, allows you to easily create slash commands, and pass them to your bot.

First of all the NPM package [@discordjs/rest](https://www.npmjs.com/package/@discordjs/rest) is required to push the slash commands
```sh
$ npm install @discordjs/rest
```

*Version 4 or higher is recommended for compatibility with the rest of the project.*

Then you can easily integrate this class into your code. Here is an example of what your code could look like:

```js
const { REST } = require('@discordjs/rest');

const commandsSchema = new ApplicationCommandsSchema({
  play: {
    description: 'Play a song',
    implemented: true,
    options: {
      name: 'args',
      description: 'Search term of YouTube URL',
      required: true,
      type: 3
    }
  },
  stop: {
    description: 'Stop the music',
    implemented: true,
  },
});

const rest = new REST({ version: '10' }).setToken('token');

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands('application id', 'guild id'),
      { body: commandsSchema.extract() },
    )
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

```


The 'type' parameter is the type of the argument if required. By default, type 3, corresponding to a textual argument, is selected.
For more information, please refer to [this paragraph](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types) of the [Discord documentation](https://discord.com/developers/docs/intro).
