module.exports = {
    name: 'Musicord',
    entryPoints: ['./src/index.ts'],
    out: './pages',
    customPages: './docs',
    tsconfig: './tsconfig.json',
    forceEmit: true,
    sort: 'source',
    logNotDocumented: ['enum', 'interface'],
    logo: 'https://camo.githubusercontent.com/b916e46a616a53bc0b9c3c57ed146baeb3495ef5710ca87cf09da36eae4cef67/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f3830313033373933313139353636323333362f3935363631343834373235303935363331382f6c6f676f5f70726f67726573735f6261722e706e673f77696474683d31343430266865696768743d333230',
    changelog: true,
    //landingPage: 'README.md'
}