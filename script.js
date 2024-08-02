// Načítání dat o městech a nastavení našeptávače a odeslání formuláře po načtení stránky
window.onload = function(){
    getCityList().then(cityList => {
        const searchTerms = extractSearchTerms(cityList); // Extrahuje vyhledávací termíny z načteného seznamu měst
        const sortedSearchTerms = sortSearchTerms(searchTerms); // Seřadí vyhledávací termíny
        setupAutocomplete(document.getElementById("myInput"), sortedSearchTerms, cityList); // Nastaví funkci našeptávání
        setupFormSubmit(document.getElementById("myForm"), document.getElementById("myInput"), cityList, document.getElementById("cityText")); // Nastaví odesílání formuláře
    });
}

// Načítání seznamu měst z externího JSON souboru
async function getCityList(){
    const response = await fetch("city.list.json");
    const cityList = await response.json();
    return cityList;
}

// Extrakce názvů měst z načteného seznamu měst a přidání zkratek zemí a států
function extractSearchTerms(cityList){
    return Object.values(cityList).map(city => {
        return city.state !== "" ? `${city.name}, ${city.country}, ${city.state}` : `${city.name}, ${city.country}`;
    });
}

// Seřazení vyhledávacích termínů podle abecedy
function sortSearchTerms(terms){
    return terms.sort()
}

// Vyhledání města v seznamu měst podle názvu města z našeptávače
function selectCity(cityList, cityName){
    return Object.values(cityList).find(city => {
        return `${city.name}, ${city.country}, ${city.state}` === cityName || `${city.name}, ${city.country}` === cityName;
    });
}

// Nastavení našeptávání pro vstupní pole
function setupAutocomplete(inp, arr, cityList){
    let currentFocus = -1

    inp.addEventListener("input", function(){
        handleInputEvent(inp, arr, cityList, currentFocus); // Zpracuje událost vstupu
    });
    inp.addEventListener("keydown", function(e){
        handleKeyDown(e, currentFocus); // Zpracuje událost stisknutí klávesy
    });
    document.addEventListener("click", function(e){
        handleDocumentClick(e, inp); // Zpracuje událost kliknutí
    });
}

// Zpracování události vstupu pro našeptávání
function handleInputEvent(inp, arr, cityList, currentFocus){
    const val = inp.value;
    closeAllLists(inp); // Zavře všechny seznamy
    if(!val) return false;

    const listContainer = document.createElement("DIV");
    listContainer.setAttribute("id", `${inp.id}-autocomplete-list`);
    listContainer.setAttribute("class", "autocomplete-items");
    inp.parentNode.appendChild(listContainer);

    const matchingCities = arr.filter(term => term.substr(0, val.length).toUpperCase() === val.toUpperCase()).slice(0, 100);

    matchingCities.forEach(city => {
        const item = document.createElement("DIV");
        item.setAttribute("class", "ac-item");
        item.innerHTML = `<strong>${city.substr(0, val.length)}</strong>${city.substr(val.length)}`;
        item.innerHTML += `<input type='hidden' value='${city}'>`;
        item.addEventListener("click", function(){
            inp.value = this.getElementsByTagName("input")[0].value;
            closeAllLists(inp); // Zavře seznam po kliknutí
        });
        listContainer.appendChild(item);
    })
}

// Zpracování události stisknutí klávesy pro našeptávání
function handleKeyDown(e, currentFocus){
    const listContainer = document.getElementById(`${e.target.id}-autocomplete-list`);
    if(!listContainer) return;

    const items = listContainer.getElementsByTagName("div");
    if(e.keyCode == 40){ // Klávesa šipky dolů
        e.preventDefault();
        currentFocus++;
        addActive(items, currentFocus);
    } 
    else if(e.keyCode == 38){ // Klávesa šipky nahoru
        e.preventDefault();
        currentFocus--;
        addActive(items, currentFocus);
    }
    else if(e.keyCode == 13){ // Klávesa Enter
        e.preventDefault();
        if(currentFocus > -1){
            if(items) items[currentFocus].click();
        }
    }
}

// Zpracování události kliknutí pro našeptávání
function handleDocumentClick(e, inp){
    closeAllLists(inp, e.target); // Zavře všechny seznamy při kliknutí mimo
}

// Přidání třídy aktivního prvku
function addActive(items, currentFocus){
    if(!items) return;
    removeActive(items); // Odstraní třídu aktivního prvku
    if(currentFocus >= items.length) currentFocus = 0;
    if(currentFocus < 0) currentFocus = (items.length - 1);
    items[currentFocus].classList.add("autocomplete-active");
}

// Odstranění třídy aktivního prvku
function removeActive(items){
    for(const item of items){
        item.classList.remove("autocomplete-active");
    }
}

