const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');
const { spawn } = require('child_process');

if (!fs.existsSync('./data.json')) {
    console.log(chalk.red('Missing data.json file'));
    process.exit(0);
}

let raw = fs.readFileSync('./data.json');
let parsed = JSON.parse(raw);

let rl = readline.createInterface({ input: process.stdin });

if (fs.existsSync(parsed.chrome)) {
    next();
}
else {
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

async function next() {
    console.log(chalk.green('\nLogin time!\n'))
    console.log(`Enter your email: `);
    rl.question('', (email) => { //i have no fucking clue why rl.question doesnt print properly
        if(/[0-9a-zA-Z]{1,100}@[0-9a-zA-Z]{1,100}/.test(email)){
            nextnext(email);
        }
        else{
            console.log(chalk.yellow('Invalid email'));
            next();
        }
    })
}

async function nextnext(email) {
    console.log('\nEnter your password: ');
    rl.question('', (password) => {
        if(password.length > 0 && password !== ''){
            require('./simulate').d(email, password);
        }
        else{
            console.log(chalk.yellow('Invalid password'));
            nextnext(email);
        }
    })
}