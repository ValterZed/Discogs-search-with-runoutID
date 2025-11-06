const path = require('path');
const info = require(path.join(__dirname, 'requirements.json'))
//check if dependencies are installed
if (!info["installed"]){
    console.log("Dependencies not installed. Please run Installation.js first.")
    process.exit(1);
}

const Discogs = require('disconnect').Client;
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

//check if dependencies are installed
if (!info["installed"]){
    console.log("Dependencies not installed. Please run Installation.bat first.")
    process.exit(1);
}





async function getDiscogsData(req, res) {
    let searchTerms = req.body;
    try {
        let respResults = await searchDiscogs(searchTerms);
        res.json({
            results: respResults[0], 
            accuracy: respResults[1]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'discocks.html'));
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    // Open default browser on Windows
    const { exec } = require('child_process');
    exec(`cmd /c start "" "http://localhost:3000"`, (err) => {
        if (err) console.error('Failed to open browser:', err);
    });
});
// ...


app.post('/api/discogs', getDiscogsData);

app.listen(3000, () => console.log('Exit program using Ctrl+C in the terminal'));


const client = new Discogs({ userToken: 'tJAytIyyvuJKtVBggHpwVUkgZgjnWcFTwDOvAvft' });
const db = client.database();
/* db.getRelease(176126, function(err, data){
    console.log(data);
}); */

function searchDiscogs(searchTerms){
    return new Promise((resolve, reject) => {
        db.search('', {
            type: 'release',
            format: searchTerms["formats"],
            country: searchTerms["country"],
            label: searchTerms["label"],
            artist : searchTerms["artist"],
            release_title: searchTerms["album"],
            year: searchTerms["year"]
        }, function(err, data){
            if (err) {
                console.error(err);
                reject(err);
            } else {
                let readyRes = parseResults(data.results, searchTerms);
                resolve(readyRes);
            }
        });
    });
}

function parseResults(res, searchTerms){
    let resultsMatchingWithBarcode = {}
    let runouts = searchTerms["runouts"]

    for (let i = 0; i <= runouts.length; i++){resultsMatchingWithBarcode[Math.round((i/runouts.length)*100)] = []}
    
    for (let rel of res){
        let hits = 0
        for (let runout of runouts){
            for (let barcode of rel.barcode){
                if (barcode.toLowerCase().includes(runout.toLowerCase())){
                    hits++
                    break
                }
            }
        }
        let accuracy = Math.round((hits/runouts.length)*100)
        resultsMatchingWithBarcode[accuracy].push(rel)
    }

    let highestAcc = 0
    for (let key in resultsMatchingWithBarcode){
        if (resultsMatchingWithBarcode[key].length > 0){
            highestAcc = key
        }
    }

    return [resultsMatchingWithBarcode[highestAcc], highestAcc]
}