// Zavření všech seznamů našeptávání
function closeAllLists(inp, elmnt){
    var items = document.getElementsByClassName("autocomplete-items");
    for(const item of items){
        if(elmnt !== item && elmnt !== inp){
            item.parentNode.removeChild(item);
        }
    }
}


// Nastavení odesílání formuláře a zpracování počasí pro vybrané město
function setupFormSubmit(form, inp, cityList, cityText){
    form.addEventListener("submit", function(e){
        e.preventDefault();
        const selectedCity = selectCity(cityList, inp.value); // Najde vybrané město
        if(selectedCity){
            getWeatherData(selectedCity)
                .then(weatherData => {
                    createTable(weatherData); // Vytvoří tabulku s počasím
                    cityText.innerHTML = inp.value;
                })
                .catch(error => console.error('Error:', error))
        }
    });
}


// Získání dat o počasí pro vybrané město
async function getWeatherData(cityData){
    const unit = navigator.language === "en-US" ? "imperial" : "metric"; // Nastaví jednotky podle jazyka
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&units=${unit}&appid=3097a1417bbafbd6e40a98e639e9d104`;
    const response = await fetch(apiUrl);
    if(!response.ok){
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

// Vytvoření tabulky s předpovědí počasí
function createTable(weatherData){
    const table = document.getElementById("myTable");
    const lang = navigator.language;
    const tableContent = weatherData.list.reduce((acc, stamp, index, array) => {
        const currentStampDate = stamp.dt_txt.split(" ")[0];
        const timePart = stamp.dt_txt.split(" ")[1];
        const temperature = stamp.main.temp;
        const iconUrl = `https://openweathermap.org/img/wn/${stamp.weather[0].icon}.png`;

        const { displayTime, unit } = formatTime(timePart, lang);
        const currentDisplayDate = formatDate(currentStampDate, lang);

        if (index === 0 || acc.prevStampDate !== currentStampDate) {
            if (index !== 0) {
                acc.html += '</tr>';
            }
            acc.html += `<tr><td class="dateDisplay">${currentDisplayDate}</td>`;
        }

        acc.html += `<td><strong>${displayTime}</strong><br/>${temperature}°${unit}<br/><img src="${iconUrl}"></td>`;
        acc.prevStampDate = currentStampDate;

        if (index === array.length - 1) {
            acc.html += '</tr>';
        }

        return acc;
    }, {html: '', prevStampDate: '' }).html;

    table.innerHTML = tableContent;
}

// Formátování času podle jazyka
function formatTime(timePart, lang){
    const timeArr = timePart.split(":");
    const hour = parseInt(timeArr[0], 10);
    const minute = timeArr[1];

    const formatEnglish = () => {
        if (hour > 12) {
            return `${hour - 12}:${minute} PM`;
        } else if (hour < 1) {
            return `12:${minute} PM`;
        } else {
            return `${hour}:${minute} AM`;
        }
    };

    const formatArabic = () => {
        if (hour > 12) {
            return `${hour - 12}:${minute} م`;
        } else if (hour < 1) {
            return `12:${minute} م`;
        } else {
            return `${hour}:${minute} ص`;
        }
    };

    const formatDefault = () => `${timeArr[0]}:${minute}`;

    const displayTime = lang === "en-US" ? formatEnglish()
                      : lang === "ar" ? formatArabic()
                      : formatDefault();

    const unit = lang === "en-US" ? "F" : "C";

    return { displayTime, unit };
}

// Formátování data podle jazyka
function formatDate(currentStampDate, lang) {
    const currentDateArr = currentStampDate.split("-");

    const formatCS_DE_RU = () => `${currentDateArr[2]}.${currentDateArr[1]}.${currentDateArr[0]}`;
    const formatEN_US = () => `${currentDateArr[1]}/${currentDateArr[2]}/${currentDateArr[0]}`;
    const formatEN_FR_ES_AR = () => `${currentDateArr[2]}/${currentDateArr[1]}/${currentDateArr[0]}`;
    const formatZH_CN_JA = () => `${currentDateArr[0]}/${currentDateArr[1]}/${currentDateArr[2]}`;
    const formatDefault = () => `${currentDateArr[2]}/${currentDateArr[1]}/${currentDateArr[0]}`;

    return lang === "cs" || lang === "de" || lang === "ru" ? formatCS_DE_RU()
         : lang === "en-US" ? formatEN_US()
         : lang === "en" || lang === "fr" || lang === "es" || lang === "ar" ? formatEN_FR_ES_AR()
         : lang === "zh-CN" || lang === "ja" ? formatZH_CN_JA()
         : formatDefault();
}