// Allow the user to search for a city and list cities that come up for them to choose from
// Once a city is chosen, send the coordinates to the weather API and display
// Also display the name along with the weather

// Weather necessities:
// - current weather
// - weather in an hour, two, three, etc, up to 10
var cityInput = document.querySelector(".city-input");
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    console.log(cityInput.value);
  }
})

getWeather();

async function getWeather() {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Seattle&APPID=${weatherKey}`);
  const data = await response.json();
  
  console.log(data);
}
