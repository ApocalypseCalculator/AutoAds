const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');
const { spawn } = require('child_process');
const nmi = require('node-machine-id');

const cipher = require('./cipher');

const machineid = nmi.machineIdSync();
let raw = fs.readFileSync('./data.json');
let parsed = JSON.parse(raw);

let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

if (fs.existsSync(parsed.chrome)) {
    next();
}
else {
    let detectPath = testDefaultChrome();
    if (!detectPath) {
        console.log(chalk.yellow('I did not find a Chrome/Chromium executable, please choose one: '));
        const select = spawn('cmd.exe', ['/c', 'selector.bat']);
        select.stdout.on('data', (data) => {
            let path = data.toString();
            if (/:\\/.test(path)) {
                parsed.chrome = path.replace('\n', '').replace('\r', '').replace(/\\/g, '/');
                let newraw = JSON.stringify(parsed);
                fs.writeFileSync('./data.json', newraw);
                next();
            }
            else {
                console.log(chalk.red('Operation cancelled.'));
                process.exit(0);
            }
        })
    }
    else {
        console.log(chalk.green('Detected Chrome/Chromium executable...'));
        parsed.chrome = detectPath.replace('\n', '').replace('\r', '').replace(/\\/g, '/');
        let newraw = JSON.stringify(parsed);
        fs.writeFileSync('./data.json', newraw);
        next();
    }
}

async function next() {
    console.log(chalk.green('\nLogin time!\n'))
    if (!parsed.email || parsed.email == '') {
        console.log(`Enter your email: `);
        rl.question('', (email) => { //i have no fucking clue why rl.question doesnt print properly
            if (/[0-9a-zA-Z]{1,100}@[0-9a-zA-Z]{1,100}/.test(email)) {
                parsed.email = email;
                let newraw = JSON.stringify(parsed);
                fs.writeFileSync('./data.json', newraw);
                nextnext(email);
            }
            else {
                console.log(chalk.yellow('Invalid email'));
                next();
            }
        })
    }
    else {
        console.log(chalk.green(`Using email ${parsed.email}`));
        nextnext(parsed.email)
    }
}

async function nextnext(email) {
    if (parsed.password && parsed.password !== '') {
        console.log(chalk.green(`Using encrypted password`));
        let pwd = cipher.decrypt(parsed.password, machineid);
        startSim(email, pwd);
    }
    else {
        console.log('\nEnter your password: ');
        rl.stdoutMuted = true;
        rl.question('', (password) => {
            rl.stdoutMuted = false;
            if (password.length > 0 && password !== '') {
                let encrypted = cipher.encrypt(password, machineid);
                parsed.password = encrypted;
                let newraw = JSON.stringify(parsed);
                fs.writeFileSync('./data.json', newraw);
                startSim(email, password);
            }
            else {
                console.log(chalk.yellow('\nInvalid password'));
                nextnext(email);
            }
        })
    }
}

var counter = 2;

async function startSim(email, password) {
    console.log(chalk.green(`\n\nStarting round 1`));
    require('./simulate').d(email, password).then(() => {
        setInterval(function () {
            console.log(chalk.green(`\nStarting round ${counter}`));
            require('./simulate').d(email, password).then(() => {
                counter++;
                if (counter >= 25) {
                    console.log(chalk.greenBright("\nWatched 25 ads. You've reached your max amount of earnings. Hooray!"));
                    process.exit(0);
                }
            })
        }, 5 * 60 * 1000);
    })
}

function testDefaultChrome() {
    let possibleLocations = [
        `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env['ProgramFiles(x86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${process.env.PROGRAMFILES}\\Opera\\Launcher.exe`,
        `${process.env.LOCALAPPDATA}\\Vivaldi\\Application\\vivaldi.exe`
    ];
    for (let i = 0; i < possibleLocations.length; i++) {
        if (fs.existsSync(possibleLocations[i])) {
            return possibleLocations[i];
        }
        else if (i == possibleLocations.length - 1) {
            return false;
        }
    }
}

rl._writeToOutput = function _writeToOutput(stringToWrite) {
    if (rl.stdoutMuted) {
        rl.output.write("*");
    }
    else {
        rl.output.write(stringToWrite);
    }
};