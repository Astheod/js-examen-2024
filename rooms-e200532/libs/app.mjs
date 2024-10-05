
const ROOMS_EVENT_URL = 'https://dartagnan.cg.helmo.be/~p150107/memory/php/quotes.php';

import {clearCache, loadSites, renderSites} from "./rooms.mjs";
let clearButton = document.getElementById("clearBtn");
clearButton.addEventListener("click", () => {
    clearCache();
});

let sites = await loadSites();
let eventSource = null;
renderSites(sites);
changerQuote();

function changerQuote() {
    if (eventSource) {
        eventSource.close();
    }
    eventSource = new EventSource(ROOMS_EVENT_URL);

    let quote = document.getElementById("quote");

    eventSource.addEventListener("quote", (event) => {
        let data = JSON.parse(event.data);
        quote.innerText = data["quote"];
        quote.setAttribute("cite", data.from);

    });


    eventSource.addEventListener("disturbance", (event) => {
        let data = JSON.parse(event.data);
        console.log(data);
    });
}