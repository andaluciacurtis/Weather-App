// Allow the user to search for a city and list cities that come up for them to choose from
// Once a city is chosen, send the coordinates to the weather API and display
// Also display the name along with the weather

// Weather necessities:
// - current weather
// - weather in an hour, two, three, etc, up to 10

const temperature = document.querySelector('.temperature');
const weatherDesc = document.querySelector('.weather-desc');
const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');
const unitContainer = document.querySelector('.units');

const metricButton = document.querySelector('.metric');
const imperialButton = document.querySelector('.imperial');

let units = "imperial";
let unitShorthand = "F";
let city = "Tokyo";

var today = new Date();
var currentHour = today.getHours();

var cityInput = document.querySelector(".city-input");
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    city = cityInput.value;
    getWeather();
  }
})

async function getCoordinates() {
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
  const data = await response.json();
  
  return [data[0].lat, data[0].lon];
}

async function getWeather() {
  const coords = await getCoordinates();
  console.log(coords);
  
  const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${coords[0]}&lon=${coords[1]}&exclude=minutely,daily&appid=${apiKey}&units=${units}`);
  const data = await response.json();

  console.log(data);

  // Main weather info
  let mainWeather = data["current"]["weather"][0]["description"];
  
  temperature.innerHTML = `${Math.round(data["current"]["temp"])}`;
  unitContainer.innerHTML = `°${unitShorthand}`;
  weatherDesc.innerHTML = `${mainWeather}`;

  // Creating the hourly forecast
  let hourlyForecast = data["hourly"];

  for (let i = 0; i < 10; i++) {
    let hour = currentHour + i;

    console.log(hour);
    let hourDiv = document.createElement("div");
    let hourWeather = hourlyForecast[i]["weather"][0]["main"];
    let hourTemp = hourlyForecast[i]["temp"];

    hourDiv.innerHTML = `
      <p>${hour}:00</p>
      <p>${hourWeather}</p>
      <p>${hourTemp}</p>
    `
    hourlyForecastContainer.appendChild(hourDiv);
  }

  
}
