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
    let resultsMatchingWithBarcodeTwice = []
    let resultsMatchingWithBarcodeOnce = []
    let runoutA = searchTerms["runoutA"]
    let runoutB = searchTerms["runoutB"]
    
    for (let rel of res){
        let aTrue = false
        let bTrue = false
        for (let barcode of rel.barcode){
            if (barcode.toLowerCase().includes(runoutA.toLowerCase())){
                aTrue = true
            }
            if (barcode.toLowerCase().includes(runoutB.toLowerCase())){
                bTrue = true
            }
        }
        if (aTrue && bTrue){
            resultsMatchingWithBarcodeTwice.push(rel)
        }
        if ((aTrue || bTrue) && !(aTrue && bTrue)){
            resultsMatchingWithBarcodeOnce.push(rel)
        }
    }

    let retValue = []
    let accuracy = 100

    if ((resultsMatchingWithBarcodeTwice.length === 0)){
        if (resultsMatchingWithBarcodeOnce.length === 0){
            retValue = res
            console.log("No runout matches found, returning all results")
            accuracy = 0
        }
        else{retValue = resultsMatchingWithBarcodeOnce
            console.log("Only one runout match found, returning those results")
            accuracy = 50
        }
    }
    else { retValue = resultsMatchingWithBarcodeTwice}

    return [retValue, accuracy]
}