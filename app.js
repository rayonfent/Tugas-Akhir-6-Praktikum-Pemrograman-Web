/* ============================================================
  Weather Dashboard — app.js
   ============================================================ */

/* API KEY */
const GEO_API_KEY = "d5dd8269cbmsh678f3c512b5538fp1bc8cfjsn69c663677ca7";
const WEATHER_API_KEY = "aa05b5deb25fc388cd03322d3a12befe";

/* ============================================================
   STATE GLOBAL
============================================================ */
let unit = "metric";
let isDark = false;
let currentCity = null;

let lastWeather = null;
let lastForecast = null;

let tempChart = null;

/* ============================================================
   ELEMENTS
============================================================ */
const statusText = document.getElementById("statusText");
const lastUpdated = document.getElementById("lastUpdated");

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

const locationEl = document.getElementById("location");
const localTimeEl = document.getElementById("localTime");
const conditionEl = document.getElementById("condition");
const tempEl = document.getElementById("temp");
const weatherIconEl = document.getElementById("weatherIcon");

const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const cloudsEl = document.getElementById("clouds");
const dewEl = document.getElementById("dew");
const sunEl = document.getElementById("sun");

const forecastList = document.getElementById("forecastList");

const favoritesList = document.getElementById("favoritesList");

/* ============================================================
   HELPERS
============================================================ */
function setStatus(t) {
  statusText.textContent = t;
}

function KtoC(k) { return k - 273.15; }
function KtoF(k) { return (k - 273.15) * 9/5 + 32; }

function convertTemp(kelvin) {
  if (kelvin === null || kelvin === undefined) return "—";

  return unit === "metric"
    ? `${Math.round(KtoC(kelvin))}°C`
    : `${Math.round(KtoF(kelvin))}°F`;
}

/* ============================================================
   AUTOCOMPLETE (GeoDB Cities)
============================================================ */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  if (!q) { suggestions.innerHTML = ""; return; }
  fetchSuggestions(q);
});

async function fetchSuggestions(q) {
  setStatus("Searching...");

  const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=5&types=CITY&namePrefix=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": GEO_API_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      }
    });
    const json = await res.json();

    suggestions.innerHTML = "";

    json.data.forEach(city => {
      const div = document.createElement("div");
      div.textContent = `${city.city}, ${city.country}`;
      div.className = "p-3 bg-white/40 hover:bg-white cursor-pointer";
      div.onclick = () => {
        currentCity = {
          name: city.city,
          country: city.country,
          lat: city.latitude,
          lon: city.longitude
        };
        searchInput.value = "";
        suggestions.innerHTML = "";
        fetchWeather();
      };
      suggestions.appendChild(div);
    });

  } catch (err) {
    suggestions.innerHTML = `<div class="p-3 text-red-600">API Error</div>`;
  } finally {
    setStatus("Idle");
  }
}

/* ============================================================
   FETCH WEATHER + FORECAST
============================================================ */
async function fetchWeather() {
  if (!currentCity) return;

  setStatus("Loading weather...");

  const { lat, lon } = currentCity;

  const currentURL =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;

  const forecastURL =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;

  try {
    const [cRes, fRes] = await Promise.all([
      fetch(currentURL), fetch(forecastURL)
    ]);

    lastWeather = await cRes.json();
    lastForecast = await fRes.json();

    renderCurrent(lastWeather);
    renderForecast(lastForecast);
    renderChart(lastForecast);

    lastUpdated.textContent =
      "Last update: " + new Date().toLocaleTimeString();

  } catch (err) {
    console.error(err);
    setStatus("Weather Error");
  } finally {
    setStatus("Idle");
  }
}

/* ============================================================
   RENDER CURRENT WEATHER
============================================================ */
function renderCurrent(d) {
  locationEl.textContent = `${currentCity.name}, ${currentCity.country}`;
  localTimeEl.textContent = new Date().toLocaleString();
  conditionEl.textContent = d.weather[0].description;
  tempEl.textContent = convertTemp(d.main.temp);

  weatherIconEl.innerHTML =
    `<img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@4x.png">`;

  humidityEl.textContent = d.main.humidity + "%";
  windEl.textContent = d.wind.speed + " m/s";
  pressureEl.textContent = d.main.pressure + " hPa";

  visibilityEl.textContent = (d.visibility / 1000).toFixed(1) + " km";
  cloudsEl.textContent = d.clouds.all + "%";

  // Dew point (approx)
  const dewPoint = d.main.temp - ((100 - d.main.humidity) / 5);
  dewEl.textContent = convertTemp(dewPoint);

  sunEl.textContent =
    new Date(d.sys.sunrise * 1000).toLocaleTimeString() +
    " / " +
    new Date(d.sys.sunset * 1000).toLocaleTimeString();
}

