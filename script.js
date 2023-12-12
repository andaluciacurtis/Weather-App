// Allow the user to search for a city and list cities that come up for them to choose from
// Once a city is chosen, send the coordinates to the weather API and display
// Also display the name along with the weather

// Weather necessities:
// - current weather
// - weather in an hour, two, three, etc, up to 10

const temperature = document.querySelector('.temperature');
const weatherDesc = document.querySelector('.weather-desc');

let units = "imperial";



var cityInput = document.querySelector(".city-input");
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    console.log(cityInput.value);
  }
})

getWeather();

async function getWeather() {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Seattle&APPID=${weatherKey}&units=${units}`);
  const data = await response.json();
  console.log(data);

  let mainWeather = data["weather"][0]["main"];
  temperature.innerHTML = `${Math.round(data["main"]["temp"] * 1)}°F`;
  weatherDesc.innerHTML = `${mainWeather}`;
}
