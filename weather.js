import axios from 'axios';
import { isFuture, parseISO } from 'date-fns';

function parseCurrentWeather({ current_weather, daily }) {
  const {
    temperature: currentTemp,
    windspeed: windSpeed,
    weathercode: iconCode
  } = current_weather;

  const {
    temperature_2m_max: [maxTemp],
    temperature_2m_min: [minTemp],
    apparent_temperature_max: [maxFeelsLike],
    apparent_temperature_min: [minFeelsLike],
    precipitation_sum: [precip]
  } = daily;

  return {
    currentTemp: Math.round(currentTemp),
    highTemp: Math.round(maxTemp),
    lowTemp: Math.round(minTemp),
    highFeelsLike: Math.round(maxFeelsLike),
    lowFeelsLike: Math.round(minFeelsLike),
    windSpeed: Math.round(windSpeed),
    precip: Math.round(precip * 100) / 100,
    iconCode
  };
}

function parseDailyWeather({ daily }) {
  return daily.time.map((timestamp, index) => {
    return {
      timestamp: timestamp,
      iconCode: daily.weathercode[index],
      maxTemp: Math.round(daily.temperature_2m_max[index])
    };
  });
}

function parseHourlyWeather({ current_weather, hourly }) {
  return hourly.time
    .map((timestamp, index) => {
      return {
        timestamp: timestamp,
        iconCode: hourly.weathercode[index],
        temp: Math.round(hourly.temperature_2m[index]),
        feelsLike: Math.round(hourly.apparent_temperature[index]),
        windSpeed: Math.round(hourly.windspeed_10m[index]),
        precip: Math.round(hourly.precipitation[index] * 100) / 100
      };
    })
    .filter(({ timestamp }) =>
      isFuture(parseISO(timestamp), parseISO(current_weather.time))
    );
}

export async function getWeather(latitude, longitude, timezone = 'auto') {
  const { data } = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
    params: {
      latitude,
      longitude,
      timezone,
      current_weather: true,
      hourly: `temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m`,
      daily: `weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum`
    }
  });

  const current = parseCurrentWeather(data);
  const daily = parseDailyWeather(data);
  const hourly = parseHourlyWeather(data);

  return {
    current,
    daily,
    hourly
  };
}
