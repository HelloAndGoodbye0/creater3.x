const javascript_obfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const agrs = process.argv.slice(2);
let configPath = path.join(__dirname, 'config.json')
if(agrs.length == 2)
{
    let fileName = agrs[0];
    let outFileName = agrs[1];
    const options = JSON.parse(fs.readFileSync(configPath).toString());
    var data = fs.readFileSync(fileName);
    var obfuscationResult = javascript_obfuscator.obfuscate(data.toString(), options);
    fs.writeFileSync(outFileName, obfuscationResult.getObfuscatedCode());
}
else
{
   console.log("pelase input file path and out file path");
}