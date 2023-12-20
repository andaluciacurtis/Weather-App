// Allow the user to search for a city and list cities that come up for them to choose from
// Once a city is chosen, send the coordinates to the weather API and display
// Also display the name along with the weather

// Weather necessities:
// - current weather
// - weather in an hour, two, three, etc, up to 10

const citySuggestions = document.querySelector('.city-suggestions');

const temperature = document.querySelector('.temperature');
const weatherDesc = document.querySelector('.weather-desc');

const curWeatherImg = document.querySelector('.current-weather-img')

const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');
const unitContainer = document.querySelector('.units');

const metricButton = document.querySelector('.metric');
const imperialButton = document.querySelector('.imperial');

let units = "imperial";
let unitShorthand = "F";
let city = "";
let coords = [];

var today = new Date();
var currentHour = today.getHours();

metricButton.addEventListener("click", ()=>{
  units = "metric";
  unitShorthand = "C";

  imperialButton.classList.remove("selected");
  metricButton.classList.add("selected");
  
  getWeather();
});

imperialButton.addEventListener("click", ()=>{
  units = "imperial";
  unitShorthand = "F";

  metricButton.classList.remove("selected");
  imperialButton.classList.add("selected");
  
  getWeather();
});

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
      city = currentCity;
      coords = [currentCity.latitude, currentCity.longitude];
      
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

  // Main weather info
  let mainWeather = data["current"]["weather"][0]["main"];
  
  temperature.innerHTML = `${Math.round(data["current"]["temp"])}`;
  unitContainer.innerHTML = `°${unitShorthand}`;
  weatherDesc.innerHTML = `${mainWeather}`;

  // Set the color scheme and weather images
  if (mainWeather === "Clear") {
    curWeatherImg.src= "Images/1x/sun.png";
  } else if (mainWeather == "Clouds") {
    curWeatherImg.src= "Images/1x/cloud.png";
  }

  // Creating the hourly forecast
  let hourlyForecast = data["hourly"];

  while (hourlyForecastContainer.hasChildNodes()) {
    hourlyForecastContainer.removeChild(hourlyForecastContainer.lastChild);
  }

  for (let i = 0; i < 10; i++) {
    let hour = currentHour + i;

    console.log(hourlyForecast[i]);
    
    let hourDiv = document.createElement("div");
    let hourTemp = hourlyForecast[i]["temp"];
    let icon = hourlyForecast[i]["weather"][0]["icon"];

    hourDiv.classList.add("hour-div");

    hourDiv.innerHTML = `
      <h3>${hour}:00</h3>
      <img src="http://openweathermap.org/img/wn/${icon}.png" id="icon">
      <p>${Math.round(hourTemp)}°${unitShorthand}</p>
    `
    hourlyForecastContainer.appendChild(hourDiv);
  }
}

document.getElementById('rainy').addEventListener('click', ()=> {
  curWeatherImg.src = "Images/1x/rain.png";
})

document.getElementById('sunny').addEventListener('click', ()=>{
  curWeatherImg.src= "Images/1x/sun.png";
})

document.getElementById('partcloudy').addEventListener('click', ()=>{
  curWeatherImg.src= "Images/1x/partcloud.png";
})

document.getElementById('cloudy').addEventListener('click', ()=>{
  curWeatherImg.src= "Images/1x/cloud.png";
})

document.getElementById('snowy').addEventListener('click', ()=>{
  curWeatherImg.src= "Images/1x/snow.png";
})

document.getElementById('stormy').addEventListener('click', ()=>{
  curWeatherImg.src= "Images/1x/storm.png";
})

document.getElementById('windy').addEventListener('click', ()=>{
  curWeatherImg.src= "Images/1x/wind.png";
})