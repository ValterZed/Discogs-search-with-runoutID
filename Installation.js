const { exec } = require('child_process');

exec('npm install disconnect', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing package: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});