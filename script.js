const innerContainer = document.querySelector('.inner-container');

const citySuggestions = document.querySelector('.city-suggestions');
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector('.search-button');

const cityHeader = document.querySelector('.city-header');
const temperature = document.querySelector('.temperature');
const unitContainer = document.querySelector('.units');
const weatherDesc = document.querySelector('.weather-desc');
const weatherImg = document.querySelector('.current-weather-img');

const errorMessage = document.querySelector(".error-message");

const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');

let units = "imperial";
let unitShorthand = "F";

let coords = [];

// ------- UPON OPENING WEBPAGE -------
// Choose random background theme
let themes = ["sunny", "partcloudy", "cloudy", "rainy", "stormy", "snowy", "windy"];
document.documentElement.className = `theme-${themes[Math.round(Math.random() * 6)]}`;

// Searching and finding cities
searchString = "";
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    clearTimeout(timeout);
    chooseDirectCity(cityInput.value);

  } else  {
    debounce(()=> {
      displaySearchResults(cityInput.value);
    }, 1000);
  }
});

searchButton.addEventListener("click", ()=> {
  clearTimeout(timeout);
  chooseDirectCity(cityInput.value);
})

// Used in order to stay within API call limit
let timeout;
let debounce = function(func, delay) {
  clearTimeout(timeout);
  timeout = setTimeout(func, delay);
}

// ------ ASYNC FUNCTIONS ------

const options = {
  method: 'GET',
  headers: {
     'X-RapidAPI-Key': xrapidAPIkey,
     'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
  }
}

// Displays the top 5 city suggestions based on the searchbar
async function displaySearchResults(citySearch) {
  errorMessage.innerHTML = '';
  citySuggestions.innerHTML = '';
  cityData = await getCityData(citySearch, 5);

  // For each city found, display it in the search results and add a listener
  for (let i = 0; i < cityData.data.length; i++) {
    let currentCity = cityData.data[i];

    currentCityContainer = document.createElement('p');
    currentCityContainer.textContent = `${currentCity.name}, ${currentCity.regionCode}, ${currentCity.countryCode}`;

    citySuggestions.appendChild(currentCityContainer);

    currentCityContainer.addEventListener("click", ()=> {
      displayCity(currentCity);
      getWeather();
    })
  }
}

// Gets data and weather for directly entered city
async function chooseDirectCity(citySearch) {
  let cityData = await getCityData(citySearch, 1);
  errorMessage.innerHTML = '';;
  
  try {
    displayCity(cityData.data[0]);
  } catch (err) {
    if (cityData.message) {
      errorMessage.innerHTML = cityData.message;
    } else {
      errorMessage.innerHTML = "Please enter a valid city.";
    }
    return;
  }

  getWeather();

}

// Uses the GeoDB API to get city information
async function getCityData(input, limit) {
  let url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?types=City&namePrefix=${input}&limit=${limit}&sort=-population`;
  const response = await fetch(url, options);
  const cityData = await response.json();

  return cityData;
}

// Resets search results and sets up city data
function displayCity (currentCity) {
  searchString = "";
  citySuggestions.innerHTML = '';
  cityInput.value = '';

  coords = [currentCity.latitude, currentCity.longitude];
  cityHeader.textContent = `${currentCity.name}, ${currentCity.countryCode}`;
}

// Finds weather for specified coordinates
// Displays current weather and temperature, plus a forecast for the next 10 hours
async function getWeather() {
  const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${coords[0]}&lon=${coords[1]}&exclude=minutely,daily&appid=${apiKey}&units=${units}`);
  const data = await response.json();

  // Main weather info
  let mainWeather = data["current"]["weather"][0]["main"];
  let mainDesc = data["current"]["weather"][0]["description"];
  let timezone = data["timezone"];
  
  innerContainer.style.display = "block";
  temperature.innerHTML = `${Math.round(data["current"]["temp"])}`;
  weatherDesc.innerHTML = `${mainWeather}`;

  setUnits();
  setTheme(mainDesc);

  // Creating the hourly forecast
  let hourlyForecast = data["hourly"];

  // Removing past forecast
  while (hourlyForecastContainer.hasChildNodes()) {
    hourlyForecastContainer.removeChild(hourlyForecastContainer.lastChild);
  }

  for (let i = 0; i < 10; i++) {
    // Setting up time to local
    let userTime = new Date((hourlyForecast[i]["dt"]) * 1000);
    let localTime = new Date(userTime.toLocaleString('en-US', {timeZone: timezone}));

    let hour = localTime.getHours();
    let amPm = hour >= 12 ? 'pm' : 'am';
    hour = (hour % 12) || 12;

    let hourDiv = document.createElement("div");
    let hourTemp = hourlyForecast[i]["temp"];
    let icon = hourlyForecast[i]["weather"][0]["icon"];

    hourDiv.classList.add("hour-div");

    hourDiv.innerHTML = `
      <h3>${hour}${amPm}</h3>
      <img src="http://openweathermap.org/img/wn/${icon}.png" id="icon">
      <p>${Math.round(hourTemp)}°${unitShorthand}</p>
    `
    hourlyForecastContainer.appendChild(hourDiv);
  }
}

// Sets up weather in either fahrenheit or celsius
function setUnits() {
  if (units==="metric") {
    unitContainer.innerHTML = `<span class="metric selected">°C</span> / <span class="imperial">F</span>`;
  } else {
    unitContainer.innerHTML = `<span class="imperial selected">°F</span> / <span class="metric">C</span>`;
  }

  let metricButton = document.querySelector('.metric');
  let imperialButton = document.querySelector('.imperial');

  metricButton.addEventListener("click", ()=>{
    units = "metric";
    unitShorthand = "C";
    getWeather();
  });
  
  imperialButton.addEventListener("click", ()=>{
    units = "imperial";
    unitShothand = "F";
    getWeather();
  });
}

// Takes in the main description and decides on theme based on it
function setTheme(mainDesc) {
  if (mainDesc === "clear sky") {
    weatherImg.src= "Images/1x/sun.png";
    document.documentElement.className = 'theme-sunny';
  } else if (mainDesc === "few clouds" || mainDesc === "scattered clouds" || mainDesc === "haze") {
    weatherImg.src= "Images/1x/partcloud.png";
    document.documentElement.className = 'theme-partcloudy';
  } else if (mainDesc === "broken clouds" || mainDesc === "overcast clouds") {
     weatherImg.src = "Images/1x/cloud.png";
     document.documentElement.className = 'theme-cloudy';
   } else if (mainDesc.includes("rain")) {
     weatherImg.src = "Images/1x/rain.png";
     document.documentElement.className = 'theme-rainy';
   } else if (mainDesc === "thunderstorm") {
     weatherImg.src = "Images/1x/storm.png";
     document.documentElement.className = 'theme-stormy';
   } else if (mainDesc.includes("snow")) {
     weatherImg.src = "Images/1x/snow.png";
     document.documentElement.className = 'theme-snowy';
   } else {
    weatherImg.src = "Images/1x/wind.png";
    document.documentElement.className = 'theme-windy';
   }
}