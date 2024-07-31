window.onload = function(){
    getCityList().then(cityList => {
        const searchTerms = extractSearchTerms(cityList);
        const sortedSearchTerms = sortSearchTerms(searchTerms);
        setupAutocomplete(document.getElementById("myInput"), sortedSearchTerms, cityList);
        setupFormSubmit(document.getElementById("myForm"), document.getElementById("myInput"), cityList, document.getElementById("cityText"));
    });
}

async function getCityList(){
    const response = await fetch("city.list.json");
    const cityList = await response.json();
    return cityList;
}

function extractSearchTerms(cityList){
    return Object.values(cityList).map(city => {
        return city.state !== "" ? `${city.name}, ${city.country}, ${city.state}` : `${city.name}, ${city.country}`;
    });
}

function sortSearchTerms(terms){
    return terms.sort()
}

function selectCity(cityList, cityName){
    return Object.values(cityList).find(city => {
        return `${city.name}, ${city.country}, ${city.state}` === cityName || `${city.name}, ${city.country}` === cityName;
    });
}

function setupAutocomplete(inp, arr, cityList){
    let currentFocus = -1

    inp.addEventListener("input", function(){
        handleInputEvent(inp, arr, cityList, currentFocus);
    });
    inp.addEventListener("keydown", function(e){
        handleKeyDown(e, currentFocus);
    });
    document.addEventListener("click", function(e){
        handleDocumentClick(e, inp);
    });
}

function handleInputEvent(inp, arr, cityList, currentFocus){
    const val = inp.value;
    closeAllLists(inp);
    if(!val) return false;

    const listContainer = document.createElement("DIV");
    listContainer.setAttribute("id", `${inp.id}-autocomplete-list`);
    listContainer.setAttribute("class", "autocomplete-items");
    inp.parentNode.appendChild(listContainer);

    const matchingCities = arr.filter(term => term.substr(0, val.length).toUpperCase() === val.toUpperCase()).slice(0, 100);

    matchingCities.forEach(city => {
        const item = document.createElement("DIV");
        item.innerHTML = `<strong>${city.substr(0, val.length)}</strong>${city.substr(val.length)}`;
        item.innerHTML += `<input type='hidden' value='${city}'>`;
        item.addEventListener("click", function(){
            inp.value = this.getElementsByTagName("input")[0].value;
            closeAllLists(inp);
        });
        listContainer.appendChild(item);
    })
}

function handleKeyDown(e, currentFocus){
    const listContainer = document.getElementById(`${e.target.id}-autocomplete-list`);
    if(!listContainer) return;

    const items = listContainer.getElementsByTagName("div");
    if(e.keyCode == 40){
        e.preventDefault();
        currentFocus++;
        addActive(items, currentFocus);
    } 
    else if(e.keyCode == 38){
        e.preventDefault();
        currentFocus--;
        addActive(items, currentFocus);
    }
    else if(e.keyCode == 13){
        e.preventDefault();
        if(currentFocus > -1){
            if(items) items[currentFocus].click();
        }
    }
}

function handleDocumentClick(e, inp){
    closeAllLists(inp, e.target)
}

function addActive(items, currentFocus){
    if(!items) return;
    removeActive(items);
    if(currentFocus >= items.length) currentFocus = 0;
    if(currentFocus < 0) currentFocus = (items.length - 1);
    items[currentFocus].classList.add("autocomplete-active");
}

function removeActive(items){
    for(const item of items){
        item.classList.remove("autocomplete-active");
    }
}

function closeAllLists(inp, elmnt){
    var items = document.getElementsByClassName("autocomplete-items");
    for(const item of items){
        if(elmnt !== item && elmnt !== inp){
            item.parentNode.removeChild(item);
        }
    }
}

function setupFormSubmit(form, inp, cityList, cityText){
    form.addEventListener("submit", function(e){
        e.preventDefault();
        const selectedCity = selectCity(cityList, inp.value);
        if(selectedCity){
            getWeatherData(selectedCity)
                .then(weatherData => {
                    createTable(weatherData);
                    cityText.innerHTML = inp.value;
                })
                .catch(error => console.error('Error:', error))
        }
    });
}

async function getWeatherData(cityData){
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&units=metric&appid=3097a1417bbafbd6e40a98e639e9d104`;
    const response = await fetch(apiUrl);
    if(!response.ok){
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

function createTable(weatherData){
    const table = document.getElementById("myTable");
    const tableContent = weatherData.list.reduce((acc, stamp, index, array) => {
        const currentStampDate = stamp.dt_txt.split(" ")[0];
        const timePart = stamp.dt_txt.split(" ")[1];
        const temperature = stamp.main.temp;
        const iconUrl = `https://openweathermap.org/img/wn/${stamp.weather[0].icon}.png`;

        if (index === 0 || acc.prevStampDate !== currentStampDate) {
            if (index !== 0) {
                acc.html += '</tr>';
            }
            acc.html += `<tr><td>${currentStampDate}</td>`;
        }

        acc.html += `<td>${timePart}<br/>${temperature}°C<br/><img src="${iconUrl}"></td>`;
        acc.prevStampDate = currentStampDate;

        if (index === array.length - 1) {
            acc.html += '</tr>';
        }

        return acc;
    }, {html: '', prevStampDate: '' }).html;

    table.innerHTML = tableContent;
}