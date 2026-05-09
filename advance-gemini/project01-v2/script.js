// Hardcoded Weather Data
const weatherData = {
    "london": {
        city: "London, UK",
        temp: 18,
        condition: "Partly Cloudy",
        humidity: 62,
        wind: 12,
        uv: 4,
        visibility: 10,
        forecast: [
            { day: "Sun", temp: 19, cond: "☀️" },
            { day: "Mon", temp: 17, cond: "☁️" },
            { day: "Tue", temp: 16, cond: "🌧️" },
            { day: "Wed", temp: 18, cond: "⛅" },
            { day: "Thu", temp: 20, cond: "☀️" }
        ]
    },
    "paris": {
        city: "Paris, FR",
        temp: 22,
        condition: "Sunny",
        humidity: 45,
        wind: 8,
        uv: 6,
        visibility: 15,
        forecast: [
            { day: "Sun", temp: 23, cond: "☀️" },
            { day: "Mon", temp: 21, cond: "☀️" },
            { day: "Tue", temp: 19, cond: "⛅" },
            { day: "Wed", temp: 22, cond: "☀️" },
            { day: "Thu", temp: 24, cond: "☀️" }
        ]
    },
    "tokyo": {
        city: "Tokyo, JP",
        temp: 26,
        condition: "Humid",
        humidity: 82,
        wind: 15,
        uv: 3,
        visibility: 8,
        forecast: [
            { day: "Sun", temp: 25, cond: "🌧️" },
            { day: "Mon", temp: 27, cond: "⛅" },
            { day: "Tue", temp: 28, cond: "☀️" },
            { day: "Wed", temp: 26, cond: "🌧️" },
            { day: "Thu", temp: 25, cond: "☁️" }
        ]
    }
};

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// UI Updates
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

function updateWeatherUI(cityKey) {
    const data = weatherData[cityKey.toLowerCase()] || weatherData["london"];
    
    document.getElementById('cityName').textContent = data.city;
    document.getElementById('currentTemp').textContent = `${data.temp}°`;
    document.getElementById('conditionText').textContent = data.condition;
    document.getElementById('humidity').textContent = `${data.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind} km/h`;
    document.getElementById('uvIndex').textContent = data.uv;
    document.getElementById('visibility').textContent = `${data.visibility} km`;

    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    
    data.forecast.forEach(item => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${item.day}</div>
            <div style="font-size: 2rem; margin: 10px 0;">${item.cond}</div>
            <div class="forecast-temp">${item.temp}°</div>
        `;
        forecastContainer.appendChild(card);
    });
}

searchBtn.addEventListener('click', () => {
    const input = cityInput.value.trim().toLowerCase();
    if (weatherData[input]) {
        updateWeatherUI(input);
    } else {
        alert("City not found in hardcoded list. Try 'London', 'Paris', or 'Tokyo'.");
    }
});

// Initial Load
updateWeatherUI("london");
