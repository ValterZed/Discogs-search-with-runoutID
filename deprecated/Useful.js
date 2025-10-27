const path = require('path');
const fs = require('fs');
let req = ["Disconnect", "Express", "Cors", "path"]
let jsonReq = JSON.stringify(req)
fs.writeFile(path.join(__dirname, 'requirements.json'), jsonReq, (err) => {});