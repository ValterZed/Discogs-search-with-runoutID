let yearSlider = document.getElementById("year")
let yearOutput = document.getElementById("yearOutput")
let submitBtn = document.getElementById("submitButton")



submitBtn.addEventListener("click", submit)

function gv(identification){
    return document.getElementById(identification).value
}

function submit(){
    const oldResults = document.querySelectorAll(".resultEntry")
    oldResults.forEach(resultEntry => resultEntry.remove());

    let albumName = gv("albumName")
    let artistName = gv("artistName")
    let formats = gv("format")
    let country = gv("country")
    let label = gv("label")
    let year = gv("year")
    let runoutA = gv("runoutA")
    let runoutB = gv("runoutB")

    let searchTerms = {album: albumName,
        artist: artistName,
        formats: formats,
        country: country,
        label: label,
        year: year,
        runoutA: runoutA,
        runoutB: runoutB
    }

    console.log(searchTerms)
    sendToBackend(searchTerms)
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

function sendToBackend(searchTerms) {
    fetch('http://localhost:3000/api/discogs', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchTerms)
})
.then(response => response.json())
.then(data => {
    console.log('Response from backend:', data);
    displayResults(data);
})
.catch(error => {
    console.error('Error:', error);
});
}
