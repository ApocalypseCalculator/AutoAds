const puppeteer = require('puppeteer-core');
const chalk = require('chalk');
const fs = require('fs');

const HUMAN = "https://politicsandwar.com/human";
const ADLENGTH = 1 * 60 * 1000; //60 seconds

async function d(email, pass) {
    console.log();
    let raw = fs.readFileSync('./data.json');
    let parsed = JSON.parse(raw);
    const browser = await puppeteer.launch({
        executablePath: `${parsed.chrome}`,
        args: [],
        headless: true,
        devtools: true,
        ignoreDefaultArgs: ['--disable-extensions']
    }).catch(err => {
        console.log(chalk.red('Unable to launch your chromium executable'));
        parsed.chrome = '';
        let newraw = JSON.stringify(parsed);
        fs.writeFileSync('./data.json', newraw);
        process.exit(0);
    })
    console.log(chalk.green('Logging in...'));
    const page = await browser.newPage();
    await (await page).goto("https://politicsandwar.com/login", { waitUntil: 'load' });
    await (await page).type("input[name='email']", `${email}`);
    await (await page).type("input[name='password']", `${pass}`);
    await (await page).click("input[name='loginform']");
    await (await page).waitForNavigation();
    if (await (await (await page).content()).toLowerCase().includes('fail') || await (await (await page).content()).toLowerCase().includes('incorrect')) {
        console.log(chalk.red('Login failed'));
        parsed.email = '';
        parsed.password = '';
        let newraw = JSON.stringify(parsed);
        fs.writeFileSync('./data.json', newraw);
        process.exit(0);
    }
    else {
        console.log(chalk.green('Logged in successfully...accessing rewarded ads page now'));
        await (await page).goto("https://politicsandwar.com/rewarded-ads/", { waitUntil: "load" });
        console.log(chalk.green('Loaded rewarded ads page...'));
        if ((await page).url().includes(HUMAN)) {
            console.log(chalk.yellow(`Human verification encountered. Please verify at ${HUMAN}/`));
            process.exit(0);
        }
        else {
            function click() {
                return new Promise(resolve => {
                    setTimeout(async function () {
                        await (await page).click("#consent_agree_btn");
                        console.log(chalk.green('Clicked stupid cookie button thingy'));
                    }, 1000);
                    setTimeout(async function () {
                        await (await page).click("#btnAds");
                        console.log(chalk.green(`Started ad playback...`));
                        resolve();
                    }, 2500);
                })
            }
            await click();
            function countdown() {
                let left = ADLENGTH / 1000;
                return new Promise(resolve => {
                    let handle = setInterval(async function () {
                        process.stdout.cursorTo(0);
                        process.stdout.write(chalk.green(`Process will automatically exit in ${left} seconds\t`));
                        left--;
                        if (left <= 0) {
                            clearInterval(handle);
                            console.log('\n\n' + chalk.green('Finished. Check your rewarded ads page at https://politicsandwar.com/rewarded-ads/ to see if you\'ve received your reward.\nRemember to wait at least 3 minutes to watch another ad'));
                            resolve();
                        }
                    }, 1000)
                })
            }
            await countdown();
        }
    }
}

module.exports.d = d;