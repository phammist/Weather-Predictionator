var searchHistory = [];
var weatherApiRootUrl = "https://api.openweathermap.org";
var weatherApiKey = "d91f911bcf2c0f925fb6535547a5ddc9";

var formatSearch = document.querySelector("#search-format");
var formSearch = document.querySelector("#search-form");
var nowToday = document.querySelector("#now");
var predictionNow = document.querySelector("#prediction");
var historySearch = document.querySelector("#search-history");

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function renderHistory() {
  historySearch.innerHTML = "";

  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-controls", "today forecast");
    btn.classList.add("history-btn", "btn-history");
    btn.setAttribute("data-search", searchHistory[i]);
    btn.textContent = searchHistory[i];
    historySearch.append(btn);
  }
}

function appendSearch(search) {
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  renderHistory();
}

function startHistory() {
  var storedHistory = localStorage.getItem("search-history");
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderHistory();
}

function renderWeatherNow(city, weather) {
  var date = dayjs().format("M/D/YYYY");
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var heading = document.createElement("h2");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  card.setAttribute("class", "card");
  cardBody.setAttribute("class", "card-body");
  card.append(cardBody);

  heading.setAttribute("class", "h3 card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  weatherIcon.setAttribute("class", "weather-img");
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  nowToday.innerHTML = "";
  nowToday.append(card);
}

function renderWeatherDisplay(forecast) {
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempF = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;
  var yeet = document.createElement("div");
  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var cardTitle = document.createElement("h5");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  yeet.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  yeet.setAttribute("class", "col-md");
  yeet.classList.add("five-day-card");
  card.setAttribute("class", "card bg-primary h-100 text-white");
  cardBody.setAttribute("class", "card-body p-2");
  cardTitle.setAttribute("class", "card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  cardTitle.textContent = dayjs(forecast.dt_txt).format("M/D/YYYY");
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  predictionNow.append(yeet);
}

function renderPrediction(dailyForecast) {
  var beginDt = dayjs().add(1, "day").startOf("day").unix();
  var lastDt = dayjs().add(6, "day").startOf("day").unix();

  var cheeseCo = document.createElement("div");
  var thing = document.createElement("h4");

  cheeseCo.setAttribute("class", "col-12");
  thing.textContent = "5-Day Forecast:";
  cheeseCo.append(thing);

  predictionNow.innerHTML = "";
  predictionNow.append(cheeseCo);

  for (var i = 0; i < dailyForecast.length; i++) {
    if (dailyForecast[i].dt >= beginDt && dailyForecast[i].dt < lastDt) {
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderWeatherDisplay(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderWeatherNow(city, data.list[0], data.city.timezone);
  renderPrediction(data.list);
}

function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoordinates(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert("Location not found");
      } else {
        appendSearch(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchTempt(e) {
  if (!formSearch.value) {
    return;
  }

  e.preventDefault();
  var search = formSearch.value.trim();
  fetchCoordinates(search);
  formSearch.value = "";
}

function handleHistoryClick(e) {
  if (!e.target.matches(".btn-history")) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute("data-search");
  fetchCoordinates(search);
}

startHistory();
formatSearch.addEventListener("submit", handleSearchTempt);
historySearch.addEventListener("click", handleHistoryClick);
