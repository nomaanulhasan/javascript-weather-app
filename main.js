import { getWeather } from './weather';
import { ICON_MAP } from './iconMap';
import { format, parseISO } from 'date-fns';

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value;
}
function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`;
}

const currentIcon = document.querySelector('[data-current-icon]');
function renderCurrentWeather(current) {
  setValue('current-temp', current.currentTemp);
  setValue('current-high', current.highTemp);
  setValue('current-low', current.lowTemp);
  setValue('current-fl-high', current.highFeelsLike);
  setValue('current-fl-low', current.lowFeelsLike);
  setValue('current-wind', current.windSpeed);
  setValue('current-precip', current.precip);
  currentIcon.src = getIconUrl(current.iconCode);
}

const dailySection = document.querySelector('[data-day-section]');
const dayCardTemplate = document.getElementById('day-card-template');
function renderDailyWeather(daily) {
  dailySection.innerHTML = '';

  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true);
    setValue('temp', day.maxTemp, { parent: element });
    setValue('day', format(parseISO(day.timestamp), 'EEEE'), {
      parent: element
    });
    element.querySelector('[data-icon]').src = getIconUrl(day.iconCode);

    dailySection.appendChild(element);
  });
}

const hourlySection = document.querySelector('[data-hour-section]');
const hourRowTemplate = document.getElementById('hour-row-template');
function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = '';

  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true);
    setValue('temp', hour.temp, { parent: element });
    setValue('fl-temp', hour.feelsLike, { parent: element });
    setValue('wind', hour.windSpeed, { parent: element });
    setValue('precip', hour.precip, { parent: element });
    setValue('day', format(parseISO(hour.timestamp), 'EEEE'), {
      parent: element
    });
    setValue('time', format(parseISO(hour.timestamp), 'h aaa'), {
      parent: element
    });
    element.querySelector('[data-icon]').src = getIconUrl(hour.iconCode);

    hourlySection.appendChild(element);
  });
}

function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current);
  renderDailyWeather(daily);
  renderHourlyWeather(hourly);
  document.body.classList.remove('blurred');
}

navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
function positionSuccess({ coords }) {
  getWeather(
    coords.latitude,
    coords.longitude,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
    .then(renderWeather)
    .catch(e => {
      console.error(e);
      alert('Error rendering weather');
    });
}
function positionError() {
  alert(
    `There was an error getting your location. Please allow us to use your location and refresh page.`
  );
}
