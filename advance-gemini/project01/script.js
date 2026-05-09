const WEATHER_CODES = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌦️' },
    53: { desc: 'Moderate drizzle', icon: '🌦️' },
    55: { desc: 'Dense drizzle', icon: '🌦️' },
    61: { desc: 'Slight rain', icon: '🌧️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    71: { desc: 'Slight snow fall', icon: '❄️' },
    73: { desc: 'Moderate snow fall', icon: '❄️' },
    75: { desc: 'Heavy snow fall', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
};

const cityInput = document.getElementById('city-input');
const suggestionsList = document.getElementById('suggestions');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const welcomeScreen = document.getElementById('welcome-screen');
const loader = document.getElementById('loader');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let debounceTimer;

// Handle typing for suggestions
cityInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 2) {
        suggestionsList.classList.remove('active');
        return;
    }

    debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
    }, 300);
});

async function fetchSuggestions(query) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
        const data = await response.json();

        if (data.results) {
            renderSuggestions(data.results);
        } else {
            suggestionsList.classList.remove('active');
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

function renderSuggestions(results) {
    suggestionsList.innerHTML = '';
    results.forEach(city => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <span class="city-name">${city.name}</span>
            <span class="country">${city.admin1 ? city.admin1 + ', ' : ''}${city.country}</span>
        `;
        div.addEventListener('click', () => {
            cityInput.value = city.name;
            suggestionsList.classList.remove('active');
            getWeather(city.latitude, city.longitude, city.name, city.country);
        });
        suggestionsList.appendChild(div);
    });
    suggestionsList.classList.add('active');
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.remove('active');
    }
});

searchBtn.addEventListener('click', () => {
    const query = cityInput.value.trim();
    if (query) {
        // Find city first then get weather
        searchCity(query);
    }
});

async function searchCity(name) {
    showLoader();
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=1&language=en&format=json`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const city = data.results[0];
            getWeather(city.latitude, city.longitude, city.name, city.country);
        } else {
            alert('City not found');
            hideLoader();
        }
    } catch (error) {
        console.error('Error searching city:', error);
        hideLoader();
    }
}

async function getWeather(lat, lon, cityName, country) {
    showLoader();
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();

        updateUI(data, cityName, country);
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Failed to fetch weather data');
    } finally {
        hideLoader();
    }
}

function updateUI(data, cityName, country) {
    const current = data.current;
    const daily = data.daily;
    
    // Header
    document.getElementById('location-name').textContent = `${cityName}, ${country}`;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    // Main Stats
    document.getElementById('current-temp').textContent = `${Math.round(current.temperature_2m)}°`;
    const condition = WEATHER_CODES[current.weather_code] || { desc: 'Unknown', icon: '❓' };
    document.getElementById('weather-desc').textContent = condition.desc;
    
    const iconContainer = document.getElementById('weather-icon');
    iconContainer.innerHTML = condition.icon;
    iconContainer.style.fontSize = '3rem';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';

    document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById('uv-index').textContent = current.uv_index;

    // Forecast
    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';

    for (let i = 1; i < 8; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayCondition = WEATHER_CODES[daily.weather_code[i]] || { desc: 'Unknown', icon: '❓' };
        
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon" style="font-size: 2rem;">${dayCondition.icon}</div>
            <div class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}°</div>
            <div style="font-size: 0.75rem; color: var(--text-muted)">${Math.round(daily.temperature_2m_min[i])}°</div>
        `;
        forecastGrid.appendChild(item);
    }

    welcomeScreen.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
}

function showLoader() {
    loader.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    welcomeScreen.classList.add('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

// Theme Handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme || 'dark';
    
    setTheme(theme);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

// Initialize
initTheme();
