// api for current weather info (example)
const apiCurrentExample = 'https://api.open-meteo.com/v1/forecast?latitude=61.5035&longitude=23.8305&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timeformat=unixtime&timezone=Europe%2FBerlin&forecast_days=1'
// google map api key (your own key here)
const googleKey = 'AIzaSyAVG20evx_fTmhwSIWY8sVF7S9jrKdKTsE'

// update Time/Geolocation
const updateIpLocation = async (coords) => {
  try {
    const ip = await ipAddress()
    const address = await getAddress(coords)
    const ipLocation = document.getElementById('ip-location')
    // check if address is available, then insert img
    if (address.results && address.results.length) {
      let flagAddress = address.results[address.results.length - 1].address_components[0].short_name
      let flag = ''
      flagAddress.length === 2 ? flag = `<img src="https://flagsapi.com/${flagAddress}/flat/64.png">` : flag
      let location = ''
      if (address.results.length >= 3) {
        location = address.results[address.results.length - 3]
      } else {
        location = address.results[address.results.length - 1]
      }
      ipLocation.innerHTML = `<div>IP: ${ip}</div>
      <div>Location: ${location.formatted_address}&nbsp${flag}</div>
      <div>Latitude: ${coords.lat}</div>
      <div>Longitude: ${coords.lng}</div>`
    } else {
      ipLocation.innerHTML = `<span>IP: ${ip}</span><br>
      <span>Location: Unknown</span><br>
      <span>Latitude: ${coords.lat}</span><br>
      <span>Longitude: ${coords.lng}</span>`
    }
  } catch (error) {
    const ip = await ipAddress()
    const ipLocation = document.getElementById('ip-location')
    ipLocation.innerHTML = `<span>IP: ${ip}</span><br>
    <span>Location: Unknown</span><br>
    <span>Latitude: ${coords.lat}</span><br>
    <span>Longitude: ${coords.lng}</span>`
  }
}

// update time-detail
const updateCurrentWeather = async (coords) => {
  const data = await fetchCurrent(coords)
  // use formatter to save last updated time
  const time = (moment.unix(data.current.time)).format('YYYY-MM-DD HH:mm')
  // get weather code information
  const is_day = data.current.is_day
  const weather_code = data.current.weather_code
  try {
    let weatherName, weatherImagePath
    const weatherCodeResponse = await fetch('../asset/json/descriptions.json')
    const weatherCode = await weatherCodeResponse.json()
    if (is_day === 0) {
      weatherName = weatherCode[weather_code].day.description
      weatherImagePath = weatherCode[weather_code].day.image
    } else {
      weatherName = weatherCode[weather_code].night.description
      weatherImagePath = weatherCode[weather_code].night.image
    }
    // add time
    const timeElement = document.getElementById('time')
    timeElement.innerHTML = `<div>Last updated</div><div>${time}</div>`
    // add weather code
    const weatherCodeElement = document.getElementById('weather-code')
    weatherCodeElement.innerHTML = ''
    const weatherNameElement = document.createElement('div')
    weatherNameElement.innerText = weatherName
    const weatherImageElement = document.createElement('img')
    weatherImageElement.src = weatherImagePath
    weatherImageElement.alt = weatherName
    weatherCodeElement.appendChild(weatherNameElement)
    weatherCodeElement.appendChild(weatherImageElement)
  } catch (error) {
    console.log(error)
  }
}

// update circles(temp, clound cover, humidity) on dashboard
const updateCircles = async (coords) => {
  const data = await fetchCurrent(coords)
  const temp = data.current.temperature_2m + ' °C'
  const tempApparent = data.current.apparent_temperature + ' °C'
  const humidity = data.current.relative_humidity_2m + ' %'
  const cloudCover = data.current.cloud_cover + ' %'
  const tempElement = document.getElementById('temp')
  tempElement.innerHTML = `<div><div class='numbers'><span></span><div>${temp}</div></div><div class='title'>Temperature</div></div>`
  const tempApparentElement = document.getElementById('apparent_temp')
  tempApparentElement.innerHTML = `<div><div class='numbers'><span></span><div>${tempApparent}</div></div><div class='title'>Apparent Temp</div></div>`
  const cloudCoverElement = document.getElementById('cloud')
  cloudCoverElement.innerHTML = `<div><div class='numbers'><span></span><div>${cloudCover}</div></div><div class='title'>Cloud Cover</div></div>`
  const humidityElement = document.getElementById('humidity')
  humidityElement.innerHTML = `<div><div class='numbers'><span></span><div>${humidity}</div></div><div class='title'>Humidity</div></div>`
}

