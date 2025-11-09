/* const path = require('path');
const fs = require('fs');
let req = ["Disconnect", "Express", "Cors", "path"]
let jsonReq = JSON.stringify(req)
fs.writeFile(path.join(__dirname, 'requirements.json'), jsonReq, (err) => {}); */
const os = require('os');
const networkInterfaces = os.networkInterfaces();
const localIp = networkInterfaces['eth0']?.find(details => details.family === 'IPv4')?.address || 
console.log(localIp);