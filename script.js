window.onload = function(){
    getCityList().then(cityList => {
        const searchTerms = extractSearchTerms(cityList);
        const sortedSearchTerms = sortSearchTerms(searchTerms);
        autocomplete(document.getElementById("myInput"), sortedSearchTerms);
    });
}

async function getCityList(){
    const response = await fetch("city.list.json");
    const cityList = await response.json();
    return cityList;
}

function extractSearchTerms(cityList){
    return Object.values(cityList).map(city => {
        if(city.state != ""){
            return city.name + ", " + city.country + ", " + city.state;
        }
        else{
            return city.name + ", " + city.country;
        }
    })
}

function sortSearchTerms(terms){
    return terms.sort()
}

function autocomplete(inp, arr){
    let currentFocus;

    inp.addEventListener("input", function(e){
        let a, b, i, val = this.value;

        closeAllLists();
        if(!val) return false;

        currentFocus = -1;

        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");

        this.parentNode.appendChild(a);

        let count = 0;
        for(i = 0; i < arr.length && count < 100; i++){
            if(arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";

                b.addEventListener("click", function(e){
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
                count++;
            }
        }
    });

    inp.addEventListener("keydown", function(e){
        var x = document.getElementById(this.id + "autocomplete-list");
        if(x) x = x.getElementsByTagName("div");
        if(e.keyCode == 40){
            currentFocus ++;
            addActive(x);
        }
    });

    function addActive(x){
        if(!x) return false;
        removeActive(x);
        if(currentFocus >= x.length) currentFocus = 0;
        if(currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x){
        for(var i = 0; i < x.length; i++){
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt){
        var x = document.getElementsByClassName("autocomplete-items");
        for(var i = 0; i < x.length; i++){
            if(elmnt != x[i] && elmnt != inp){
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function(e){
        closeAllLists(e.target);
    });
}