<p align="center">
  <img src="https://camo.githubusercontent.com/b916e46a616a53bc0b9c3c57ed146baeb3495ef5710ca87cf09da36eae4cef67/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f3830313033373933313139353636323333362f3935363631343834373235303935363331382f6c6f676f5f70726f67726573735f6261722e706e673f77696474683d31343430266865696768743d333230" alt="Musicord logo">
  <img src="https://forthebadge.com/images/badges/made-with-typescript.svg" alt="Made with Typescript"> 
  <br>
  <img src="https://img.shields.io/npm/dt/musicord?style=for-the-badge" alt="Downloads">
</p>

<h3><strong>A simple, powerful, and user-friendly music package for your Discord bot. Made for <a href="https://www.npmjs.com/package/discord.js">Discord.js v14</a> and <a href="https://www.npmjs.com/package/@discordjs/voice">Discord.js/voice v9</a>.</strong></h3>

# 🔑 Features
- Easy to use
- Multiple server
- Audio filters
- Lightweight
- Faster than other packages

*Note that this package is still under development, if you encounter any errors, please join the [RemyK Discord server ](https://discord.gg/UBUSgw4) so that this problem can be fixed as soon as possible.*

# 🔩 Installation
## Install [@discordjs/opus](https://www.npmjs.com/package/@discordjs/opus) and [FFmpeg](https://www.npmjs.com/package/ffmpeg)
```sh
$ npm install @discordjs/opus ffmpeg
```
## Install [musicord](https://www.npmjs.com/package/musicord)
```sh
$ npm install musicord
```

[Tweetnacl](https://www.npmjs.com/package/tweetnacl) is recommended for better performance.

*If you encounter installation errors, please refer to [this page]() of the [documentation]()*


# 💻 Code example
```js
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client } = require('discord.js');
const {  Musicord, ApplicationCommandSchema } = require('musicord');

const commandsSchema = new ApplicationCommandSchema({
  play: {
    description: 'Play a song',
    implemented: true,
    options: {
      name: 'link',
      description: 'YouTube URL',
      required: true,
      type: 3
    }
  }
});

const rest = new REST({ version: '10' }).setToken('token');

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands('client id', 'guild id'),
      { body: commandsSchema.extract() },
    )
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', (interaction) => {
if(!command.isCommand()) return; 
if (interaction.commandName === 'play') {
      const msgArgs = interaction.options.get('link').value
      if (!msgArgs) return interaction.reply('Argument required');
      const msgMember = interaction.guild.members.cache.get(interaction.member.user.id);
      if (msgMember && msgMember.voice.channel) {
        if (musicordPlayer.existQueue(interaction.guild)) {
          const queue = musicordPlayer.getQueue(interaction.guild);
          if (queue) await queue.play(msgArgs, msgMember.voice.channel);
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild);
          if (queueInfo && queue) interaction.reply(`${queueInfo.songs[1].title} has been added to the queue`)
        } else {
          const queue = musicordPlayer.initQueue(interaction.guild, {
            textChannel: interaction.channel ,
            voiceChannel: msgMember.voice.channel
          });
          if (queue) {
            interaction.deferReply();
            await queue.play(msgArgs, msgMember.voice.channel)
          }
          const queueInfo = musicordPlayer.getQueueInfo(interaction.guild);
          if (queueInfo) return await interaction.editReply(`Playing ${queueInfo.songs[0].title}`)
        }
      }
    }
});

client.login('token');
```

# 🔗 Links
 - [Documentation]()
 - [Github](https://github.com/RemyK888/musicord)
 - [NPM](https://www.npmjs.com/package/musicord)
 - [Discord server](https://discord.gg/UBUSgw4)

# 🌌 Projects made with [musicord]()
 - [Musicord bot]() by [ArthurLeo](https://github.com/ArthurLeo13)

# 🚀 Others

Before creating an issue, be sure that it has not already been deferred and try to come up with a simple approach to the issue so that deferral is accessible to all.

In order to submit a PR, make sure you have read the [contribution guide]()

Thanks a lot to [ArthurLeo]() who supported me during the development of this project, and who helps me daily to maintain it.

I would also like to thank all the amazing members of my server who are helping to make this project happen !

*Note: This package is not affiliated with Discord Inc. or YouTube Inc.*

<strong>This package is under [Apache-2.0 license](https://www.apache.org/licenses/LICENSE-2.0).</strong>

<img src="https://discord.com/api/guilds/713699044811341895/widget.png?style=banner2" alt="Discord server widget image">


## **Made with ❤ by RemyK**