// update details on dashboard
const updateDetails = async (coords) => {
  const data = await fetchCurrent(coords)
  const rain = data.current.precipitation + ' mm'
  const snowfall = data.current.snowfall + ' mm'
  const precipitation = data.current.precipitation + ' mm'
  const rainElement = document.getElementById('rain')
  rainElement.innerHTML = `<div>Rain</div><div>${rain}</div>`
  const snowfallElement = document.getElementById('snow')
  snowfallElement.innerHTML = `<div>Snowfall</div><div>${snowfall}</div>`
  const precipitationElement = document.getElementById('precipitation')
  precipitationElement.innerHTML = `<div>Precipitation</div><div>${precipitation}</div>`
}

// update pressure and wind on dashboard
const updatePressureAndWind = async (coords) => {
  const data = await fetchCurrent(coords)
  // add pressure
  const pressure = data.current.pressure_msl + ' hPa'
  const surfacePressure = data.current.surface_pressure + ' hPa'
  const pressureElement = document.getElementById('pressure')
  pressureElement.innerHTML = `<div>Pressure</div><div>${pressure}</div><div>Surface Pressure</div><div>${surfacePressure}</div>`
  // add wind
  const windSpeed = data.current.wind_speed_10m + ' km/h'
  const windGuests = data.current.wind_gusts_10m + ' km/h'
  const windDirection = data.current.wind_direction_10m + ' °'
  const windSpeedElement = document.getElementById('wind')
  windSpeedElement.innerHTML = `<div>Wind Speed</div><div>${windSpeed}</div><div>Wind Guest</div><div>${windGuests}</div><div>Wind Direction</div><div>${windDirection}</div>`
}

