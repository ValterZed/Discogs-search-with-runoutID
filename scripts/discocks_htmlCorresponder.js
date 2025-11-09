const { use } = require("react")

let yearSlider = document.getElementById("year")
let yearOutput = document.getElementById("yearOutput")
let submitBtn = document.getElementById("submitButton")
let addRunoutBtn = document.getElementById("addRunout")
let collapseSetBtn = document.getElementById("openSettings")
let useLocalhostCheckbox = document.getElementById("localhostToggle")


let objOfResults = {}
let amntOfRunouts = 2

submitBtn.addEventListener("click", submit)
document.getElementById("reverseSort").addEventListener("click", rev)
addRunoutBtn.addEventListener("click", addRunout)
collapseSetBtn.addEventListener("click", collapseSettings)
useLocalhostCheckbox.addEventListener("change", localHostToggleHandler)


function mySort(array, method){
    if (!array) return []
    if (method === "year"){
        array.sort((a, b) => a.year - b.year);
    }
    if (method === "want"){
        array.sort((a, b) => a["community"]["want"] - b["community"]["want"]);
    }
    if (method === "have"){
        array.sort((a, b) => a["community"]["have"] - b["community"]["have"]);
    }
    if (method === "label"){
        array.sort((a, b) => {
            if (a["label"][0] < b["label"][0]) return -1;
            if (a["label"][0] > b["label"][0]) return 1;
            return 0;
        });
    }
    if (method === "reverse"){
        array.reverse()
    }

    return array
}

function rev(){
    sortHandler(true)
}

function sortHandler(manualMethod=false){
    if (!objOfResults["results"]){return}
    let accSave = objOfResults["accuracy"]
    if (!manualMethod){
        objOfResults = {results: mySort(objOfResults["results"], gv("sort")), accuracy: accSave}
    }
    else{
        objOfResults = {results: mySort(objOfResults["results"], "reverse"), accuracy: accSave}
    }
    killChildren()
    displayResults(objOfResults)
}

document.getElementById("sort").onchange = sortHandler

function gv(identification){
    return document.getElementById(identification).value
}

function killChildren(){
    const oldResults = document.querySelectorAll(".resultEntry")
    oldResults.forEach(resultEntry => resultEntry.remove());
}

function submit(){
    killChildren()
    let runouts = []

    let albumName = gv("albumName")
    let artistName = gv("artistName")
    let formats = gv("format")
    let country = gv("country")
    let label = gv("label")
    let year = gv("year")
    for (let i = 1; i <= amntOfRunouts; i++){
        runouts.push(gv("runout"+(i)))
    }

    let searchTerms = {album: albumName,
        artist: artistName,
        formats: formats,
        country: country,
        label: label,
        year: year,
        runouts: runouts
    }

    console.log(searchTerms)
    sendToBackend(searchTerms)
}

function addRunout(){
    amntOfRunouts++;
    let runoutsDiv = document.getElementById("runouts")
    runoutsDiv.innerHTML += `
    <label for="runout${amntOfRunouts}">Extra Runout Field:</label><br>
    <input type="text" id="runout${amntOfRunouts}" name="runout${amntOfRunouts}"><br> `
}

function collapseSettings(){
    let settingsBar = document.getElementById("settingsBar")
    if (settingsBar.style.display === "block"){
        settingsBar.style.display = "none"
        document.getElementById("openSettings").innerText = "Show Settings"
    }
    else{
        settingsBar.style.display = "block"
        document.getElementById("openSettings").innerText = "Hide"
    }
}

function localHostToggleHandler(){
    let useLocalhost = useLocalhostCheckbox.checked
}

function resultChildAdder(rel){
    let year = rel["year"]
    let title = rel["title"]
    let coverImage = rel["cover_image"]
    let link = ("https://www.discogs.com"+rel["uri"])

    let div = document.createElement("div")
    div.className = "resultEntry"
    div.id = "resultEntry"

    div.innerHTML = `
    <img id="thumbImg" src="${coverImage}" alt="Cover image not found" class="coverImage">
    <h2>${title} (${year})</h2>
    <h4 id="moreData">${rel["country"]} - ${rel["label"][0]} - ${rel["format"][0]}</h4>
    <h4 id="wantHave">Want: ${rel["community"]["want"]} | Have: ${rel["community"]["have"]}</h4>
    <a href="${link}" target="_blank">View on Discogs</a>

    `
    
    document.getElementById("resultList").appendChild(div)
}

function displayResults(data){
    results = data["results"]
    document.getElementById("accuracy").innerText = "Matches " + data["accuracy"] + "% of runout IDs given"
    for (let release of results){
        resultChildAdder(release)
    }
}

function getLocalIPv4(){
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}


function sendToBackend(searchTerms) {
    fetch(`${window.location.href}api/discogs`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchTerms)
})
.then(response => response.json())
.then(data => {
    console.log('Response from backend:', data);
    objOfResults["results"] = data["results"]
    objOfResults["accuracy"] = data["accuracy"]
    displayResults(data);
})
.catch(error => {
    console.error('Error:', error);
});
}
