const { exec } = require('child_process');
const util = require('util');
const execP = util.promisify(exec);
const fs = require('fs');
const path = require('path');
let info = require(path.join(__dirname, 'requirements.json'))
let req = info["req"];




async function packageInstallation(pkg) {
    console.log(`Installing package: ${pkg}`);
    try {
        const { stdout, stderr } = await execP(`npm install ${pkg}`);
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return false;
        }
        console.log(`installation completed with following message:\n${stdout}`);
        return true;
    } catch (error) {
        console.error(`Error installing package: ${error.message}`);
        return false;
    }
}

async function instAllPackages(){
    console.log(`Starting package installation...`);
    console.log(`|${"-".repeat(req.length * 10)}| 0%`);
    let n = 0;
    for (let pkg of req) {
        n++;
        const ok = await packageInstallation(pkg);
        if (!ok) {
            console.log(`Failed to install package: ${pkg}`);
            n--;
            return;
        }
        console.log(`|${"█".repeat(n * 10)}${"-".repeat(((req.length - n) * 10))}| ${100 * (n / req.length)}%`);
    }
    info["installed"] = true;
    
    fs.writeFileSync(path.join(__dirname, 'requirements.json'), JSON.stringify(info, null, 4));
    console.log(`All packages installed successfully.`);
}

instAllPackages().catch(err => console.error(err));