// get current address by google map geocode api
const getAddress = async (coords) => {
  try {
    // transform coords promise into object
    // vars: 1. lat 2. lng 3. api key
    const apiGeo = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${googleKey}&language=en`
    const response = await fetch(apiGeo)
    const data = await response.json()
    return data
  } catch (error) {
    return 'Error happened, this brower does not support geolocation.'
  }
}

// get coords
const getCoords = async () => {
  try {
    const position = await getLocation()
    // server needs to have SSL
    // position.coords.latitude, position.coords.longitude
    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    return coords
  } catch (error) {
    console.log('Error happened, this brower does not support geolocation.')
    return coords = {
      // default: tampere
      lat: 61.4991,
      lng: 23.7871
    }
  }
}

// return (navigator.geolocation.getCurrentPosition) -> position
const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      console.error('Geolocation error:', error.message)
      reject(error)
    })
  })
}

// fetch ip address, return user ip
const ipAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const ip = await response.json()
    return ip.ip
  } catch (error) {
    console.log(error)
  }
}

// fetch current weather info (whole info)
const fetchCurrent = async (coords) => {
  try {
    const apiCurrent = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timeformat=unixtime&timezone=Europe%2FBerlin&forecast_days=1`
    const response = await fetch(apiCurrent)
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

// fetch current page (page: 1)
const updateCurrentPage = async (coords) => {
  const container = document.getElementById('container')
  const current = document.createElement('div')
  current.id = 'Current'
  current.innerHTML = `
    <div class="general">
        <div class="dashboard-left">
            <div id="ip-location"></div>
            <div id="time-detail">
                <div id="time"></div>
                <div id="weather-code"></div>
            </div>
        </div>
        <div class="circle">
            <div id="temp"></div>
            <div id="apparent_temp"></div>
            <div id="cloud"></div>
            <div id="humidity"></div>
        </div>
    </div>
    <div class="detail">
        <div id="shower">
            <div id="rain"></div>
            <div id="snow"></div>
            <div id="precipitation"></div>
        </div>
        <div id="pressure"></div>
        <div id="wind"></div>
    </div>`
  container.appendChild(current)
  await updateIpLocation(coords)
  await updateCurrentWeather(coords)
  await updateCircles(coords)
  await updateDetails(coords)
  await updatePressureAndWind(coords)
}

// button click event
const updateChartView = (type, data) => {
  const container = document.getElementById('chart-container')
  if (currentChart) {
    currentChart.destroy()
    currentChart = null
  }
  container.innerHTML = ''
  const canvasBox = document.createElement('div')
  canvasBox.className = 'canvas-box'
  const canvas = document.createElement('canvas')
  canvas.id = 'chartbox'
  canvasBox.appendChild(canvas)
  container.appendChild(canvasBox)
  switch (type) {
    // case 1
    case 'Temperature': {
      // temperature
      let labels = data.hourly.time.map(time => moment(time).format('MM-DD HH:mm'))
      currentChart = new Chart(
        canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperature (Celsius)',
            data: data.hourly.temperature_2m,
            backgroundColor: 'rgba(31, 0, 92, 0.45)',
            borderColor: 'rgba(255, 181, 107, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                color: 'white',
                callback: (value) => {
                  return value + ' °C';
                },
                font: {
                  size: 14,
                }
              },
            },
            x: {
              ticks: {
                color: 'white',
              },
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
            title: {
              display: true,
              text: '7 Day Hourly Temperature',
              color: 'white',
              font: {
                size: 24,
                family: 'Arial',
                weight: 'bolder'
              }
            }
          }
        }
      })
      break
    }
    // case 2
    case 'Cloud Cover': {
      // cloud cover
      let labels = data.hourly.time.map(time => moment(time).format('MM-DD HH:mm'))
      currentChart = new Chart(
        canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cloud cover (%)',
            data: data.hourly.cloud_cover,
            backgroundColor: 'rgba(77, 196, 22, 0.45)',
            borderColor: 'rgba(21, 92, 19, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                color: 'white',
                callback: (value) => {
                  return value + '%';
                },
                font: {
                  size: 20,
                }
              },
            },
            x: {
              ticks: {
                color: 'white',
              },
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
            title: {
              display: true,
              text: '7 Day Hourly Cloud Cover',
              color: 'white',
              font: {
                size: 24,
                family: 'Arial',
                weight: 'bolder'
              }
            }
          }
        }
      })
      break
    }
    // case 3
    case 'Wind Speed': {
      // wind speed
      let labels = data.hourly.time.map(time => moment(time).format('MM-DD HH:mm'))
      currentChart = new Chart(
        canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Wind Speed (Km/h)',
            data: data.hourly.wind_speed_10m,
            backgroundColor: 'rgba(66, 0, 196, 0.45)',
            borderColor: 'rgba(255, 179, 244, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                color: 'white',
                callback: (value) => {
                  return value + ' Km/h';
                },
                font: {
                  size: 20,
                }
              },
            },
            x: {
              ticks: {
                color: 'white',
              },
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
            title: {
              display: true,
              text: '7 Day Hourly Wind Speed (Km/h)',
              color: 'white',
              font: {
                size: 24,
                family: 'Arial',
                weight: 'bolder'
              }
            }
          }
        }
      })
      break
    }
    // case 4
    case 'Sunshine Duration': {
      // sunshine_duration
      // change labels
      let labels = data.daily.time.map(time => moment(time).format('MM-DD'))
      let datasetHours = data.daily.sunshine_duration.map(duration => duration / 3600)
      currentChart = new Chart(
        canvas.getContext('2d'), {
        type: 'polarArea',
        data: {
          labels: labels,
          datasets: [{
            label: 'Sunshine Duration (hours)',
            // change to hours
            data: datasetHours,
            backgroundColor: 'rgba(4, 217, 206, 0.45)',
            borderColor: 'rgba(246, 255, 82, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              // minium 0
              suggestedMin: 0,
              ticks: {
                color: 'white',
                callback: (value) => {
                  return value + ' h';
                },
                font: {
                  size: 20,
                }
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
            title: {
              display: true,
              text: '7 Day daily Sunshine Duration (hours)',
              color: 'white',
              font: {
                size: 24,
                family: 'Arial',
                weight: 'bolder'
              }
            }
          }
        }
      })
      break
    }
    // case 5
    case 'Precipitation Probability': {
      // precipitation probability max
      let labels = data.daily.time.map(time => moment(time).format('MM-DD'))
      currentChart = new Chart(
        canvas.getContext('2d'), {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Precipitation Probability Max (percentage)',
            // change to hours
            data: data.daily.precipitation_probability_max,
            backgroundColor: 'rgba(217, 95, 95, 0.45)',
            borderColor: 'rgba(102, 222, 255, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              // minium 0
              suggestedMin: 0,
              ticks: {
                color: 'white',
                callback: (value) => {
                  return value + ' %';
                },
                font: {
                  size: 20,
                }
              },
              pointLabels: {
                color: 'white',
                font: {
                  size: 20,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
            title: {
              display: true,
              text: '7 Day daily Sunshine Precipitation Probability Max (percentage)',
              color: 'white',
              font: {
                size: 24,
                family: 'Arial',
                weight: 'bolder'
              }
            }
          }
        }
      })
      break
    }
    // default case
    default: {
      // temperature
      let labels = data.hourly.time.map(time => moment(time).format('MM-DD HH:mm'))
      currentChart = new Chart(
        canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Temperature (Celsius)',
            data: data.hourly.temperature_2m,
            backgroundColor: 'rgba(31, 0, 92, 0.45)',
            borderColor: 'rgba(255, 181, 107, 1)',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                color: 'white',
                callback: (value) => {
                  return value + ' °C';
                },
                font: {
                  size: 20,
                }
              },
            },
            x: {
              ticks: {
                color: 'white',
              },
            }
          },
          plugins: {
            legend: {
              labels: {
                color: 'white',
                font: {
                  size: 14,
                  family: 'Arial',
                  weight: 'bolder'
                }
              }
            },
            title: {
              display: true,
              text: '7 Day Hourly Temperature',
              color: 'white',
              font: {
                size: 24,
                family: 'Arial',
                weight: 'bolder'
              }
            }
          }
        }
      })
      break
    }
  }
  window.addEventListener('resize', () => {
    currentChart.resize();
  })
}

