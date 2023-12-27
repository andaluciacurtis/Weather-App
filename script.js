// Allow the user to search for a city and list cities that come up for them to choose from
// Once a city is chosen, send the coordinates to the weather API and display
// Also display the name along with the weather

// Weather necessities:
// - current weather
// - weather in an hour, two, three, etc, up to 10

const citySuggestions = document.querySelector('.city-suggestions');

const temperature = document.querySelector('.temperature');
const weatherDesc = document.querySelector('.weather-desc');
const cityHeader = document.querySelector('.city-header');

const weatherImg = document.querySelector('.current-weather-img')

const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');
const unitContainer = document.querySelector('.units');



let units = "imperial";
let unitShorthand = "F";
let city = "";
let coords = [];

var today = new Date();
var currentHour = today.getHours();



var cityInput = document.querySelector(".city-input");

cityInput.oninput = ()=> {
  debounce(()=> {
     findCities(cityInput.value)
  }, 1000);
};

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    city = cityInput.value;
    coords = getCoordinates();
    getWeather();
  }
});

let timeout;
let debounce = function(func, delay) {
  clearTimeout(timeout);
  timeout = setTimeout(func, delay);
}

const options = {
  method: 'GET',
  headers: {
     'X-RapidAPI-Key': xrapidAPIkey,
     'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
  }
}

async function findCities(input) {
  let url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?types=City&namePrefix=${input}&limit=5`;
  const response = await fetch(url, options);
  const cityData = await response.json();

  citySuggestions.innerHTML = '';
  
  for (let i = 0; i < cityData.data.length; i++) {
    let currentCity = cityData.data[i];

    currentCityContainer = document.createElement('p');
    currentCityContainer.textContent = `${currentCity.name}, ${currentCity.countryCode}`;

    citySuggestions.appendChild(currentCityContainer);

    currentCityContainer.addEventListener("click", ()=> {
      citySuggestions.innerHTML = '';
      cityInput.value = '';

      city = currentCity;
      coords = [currentCity.latitude, currentCity.longitude];
      cityHeader.textContent = `${currentCity.name}, ${currentCity.countryCode}`;

      getWeather();
    })
  }
}

async function getCoordinates() {
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
  const data = await response.json();
  
  return [data[0].lat, data[0].lon];
}

async function getWeather() {
  const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${coords[0]}&lon=${coords[1]}&exclude=minutely,daily&appid=${apiKey}&units=${units}`);
  const data = await response.json();

  console.log(data);

  // Main weather info
  let mainWeather = data["current"]["weather"][0]["main"];
  let mainDesc = data["current"]["weather"][0]["description"];
  
  temperature.innerHTML = `${Math.round(data["current"]["temp"])}`;
  weatherDesc.innerHTML = `${mainWeather}`;

  if (units==="metric") {
    unitContainer.innerHTML = `<span class="metric selected">°C</span> / <span class="imperial">F</span>`;
  } else {
    unitContainer.innerHTML = `<span class="imperial selected">°F</span> / <span class="metric">C</span>`;
  }

  let metricButton = document.querySelector('.metric');
  let imperialButton = document.querySelector('.imperial');

  metricButton.addEventListener("click", ()=>{
    units = "metric";
    getWeather();
  });
  
  imperialButton.addEventListener("click", ()=>{
    units = "imperial";
    getWeather();
  });

  setTheme(mainDesc);

  // Creating the hourly forecast
  let hourlyForecast = data["hourly"];

  while (hourlyForecastContainer.hasChildNodes()) {
    hourlyForecastContainer.removeChild(hourlyForecastContainer.lastChild);
  }

  for (let i = 0; i < 10; i++) {
    let hour;
    if (i === 0) {
      hour = "Now";
    } else {
      hour = `${currentHour + i}:00`;
    }
    
    let hourDiv = document.createElement("div");
    let hourTemp = hourlyForecast[i]["temp"];
    let icon = hourlyForecast[i]["weather"][0]["icon"];

    hourDiv.classList.add("hour-div");

    hourDiv.innerHTML = `
      <h3>${hour}</h3>
      <img src="http://openweathermap.org/img/wn/${icon}.png" id="icon">
      <p>${Math.round(hourTemp)}°${unitShorthand}</p>
    `
    hourlyForecastContainer.appendChild(hourDiv);
  }
}

function setTheme(mainDesc) {
  weatherImg.src = "Images/1x/sun.png";

  if (mainDesc === "clear sky") {
    weatherImg.src= "Images/1x/sun.png";

    document.documentElement.className = 'theme-sunny';


  } else if (mainDesc === "few clouds") {
    weatherImg.src= "Images/1x/partcloud.png";
     
    document.documentElement.className = 'theme-partcloudy';

  } else if (mainDesc === "scattered clouds" || mainDesc === "broken clouds") {
     weatherImg.src = "Images/1x/cloud.png";

     document.documentElement.className = 'theme-cloudy';

   } else if (mainDesc === "shower rain" || mainDesc === "rain") {
     weatherImg.src = "Images/1x/rain.png";

     document.documentElement.className = 'theme-rainy';

   } else if (mainDesc === "thunderstorm") {

     weatherImg.src = "Images/1x/storm.png";

     document.documentElement.className = 'theme-stormy';

   } else if (mainDesc === "snow") {
     weatherImg.src = "Images/1x/snow.png";

     document.documentElement.className = 'theme-snowy';
   }
}