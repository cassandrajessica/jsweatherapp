const cityInput = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');

const apiKey = '5f3b27d191663870046ff15d123fe19b';

const homePageImg = document.querySelector('.img-container');
const homePageTitle = document.querySelector('.home-title');
const homePageDesc = document.querySelector('.home-desc');

const cityTitle = document.querySelector('.city-title');
const cityTempCurrent = document.querySelector('.current-temp');
const dateTime = document.querySelector('.time');
const currentWeatherIcon = document.querySelector('.current-weather-icon');
const weatherDesc = document.querySelector('.current-weather-desc');
const currentHumidity = document.querySelector('.humidity-percent');
const windSpeed = document.querySelector('.wind-speed');

const notFound = document.querySelector('.not-found');
const searchHeader = document.querySelector('.search-container');

const currentWeatherInfo = document.querySelector('.current-weather-info');
const hourlyWeather = document.querySelector('.hourly-weather-info-container');
const futureWeather = document.querySelector('.future-weather-container');


// handles search with button
searchBtn.addEventListener('click', () => {
    //checks for non empty input
    if(cityInput.value.trim() != '') {
        console.log(cityInput.value);
        
        updateWeatherInfo(cityInput.value);

        //clear input field
        cityInput.value = '';

        //removes focus from input field
        cityInput.blur();
    }
});


// handles 'enter' key to search
cityInput.addEventListener('keydown', (event) => {
    //checks for enter key and non empty input
    if(event.key == 'Enter' && cityInput.value.trim() != '') {
        console.log(cityInput.value);

        updateWeatherInfo(cityInput.value);

        //clear input field
        cityInput.value = '';

        // remove focus from input field
        cityInput.blur();
    }
})

// function to fetch weather data
getData = async(endPoint, city) => {
    // end point = weather/forecast
    const apiURL = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=imperial`;

    const response = await fetch(apiURL);
    return response.json();
}

// for getting the current weather icon
getWeatherIcon = (id) => {
    console.log(id);
    if(id <= 232) return 'thunderstorm.svg';
    if(id <= 321) return 'drizzle.svg';
    if(id <= 531) return 'rain.svg';
    if(id <= 622) return 'snow.svg';
    if(id <= 781) return 'atmosphere.svg';
    if(id <= 800) return 'clear2.svg';
    else return 'cloud.svg';
}

// function for updating date and time
getDateTime = () => {
    const currentDate = new Date();

    return currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).replace(',', ' | ');
}

// function to help handle display and weather data error
updateWeatherInfo = async (city) => {

    // pass weather to getData as URL end point and city
    const weatherData = await getData('weather', city);

    // handles unsucessfull API response
    if(weatherData.cod != 200) {

        //display error if city not found
        showDisplay(notFound, homePageImg);
        return;
    }

    const {
        name: cityPlace,
        main: {temp, humidity},
        weather: [{id, main}],
        wind: {speed}
    } = weatherData;

    cityTitle.textContent = cityPlace;
    cityTempCurrent.textContent = Math.round(temp) + " °F";
    currentHumidity.textContent = humidity + '%';
    weatherDesc.textContent = main;
    windSpeed.textContent = speed + ' M/S';

    currentWeatherIcon.src = `assets/images/${getWeatherIcon(id)}`;
    dateTime.textContent = getDateTime();

    await updateFutureForecast(city);
    await updateHourlyForecast(city);

    // display weather if data found
    showDisplay(currentWeatherInfo, hourlyWeather, futureWeather);
}

// function updates the weekly forecast
updateFutureForecast = async(city) => {
    const forecastsData =  await getData('forecast', city);

    forecastsData.list.forEach((forecastWeather, index) => {
        updateFutureForecastItems(forecastWeather, index)
    })
}

updateHourlyForecast = async(city) => {
    const forecastsData = await getData('forecast', city);

    const hourlyData = forecastsData.list.slice(0, 6);

    hourlyData.forEach((forecastWeather, index) =>{
        updateHourlyForecastItems(forecastWeather, index);
    })
}

updateHourlyForecastItems = (weatherData, index) => {
    const hourlyTime = document.querySelectorAll('.hourly-time');
    const hourlyTemp = document.querySelectorAll('.hourly-temp');
    const hourlyIcon = document.querySelectorAll('.hourly-icon');

    const {
        dt_txt,
        main: {temp},
        weather: {id}
    } = weatherData;

    const options= {
        hour: 'numeric',
        hour12: true
    };

    const time = new Date(dt_txt).toLocaleTimeString('en-US', options);

    if(hourlyTime[index]) {
        hourlyTime[index].textContent = time;
    }

    if(hourlyTemp[index]) {
        hourlyTemp[index].textContent = Math.round(temp) + " °F";
    }

    if(hourlyIcon[index]) {
        hourlyIcon[index].src = `assets/images/${getWeatherIcon(id)}`;
    }
}

updateFutureForecastItems = (weatherData, index) => {
    const futureForeCastIcon = document.querySelectorAll('.future-forecast-icon');
    const futureTemp = document.querySelectorAll('.future-temp');
    const futureWeatherDay = document.querySelectorAll('.future-forecast-item-day');

    const {
        weather: [{id}],
        main: {temp}
    } = weatherData;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + index + 1);
    const dateOption = {
        weekday: 'short'
    }
    const dateResult = futureDate.toLocaleDateString('en-US', dateOption);
    
    if(futureWeatherDay[index]) {
        futureWeatherDay[index].textContent = dateResult;
    }

    if(futureForeCastIcon[index]) {
        futureForeCastIcon[index].src = `assets/images/${getWeatherIcon(id)}`;
    } 

    if(futureTemp[index]) {
        futureTemp[index].textContent = Math.round(temp) + " °F"; 
    }
}

// function to control layouts visibility
showDisplay = (...showSections) => {
    
    // hiding these sections for certain search results
    [currentWeatherInfo, hourlyWeather, futureWeather, notFound, homePageImg, homePageTitle, homePageDesc]
        .forEach(section => section.style.display = 'none');

    // displays sections
    showSections.forEach(section => {
        if(section == hourlyWeather || section == futureWeather) {
            section.style.display = 'flex';
        } else {
            section.style.display = 'grid';
        }
    })

    // control font sizing for city
    if(cityTitle.textContent.length >= 18) {
        cityTitle.style.fontSize = '14pt';
    } else {
        cityTitle.style.fontSize = '';
    }
}