// chart variable
let currentChart = null

// update forecast chart
const updateChart = async (coords) => {
  try {
    let data = await fetchForecast(coords)
    const container = document.getElementById('container')
    let charts = document.getElementById('Charts')
    if (charts) {
      charts.remove()
    }
    charts = document.createElement('div')
    charts.id = 'Charts'
    container.appendChild(charts)
    const chart = document.createElement('div')
    chart.id = 'chart-container'
    charts.appendChild(chart)
    container.appendChild(charts)
    chart.innerHTML = '';
    const buttons = document.createElement('div')
    buttons.className = 'buttons'
    charts.appendChild(buttons)
    const names = ['Temperature', 'Cloud Cover', 'Wind Speed', 'Sunshine Duration', 'Precipitation Probability']
    // create buttons
    names.forEach((name) => {
      const button = document.createElement('button')
      button.innerText = name
      button.addEventListener('click', () => {
        updateChartView(name, data)
      })
      buttons.appendChild(button)
    })
    // initialize chart
    updateChartView(name[0], data)
  } catch (error) {
    console.log(error)
  }
}

// update forecast page (boxs)
const updateDailyWeather = async (coords) => {
  try {
    let data = await fetchForecast(coords)
    const container = document.getElementById('container')
    let forecast = document.getElementById('Forecast')
    if (forecast) {
      forecast.remove()
    }
    forecast = document.createElement('div')
    forecast.id = 'Forecast'
    container.appendChild(forecast)
    for (let i = 0; i < data.daily.time.length; i++) {
      const dayDiv = document.createElement('div')
      dayDiv.className = 'day-weather'
      // map every key's value (same index) in one array, then update it to dayDiv
      const dayData = Object.keys(data.daily).map((key) => data.daily[key][i])
      // check map array
      // console.log(dayData)
      // update timestamp
      const timeDiv = document.createElement('div')
      timeDiv.className = 'dayBox'
      const timeValue = document.createElement('span')
      timeValue.className = 'dayBox-text'
      timeValue.innerText = dayData[0]
      timeDiv.appendChild(timeValue)
      // update weather code
      const weatherDiv = document.createElement('div')
      weatherDiv.className = 'dayBox'
      const weatherNumber = dayData[1]
      try {
        const weatherCodeResponse = await fetch('../asset/json/descriptions.json')
        const weatherCode = await weatherCodeResponse.json()
        const weatherName = document.createElement('span')
        weatherName.className = 'dayBox-text'
        weatherName.innerText = weatherCode[weatherNumber].day.description
        const weatherImage = document.createElement('img')
        weatherImage.src = weatherCode[weatherNumber].day.image
        weatherImage.alt = weatherCode[weatherNumber].day.description
        weatherImage.className = 'dayBox-image'
        weatherDiv.appendChild(weatherName)
        weatherDiv.appendChild(weatherImage)
      } catch (error) {
        console.log(error)
      }
      // update temperature max
      const temperatureMax = document.createElement('div')
      temperatureMax.className = 'dayBox'
      const temperatureMaxName = document.createElement('span')
      temperatureMax.className = 'dayBox-text'
      temperatureMaxName.innerText = 'Max Temp'
      const temperatureMaxValue = document.createElement('span')
      temperatureMaxValue.className = 'dayBox-value'
      temperatureMaxValue.innerText = dayData[2] + '°C'
      temperatureMax.appendChild(temperatureMaxName)
      temperatureMax.appendChild(temperatureMaxValue)
      // update temperature min
      const temperatureMin = document.createElement('div')
      temperatureMin.className = 'dayBox'
      const temperatureMinName = document.createElement('span')
      temperatureMin.className = 'dayBox-text'
      temperatureMinName.innerText = 'Min Temp'
      const temperatureMinValue = document.createElement('span')
      temperatureMinValue.className = 'dayBox-value'
      temperatureMinValue.innerText = dayData[3] + '°C'
      temperatureMin.appendChild(temperatureMinName)
      temperatureMin.appendChild(temperatureMinValue)
      // update apparent temperature max
      const apparentMax = document.createElement('div')
      apparentMax.className = 'dayBox'
      const apparentMaxName = document.createElement('span')
      apparentMax.className = 'dayBox-text'
      apparentMaxName.innerText = 'Apparent Max'
      const apparentMaxValue = document.createElement('span')
      apparentMaxValue.className = 'dayBox-value'
      apparentMaxValue.innerText = dayData[4] + '°C'
      apparentMax.appendChild(apparentMaxName)
      apparentMax.appendChild(apparentMaxValue)
      // update apparent temperature min
      const apparentMin = document.createElement('div')
      apparentMin.className = 'dayBox'
      const apparentMinName = document.createElement('span')
      apparentMin.className = 'dayBox-text'
      apparentMinName.innerText = 'Apparent Min'
      const apparentMinValue = document.createElement('span')
      apparentMinValue.className = 'dayBox-value'
      apparentMinValue.innerText = dayData[5] + '°C'
      apparentMin.appendChild(apparentMinName)
      apparentMin.appendChild(apparentMinValue)
      // append to dayDiv
      dayDiv.appendChild(timeDiv)
      dayDiv.appendChild(weatherDiv)
      dayDiv.appendChild(temperatureMax)
      dayDiv.appendChild(temperatureMin)
      dayDiv.appendChild(apparentMax)
      dayDiv.appendChild(apparentMin)
      // append to container
      forecast.appendChild(dayDiv)
    }
    await updateChart(coords)
  } catch (error) {
    console.log(error)
  }
}

