document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const city = document.getElementById("city-input").value.trim();

  if (city) {
    searchWeather(city);
  }
});
//Weather function
async function searchWeather(city) {
  document.getElementById("loading").hidden = false;
  document.getElementById("error").hidden = true;

  try {
    // Get city coordinates
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
    );

    const geoData = await geo.json();

    if (!geoData.results) {
      throw new Error("City not found");
    }

    const location = geoData.results[0];

    // Get weather data
    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max,weather_code`,
    );

    const data = await weather.json();

    // Show sections
    document.getElementById("hero").hidden = false;
    document.getElementById("stats").hidden = false;
    document.getElementById("forecast-section").hidden = false;

    //Weather Summary(Hero section)
    const weatherInfo = getWeatherInfo(data.current.weather_code);

    document.getElementById("hero-icon").textContent = weatherInfo.icon;

    document.getElementById("city").textContent =
      `${location.name}, ${location.country}`;

    document.getElementById("temp").textContent =
      `${Math.round(data.current.temperature_2m)}°C`;

    document.getElementById("desc").textContent = weatherInfo.desc;

    //Stat
    document.getElementById("humidity").textContent =
      `${data.current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
      `${Math.round(data.current.wind_speed_10m)} km/h`;

    document.getElementById("uv").textContent = getUVLevel(
      data.daily.uv_index_max[0],
    );

    //Forecast
    const forecast = document.getElementById("forecast");
    forecast.innerHTML = "";

    for (let i = 0; i < 5; i++) {
      const date = new Date(data.daily.time[i]);

      const day = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const forecastInfo = getWeatherInfo(data.daily.weather_code[i]);

      forecast.innerHTML += `
        <div class="forecast-row">
          <span class="f-day">${day}</span>

          <span class="f-icon">${forecastInfo.icon}</span>

          <span class="f-temps">
            <span class="f-high">
              ${Math.round(data.daily.temperature_2m_max[i])}°
            </span>
            <span class="f-low">
              ${Math.round(data.daily.temperature_2m_min[i])}°
            </span>
          </span>
        </div>
      `;
    }
  } catch (err) {
    document.getElementById("error").hidden = false;
    document.getElementById("error").textContent = err.message;

    document.getElementById("hero").hidden = true;
    document.getElementById("stats").hidden = true;
    document.getElementById("forecast-section").hidden = true;
  }

  document.getElementById("loading").hidden = true;
}

//Weather type and its icons
function getWeatherInfo(code) {
  const c = Number(code);

  if (c === 0) return { desc: "Clear sky", icon: "☀️" };

  if ([1, 2, 3].includes(c))
    return { desc: "Partly cloudy", icon: "⛅" };

  if ([45, 48].includes(c))
    return { desc: "Foggy", icon: "🌫️" };

  if ([51, 53, 55].includes(c))
    return { desc: "Drizzle", icon: "🌦️" };

  if ([61, 63, 65].includes(c))
    return { desc: "Rain", icon: "🌧️" };

  if ([71, 73, 75].includes(c))
    return { desc: "Snow", icon: "❄️" };

  if ([80, 81, 82].includes(c))
    return { desc: "Rain showers", icon: "🌦️" };

  if (c === 95)
    return { desc: "Thunderstorm", icon: "⛈️" };

  return { desc: "Unknown", icon: "❓" };
}

// UV level function for range instead of values
function getUVLevel(uv) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  return "High";
}

// Default City
searchWeather("Lagos");
