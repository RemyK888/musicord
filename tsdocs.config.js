module.exports = {
    name: 'Playcord',
    entryPoints: ['./src/index.ts'],
    out: './pages',
    customPages: './docs',
    tsconfig: './tsconfig.json',
    forceEmit: true,
    sort: 'source',
    logNotDocumented: ['enum', 'interface'],
    logo: 'https://media.discordapp.net/attachments/801037931195662336/958815567639367690/logo_progress_advanced.png?width=1440&height=306',
    changelog: true,
    //landingPage: 'README.md'
}