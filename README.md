# tescoukol

Aplikace, která poskytuje předpovědi počasí pro města po celém světě. Obsahuje funkci vyhledávání měst s našeptávačem a zobrazuje údaje o počasí v tabulkovém formátu. 

## Funkce

 - **Vyhledávání měst s našeptávačem:** Uživatelé mohou vyhledávat města s prediktivní funkcí našeptávače, která zobrazuje odpovídající názvy měst během psaní.
 - **Zobrazení předpovědi počasí:** Po výběru města a odeslání formuláře aplikace načte a zobrazí 5denní předpověď počasí pro dané město v tabulkovém formátu.
 - **Lokalizované formáty času a data:** Aplikace upravuje zobrazení času a data podle jazykových nastavení uživatele.

## Spuštění

### Předpoklady
- Webový server pro obsluhu aplikačních souborů (při vývoji byl použit plugin Live Server pro VS Code). 
- API klíč od OpenWeatherMap pro načítání údajů o počasí.
- Webový prohlížeč (testovaná byla pouze aktuální verze prohlížeče Mozilla Firefox)

### Instalace

 1. Naklonujte si repozitář do svého lokálního zařízení:
 ```sh
 git clone https://github.com/broukosklivak/tescoukol.git
 ```
 
 2. Přesuňte se do složky projektu:
 ```sh
 cd tescoukol
 ```
 
### Konfigurace
 1. Otevřete soubor `script.js` 
 2. Nahraďte `appid` ve funkci `getWeatherData` vaším API klíčem od OpenWeatherMap:
 ```js
 const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.coord.lat}&lon=${cityData.coord.lon}&units=${unit}&appid=YOUR_API_KEY`;
 ```

### Použití
1. Spusťte `index.html` na webovém serveru.
2. Začněte psát název města do vstupního pole vyhledávání. Našeptávač zobrazí odpovídající názvy měst.
3. Vyberte město z nabídky našeptávače.
4. Odeslání formuláře načte a zobrazí předpověď počasí pro vybrané město.

## Vnitřní struktura
### Moduly a komponenty
- `index.html`: Hlavní HTML soubor obsahující strukturu aplikace.
- `style.css`: CSS soubor se styly aplikace.
- **JavaScriptové funkce `script.js`:**
    -  `window.onload`: Inicializuje aplikaci načtením dat o městech a nastavením našeptávače a odesílání formulářů.
    - `getCityList()`: Načítá seznam měst z lokálního JSON souboru.   
    - `extractSearchTerms(cityList)`: Extrahuje vyhledávací termíny ze seznamu měst pro funkci našeptávače.
    - `sortSearchTerms(terms)`: Řadí vyhledávací termíny abecedně.
    - `selectCity(cityList, cityName)`: Vybere město ze seznamu na základě uživatelského vstupu.
    - `setupAutocomplete(inp, arr, cityList)`: Nastavuje funkci našeptávače pro vstupní pole.
    - `handleInputEvent(inp, arr, cityList, currentFocus)`: Zpracovává události vstupu pro funkci našeptávače.
    - `handleKeyDown(e, currentFocus)`: Zpracovává stisknutí kláves pro navigaci v návrzích našeptávače.
    - `handleDocumentClick(e, inp)`: Zpracovává kliknutí mimo seznam našeptávače a zavírá ho.
    - `addActive(items, currentFocus)`: Přidává aktivní třídu k položce našeptávače.
    - `removeActive(items)`: Odstraňuje aktivní třídu ze všech položek našeptávače.
    - `closeAllLists(inp, elmnt)`: Zavře všechny seznamy našeptávače.
    - `setupFormSubmit(form, inp, cityList, cityText)`: Nastavuje odesílání formuláře.
    - `getWeatherData(cityData)`: Načítá údaje o počasí z OpenWeatherMap API.
    - `createTable(weatherData)`: Vytváří tabulku pro zobrazení předpovědi počasí.
    - `formatTime(timePart, lang)`: Formátuje čas podle jazykových nastavení uživatele.
    - `formatDate(currentStampDate, lang)`: Formátuje datum podle jazykových nastavení uživatele.