/* ============================================================
   RENDER 5-DAY FORECAST (Fully working daily mode!)
============================================================ */
function renderForecast(data) {
  forecastList.innerHTML = "";

  const groups = {};

  // Group entries into days
  data.list.forEach(item => {
    const dayKey = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(item);
  });

  const keys = Object.keys(groups).slice(0, 5);

  keys.forEach(dayKey => {
    const arr = groups[dayKey];

    const min = Math.min(...arr.map(a => a.main.temp_min));
    const max = Math.max(...arr.map(a => a.main.temp_max));

    const middle = arr[Math.floor(arr.length / 2)];

    const card = document.createElement("div");
    card.className = "glass p-4 rounded-2xl cursor-pointer fade";

    card.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="font-bold">${dayKey}</div>
        <img src="https://openweathermap.org/img/wn/${middle.weather[0].icon}.png" class="w-10 h-10">
        <div class="font-bold">${convertTemp(min)} / ${convertTemp(max)}</div>
      </div>
      <div id="expand" class="hidden mt-3 space-y-2"></div>
    `;

    card.onclick = () => toggleForecast(card, arr);

    forecastList.appendChild(card);
  });
}

function toggleForecast(card, arr) {
  const panel = card.querySelector("#expand");

  if (!panel.classList.contains("hidden")) {
    panel.classList.add("hidden");
    return;
  }

  panel.innerHTML = "";

  arr.forEach(entry => {
    panel.innerHTML += `
      <div class="p-2 rounded-xl bg-white/50 dark:bg-black/30">
        ${new Date(entry.dt * 1000).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
        → ${convertTemp(entry.main.temp)}
        — ${entry.weather[0].description}
      </div>
    `;
  });

  panel.classList.remove("hidden");
}

/* ============================================================
   TEMPERATURE CHART (Dynamic)
============================================================ */
function renderChart(forecast) {
  const ctx = document.getElementById("tempChart");

  const labels = [];
  const temps = [];

  // first 10 entries (30 hours)
  forecast.list.slice(0, 10).forEach(item => {
    labels.push(
      new Date(item.dt * 1000).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
    );
    temps.push(
      Math.round(
        unit === "metric" ? KtoC(item.main.temp) : KtoF(item.main.temp)
      )
    );
  });

  if (tempChart) tempChart.destroy();

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature",
        data: temps,
        borderWidth: 4,
        borderColor: isDark ? "#60a5fa" : "#2563eb",
        tension: 0.35,
        fill: false
      }],
    },
    options: {
      plugins: { legend: { display:false }},
      scales: {
        x: { ticks:{ color: isDark ? "#dbeafe" : "#1e293b" }},
        y: { ticks:{ color: isDark ? "#dbeafe" : "#1e293b" }}
      }
    }
  });
}

/* ============================================================
   FAVORITES
============================================================ */
function getFavs() {
  return JSON.parse(localStorage.getItem("favs") || "[]");
}
function saveFavs(arr) {
  localStorage.setItem("favs", JSON.stringify(arr));
}

document.getElementById("saveFavBtn").onclick = () => {
  if (!currentCity) return;
  const favs = getFavs();
  favs.unshift(currentCity);
  saveFavs(favs.slice(0, 10));
  renderFavs();
};

document.getElementById("clearFavsBtn").onclick = () => {
  saveFavs([]);
  renderFavs();
};

function renderFavs() {
  favoritesList.innerHTML = "";
  getFavs().forEach(city => {
    const btn = document.createElement("button");
    btn.className = "px-3 py-1 rounded-full glass text-sm";
    btn.textContent = city.name;
    btn.onclick = () => {
      currentCity = city;
      fetchWeather();
    };
    favoritesList.appendChild(btn);
  });
}
renderFavs();

/* ============================================================
   UNIT TOGGLE (°C ↔ °F)
============================================================ */
document.getElementById("unitToggle").onclick = () => {
  unit = unit === "metric" ? "imperial" : "metric";
  document.getElementById("unitToggle").textContent = unit === "metric" ? "°C" : "°F";

  if (lastWeather && lastForecast) {
    renderCurrent(lastWeather);
    renderForecast(lastForecast);
    renderChart(lastForecast);
  }
};

/* ============================================================
   DARK MODE TOGGLE
============================================================ */
document.getElementById("themeToggle").onclick = () => {
  const body = document.getElementById("page-body");
  isDark = !isDark;

  if (isDark) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }

  // apply glass-dark
  document.querySelectorAll(".glass, .glass-dark").forEach(el => {
    el.classList.toggle("glass-dark", isDark);
    el.classList.toggle("glass", !isDark);
  });

  if (lastForecast) renderChart(lastForecast);
};

/* ============================================================
   REFRESH BUTTON
============================================================ */
document.getElementById("refreshBtn").onclick = () => {
  if (currentCity) fetchWeather();
};

/* ============================================================
   AUTO REFRESH EVERY 5 MINUTES
============================================================ */
setInterval(() => {
  if (currentCity) fetchWeather();

}, 300000); // 5 minutes