// fetch forecast weather info
const fetchForecast = async (coords) => {
  try {
    const apiForecast = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&hourly=temperature_2m,apparent_temperature,precipitation,cloud_cover,visibility,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunshine_duration,precipitation_probability_max`
    const response = await fetch(apiForecast)
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

// update forecast page
const updateForecastPage = async (coords) => {
  const forecast = document.getElementById('Forecast')
  if (forecast) {
    forecast.innerHTML = ''
  }
  await updateDailyWeather(coords)
}

// update history list
const updateHistoryList = async (data, selectedVariable, selectedDays) => {
  const history = document.getElementById('History')
  let list = document.getElementById('weatherList')
  if (list) {
    history.removeChild(list)
  }
  list = document.createElement('div')
  list.id = 'weatherList'
  history.appendChild(list)
  if (selectedDays >= 5) {
    const aside = document.createElement('aside')
    aside.className = 'history-aside'
    const asideButton = document.createElement('button')
    asideButton.className = 'history-aside-button'
    asideButton.innerText = 'Go Back'
    asideButton.addEventListener('click', () => {
      document.getElementById('container').scrollIntoView({ behavior: 'smooth' })
    })
    aside.appendChild(asideButton)
    const current = document.getElementById('container')
    current.appendChild(aside)
  }
  const variableArray = data.daily[selectedVariable]
  const timeArray = data.daily.time
  const weatherCodeArray = data.daily.weather_code
  list.innerHTML = ''
  for (let i = selectedDays; i >= 0; i--) {
    const dayBlock = document.createElement('div')
    dayBlock.className = 'dayBlock'
    const variable = document.createElement('div')
    variable.className = 'dayBlock-element'
    const unit = data.daily_units[selectedVariable]
    variable.innerHTML = `<div>${selectedVariable} </div><div><span>${variableArray[i]} ${unit}</span></div>`
    const time = document.createElement('div')
    time.className = 'dayBlock-element'
    time.innerHTML = `<div><span>${timeArray[i]}</span></div>`
    const weatherCode = document.createElement('div')
    weatherCode.className = 'dayBlock-element'
    let weatherName, weatherImagePath
    const weatherCodeResponse = await fetch('../asset/json/descriptions.json')
    const weather = await weatherCodeResponse.json()
    weatherName = weather[weatherCodeArray[i]].day.description
    weatherImagePath = weather[weatherCodeArray[i]].day.image
    // add weather code
    const weatherNameElement = document.createElement('div')
    weatherNameElement.innerText = weatherName
    const weatherImageElement = document.createElement('img')
    weatherImageElement.src = weatherImagePath
    weatherImageElement.alt = weatherName
    weatherCode.appendChild(weatherNameElement)
    weatherCode.appendChild(weatherImageElement)
    dayBlock.appendChild(time)
    dayBlock.appendChild(weatherCode)
    dayBlock.appendChild(variable)
    list.appendChild(dayBlock)
  }
}

// update History page
const updateHistory = async (coords) => {
  try {
    const weatherVariables = ['temperature_2m_max', 'temperature_2m_min',
      'apparent_temperature_max', 'apparent_temperature_min', 'sunrise,sunset', 'daylight_duration',
      'sunshine_duration', 'uv_index_max', 'uv_index_clear_sky_max', 'precipitation_sum', 'rain_sum',
      'showers_sum', 'snowfall_sum', 'precipitation_hours', 'precipitation_probability_max', 'wind_speed_10m_max',
      'wind_gusts_10m_max', 'wind_direction_10m_dominant', 'shortwave_radiation_sum', 'et0_fao_evapotranspiration']
    const days = [1, 2, 3, 4, 5, 6, 7, 14, 31, 60, 90]
    // create dropdown1: variables
    const dropdownVariable = document.createElement('select')
    dropdownVariable.className = 'dropdown-element'
    dropdownVariable.name = 'dropdown-variable'
    for (let i = 0; i < weatherVariables.length; i++) {
      const option = document.createElement('option')
      option.value = weatherVariables[i]
      option.innerText = weatherVariables[i]
      dropdownVariable.appendChild(option)
    }
    // create dropdown2: days
    const dropdownDays = document.createElement('select')
    dropdownDays.className = 'dropdown-element'
    dropdownDays.name = 'dropdown-days'
    for (let i = 0; i < days.length; i++) {
      const option = document.createElement('option')
      option.value = days[i]
      option.innerText = `Past ${days[i]} days`
      dropdownDays.appendChild(option)
    }
    // append
    const container = document.getElementById('container')
    const dropboxArea = document.createElement('div')
    dropboxArea.className = 'dropdown-area'
    dropboxArea.appendChild(dropdownVariable)
    dropboxArea.appendChild(dropdownDays)
    let history = document.getElementById('History')
    if (history) {
      history.remove()
    }
    history = document.createElement('div')
    history.id = 'History'
    history.appendChild(dropboxArea)
    container.appendChild(history)
    // fetch
    const fetchData = async () => {
      const selectedVariable = dropdownVariable.value
      const selectedDays = dropdownDays.value
      try {
        const data = await fetchHistory(coords, selectedVariable, selectedDays)
        // create list
        let list = document.getElementById('weatherList')
        if (list) {
          list.remove()
        }
        await updateHistoryList(data, selectedVariable, selectedDays)
      } catch (error) {
        console.log(error)
      }
    }
    dropdownVariable.addEventListener('change', fetchData)
    dropdownDays.addEventListener('change', fetchData)
    fetchData()
  } catch (error) {
    console.log(error)
  }
}

// fetch history weather info
const fetchHistory = async (coords, category = 'temperature_2m_max', past_days = 7) => {
  try {
    const apiHistory = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=weather_code,${category}&past_days=${past_days}&forecast_days=1`
    const response = await fetch(apiHistory)
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

// update history page
const updateHistoryPage = async (coords) => {
  await updateHistory(coords)
}

// default value of calulate method
let calculateMethod = 'mean'

// calculate summary
const statisticsCalculateSum = async (data, calculateMethod) => {
  const stats = new Statistics(data, {})
  return data.reduce(() => {
    switch (calculateMethod) {
      case 'mean': {
        return stats.arithmeticMean(data).toFixed(1)
      }
      case 'median': {
        return stats.median(data).toFixed(1)
      }
      case 'mode': {
        const modeOutput = stats.mode(data)[0]
        if (typeof modeOutput === 'undefined') {
          return 'NaN'
        } else {
          return modeOutput.toFixed(1)
        }
      }
      case 'range': {
        return stats.range(data).toFixed(1)
      }
      case 'standard deviation': {
        return stats.standardDeviation(data).toFixed(1)
      }
      case 'min': {
        return stats.minimum(data).toFixed(1)
      }
      case 'max': {
        return stats.maximum(data).toFixed(1)
      }
      default: {
        return stats.quartiles(data).toFixed(1)
      }
    }
  }, 0)
}

// statistics calculation
const statisticsCalculate = async (data, day, calculateMethod) => {
  const subArray = data.slice(day * 24, (day + 1) * 24)
  const stats = new Statistics(subArray, {})
  return subArray.reduce(() => {
    switch (calculateMethod) {
      case 'mean': {
        return stats.arithmeticMean(subArray).toFixed(1)
      }
      case 'median': {
        return stats.median(subArray).toFixed(1)
      }
      case 'mode': {
        const modeOutput = stats.mode(subArray)[0]
        if (typeof modeOutput === 'undefined') {
          return 'NaN'
        } else {
          return modeOutput.toFixed(1)
        }
      }
      case 'range': {
        return stats.range(subArray).toFixed(1)
      }
      case 'standard deviation': {
        return stats.standardDeviation(subArray).toFixed(1)
      }
      case 'min': {
        return stats.minimum(subArray).toFixed(1)
      }
      case 'max': {
        return stats.maximum(subArray).toFixed(1)
      }
      default: {
        return stats.quartiles(subArray).toFixed(1)
      }
    }
  }, 0)
}

// update statistics weather info
const updateStatistics = async (coords) => {
  try {
    const data = await fetchStatistics(coords)
    // create time entry, and delete from data
    const currentDate = moment(data.hourly.time[0].split('T')[0])
    const timeEntry = []
    for (let i = 0; i < 7; i++) {
      let newDate = currentDate.clone().add(i, 'days').format('YYYY-MM-DD');
      timeEntry.push(newDate);
    }
    delete data.hourly.time
    delete data.hourly.weather_code
    const tableData = data.hourly
    const keys = Object.keys(tableData)
    // create table
    const container = document.getElementById('container')
    let statistics = document.getElementById('Statistics')
    if (statistics) {
      const table = document.getElementById('table')
      table.innerHTML = ''
    } else {
      statistics = document.createElement('div')
      statistics.id = 'Statistics'
    }
    // create dropdown at top
    const dropdownContainer = document.createElement('div')
    statistics.appendChild(dropdownContainer)
    let dropdown = document.getElementById('dropdown-statistics')
    if (!dropdown) {
      dropdown = document.createElement('select')
      dropdown.id = 'dropdown-statistics'
      dropdown.name = 'function'
      let options = ['mean', 'median', 'mode', 'range', 'standard deviation', 'min', 'max']
      for (let i = 0; i < options.length; i++) {
        const option = document.createElement('option')
        option.value = options[i]
        option.innerText = 'Calculation: ' + options[i]
        dropdown.appendChild(option)
      }
      dropdown.addEventListener('change', async () => {
        calculateMethod = dropdown.value
        dropdown.querySelectorAll('option').forEach(option => {
          option.selected = option.value === calculateMethod
        })
        await updateStatistics(coords)
      })
      dropdownContainer.appendChild(dropdown)
    }
    // create table
    let table = document.getElementById('table')
    if (!table) {
      table = document.createElement('table')
      table.id = 'table'
    }
    statistics.appendChild(table)
    // create table header
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    const firstTh = document.createElement('th')
    firstTh.innerText = 'Time'
    headerRow.appendChild(firstTh)
    timeEntry.forEach(date => {
      const th = document.createElement('th')
      th.innerText = date
      headerRow.appendChild(th)
    })
    const lastTh = document.createElement('th')
    lastTh.innerText = 'Sum'
    headerRow.appendChild(lastTh)
    thead.appendChild(headerRow)
    table.appendChild(thead)
    // create table body
    const tbody = document.createElement('tbody')
    keys.forEach(async (key, index) => {
      const bodyRow = document.createElement('tr')
      // create table data
      const firstTd = document.createElement('td')
      firstTd.innerText = keys[index]
      bodyRow.appendChild(firstTd)
      // create table data
      timeEntry.forEach(async (day) => {
        const td = document.createElement('td')
        // get value after processing
        const returnValue = await statisticsCalculate(tableData[key], timeEntry.indexOf(day), calculateMethod)
        if (returnValue === 'NaN') {
          td.innerText = `${returnValue}`
        } else {
          td.innerText = `${returnValue} ${data.hourly_units[key]}`
        }
        bodyRow.appendChild(td)
      })
      const lastTd = document.createElement('td')
      let returnValue = await statisticsCalculateSum(tableData[key], calculateMethod)
      if (returnValue === 'NaN') {
        lastTd.innerText = `${returnValue}`
      } else {
        lastTd.innerText = `${returnValue} ${data.hourly_units[key]}`
      }
      bodyRow.appendChild(lastTd)
      tbody.appendChild(bodyRow)
    })
    table.appendChild(tbody)
    statistics.appendChild(table)
    container.appendChild(statistics)
  } catch (error) {
    console.log(error)
  }
}

// fetch statistics weather info
const fetchStatistics = async (coords) => {
  try {
    const apiStatistics = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_gusts_10m,soil_temperature_0cm,soil_moisture_0_to_1cm`
    const response = await fetch(apiStatistics)
    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

// update statistics page
const updateStatisticsPage = async (coords) => {
  await updateStatistics(coords)
}

// update background picture
const updateBackgroundPicture = async (coords) => {
  try {
    const data = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=is_day,weather_code`)
    const response = await data.json()
    const backgroundPictures = await fetch(`../asset/json/descriptions.json`)
    const backgroundJson = await backgroundPictures.json()
    const weatherCode = response.current.weather_code
    const dayTime = response.current.is_day ? 'day' : 'night'
    const body = document.body
    const backgroundUrl = backgroundJson[weatherCode][dayTime].background
    body.style.backgroundImage = `url('${backgroundUrl}')`
  } catch (error) {
    console.log(error)
  }
}

// update contact page
const updateContactPage = async () => {
  try {
    const container = document.getElementById('container')
    let contact = document.getElementById('Contact')
    if (!contact) {
      contact = document.createElement('footer')
      contact.id = 'Contact'
      container.appendChild(contact)
    }
    contact.innerHTML = `
    <div>
      <a href="/">
        <!-- my own icon -->
        <img id="icon" src="../asset/img/icon.png" alt="Brand">
      </a>
      <span>&nbsp;&nbsp;2024 Yannan Zhang</span>
    </div>
    <ul>
      <li><a href="https://twitter.com/Nancheung_" target="_blank"><i class="bi bi-twitter"></i></a></li>
      <li><a href="https://www.instagram.com/nancheung997/" target="_blank"><i class="bi bi-instagram"></i></a></li>
      <li><a href="https://www.facebook.com/profile.php?id=61550541868605" target="_blank"><i class="bi bi-facebook"></i></a></li>
    </ul>`
  } catch (error) {
    console.log(error)
  }
}

// select weather page
const selectPage = async (coords) => {
  try {
    await updateBackgroundPicture(coords)
    const currentTrigger = document.getElementById('currentButton')
    const forecastTrigger = document.getElementById('forecastButton')
    const historyTrigger = document.getElementById('historyButton')
    const statisticsTrigger = document.getElementById('statisticsButton')
    const contactTrigger = document.getElementById('contactButton')
    const cleanAll = () => {
      const container = document.getElementById('container')
      container.innerHTML = ''
    }
    const fetchPageView = (pageView) => {
      switch (pageView) {
        case 'Current': {
          cleanAll()
          updateCurrentPage(coords)
          break
        }
        case 'Forecast': {
          cleanAll()
          updateForecastPage(coords)
          break
        }
        case 'History': {
          cleanAll()
          updateHistoryPage(coords)
          break
        }
        case 'Statistics': {
          cleanAll()
          updateStatisticsPage(coords)
          break
        }
        case 'Contact': {
          updateContactPage()
          break
        }
        default: {
          cleanAll()
          updateCurrentPage(coords)
          break
        }
      }
    }
    currentTrigger.addEventListener('click', (e) => {
      e.preventDefault()
      fetchPageView('Current')
    })
    forecastTrigger.addEventListener('click', (e) => {
      e.preventDefault()
      fetchPageView('Forecast')
    })
    historyTrigger.addEventListener('click', (e) => {
      e.preventDefault()
      fetchPageView('History')
    })
    statisticsTrigger.addEventListener('click', (e) => {
      e.preventDefault()
      fetchPageView('Statistics')
    })
    contactTrigger.addEventListener('click', (e) => {
      e.preventDefault()
      fetchPageView('Contact')
      const footer = document.getElementById('Contact')
      footer.scrollIntoView({ behavior: 'smooth', block: "center" })
    })
    fetchPageView()
  } catch (error) {
    console.log(error)
  }
}

//create position select method (user input coordinates)
const updateCoordinate = async (coords) => {
  try {
    console.log(JSON.stringify(coords))
    const response = await fetch(`http://172.16.7.49:5000/api/coords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(coords)
    })
    if (response.status === 200) {
      const getResponse = await fetch(`http://172.16.7.49:5000/api/coords`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await getResponse.json()
      if (getResponse.status === 200) {
        return data
      }
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

let isFormEventAttached = false
// handle form submit
const handleFormSubmit = () => {
  if (!isFormEventAttached) {
    const form = document.getElementById('coords')
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const coords = {
        lat: parseFloat(document.getElementById('lat').value),
        lng: parseFloat(document.getElementById('lng').value)
      }
      const updateCoords = await updateCoordinate(coords)
      if (updateCoords) {
        // main function
        console.log("user Input coords, { latitude: " + updateCoords.lat + ", longitude: " + updateCoords.lng + "}")
        await selectPage(updateCoords)
      }
    })
    isFormEventAttached = true
  }
}

// handle input coordinates
const inputCoords = () => {
  const latInput = document.getElementById('lat')
  const latValue = document.getElementById('latInput')
  const lngInput = document.getElementById('lng')
  const lngValue = document.getElementById('lngInput')
  latInput.addEventListener('change', (e) => {
    latValue.value = e.target.value
  })
  lngInput.addEventListener('change', (e) => {
    lngValue.value = e.target.value
  })
  latValue.addEventListener('change', (e) => {
    if (e.target.value > 90 || e.target.value < -90) {
      latInput.value = e.target.value
    } else {
      alert('Please select a valid latitude')
    }
  })
  lngValue.addEventListener('change', (e) => {
    if (e.target.value > 180 || e.target.value < -180) {
      lngInput.value = e.target.value
    } else {
      alert('Please select a valid longitude')
    }
  })
}
// app start
const app = async () => {
  try {
    const defaultCoords = await updateCoordinate(await getCoords())
    selectPage(defaultCoords).then(() => {
      inputCoords()
      handleFormSubmit()
      const anime = document.createElement('div')
      anime.innerHTML = `<div class="square">
      <ul class="squareList">
          <li class="squareList-item"></li>
          <li class="squareList-item"></li>
          <li class="squareList-item"></li>
          <li class="squareList-item"></li>
          <li class="squareList-item"></li>
      </ul>
  </div>
  <div class="circle">
      <ul class="circleList">
          <li class="circleList-item"></li>
          <li class="circleList-item"></li>
          <li class="circleList-item"></li>
          <li class="circleList-item"></li>
          <li class="circleList-item"></li>
      </ul>
  </div>`
      const container = document.getElementById('container')
      container.appendChild(anime)
    })
  } catch (error) {
    console.log(error)
  }
}

app()

// auto refresh
const myRefresh = () => {
  window.location.reload()
  console.log("Auto refresh")
}
setTimeout("myRefresh()", 900000)


