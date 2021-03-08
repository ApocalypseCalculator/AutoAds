const child = require('child_process');

if (process.argv[2] === '--start') {
    require('./index');
}
else {
    child.execSync('notice.vbs');
}