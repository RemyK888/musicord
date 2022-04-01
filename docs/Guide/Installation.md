---
name: Installation
order: 1
---

# ☕ Installation

## ☄️ Required dependencies

First of all, you need to install [@discordjs/opus](https://www.npmjs.com/package/@discordjs/opus) and [FFmpeg](https://www.npmjs.com/package/ffmpeg)
```sh
$ npm install @discordjs/opus ffmpeg
```

Afterwards, you can install [musicord](https://www.npmjs.com/package/musicord)
```sh
$ npm install musicord
```

## ⚡ Recommended dependencies

In order to have better encryption performance, [tweetnacl](https://www.npmjs.com/package/tweetnacl) and [libsodium-wrappers](https://www.npmjs.com/package/libsodium-wrappers) are recommended
```sh
$ npm install tweetnacl libsodium-wrappers
```

## ⛔ Installation errors

It is very likely that you will encounter installation errors, both in the required dependencies and in the package itself, or even in optional dependencies.

Here is what we recommend in case of errors during installation:
- Upgrade Node.js to the latest stable version
    - [Download link](https://nodejs.org/en/download/)
- Upgrade NPM to the latest stable version
    - Open a console in administrator mode
    - Insert the following command:
        ```sh
        $ npm install --global npm@latest
        ```
- Install the Windows Build Tools
    - Open a console in administrator mode
    - Insert the following command: 
        ```sh
        npm install --global --production --add-python-to-path windows-build-tools
        ```
- Buy a new computer
- Do this again