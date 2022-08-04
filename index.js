"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = exports.geocodeLocation = exports.lambdaHandler = void 0;
require('dotenv').config();
const https = require('https');
const lambdaHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(event);
    const { pathParameters } = event;
    let geoResponse;
    let weatherResponse;
    geoResponse = yield geocodeLocation(pathParameters);
    if (geoResponse.statusCode == 400) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                "Error": "Please provide a location in url"
            }, null, 4)
        };
    }
    else if (geoResponse.statusCode == 500) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "Error": "Failed to geocode provided location"
            }, null, 4)
        };
    }
    const location = JSON.parse(geoResponse.body).location;
    const latitude = JSON.parse(geoResponse.body).latitude;
    const longitude = JSON.parse(geoResponse.body).longitude;
    weatherResponse = yield getWeather(latitude, longitude);
    if (weatherResponse.statusCode == 500) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "Error": "Failed to fetch weather data for provided location"
            }, null, 4)
        };
    }
    const forecast = JSON.parse(weatherResponse.body).weather[0].description;
    const temp = JSON.parse(weatherResponse.body).main.temp;
    const tempMin = JSON.parse(weatherResponse.body).main.temp_min;
    const tempMax = JSON.parse(weatherResponse.body).main.temp_max;
    const humidity = JSON.parse(weatherResponse.body).main.humidity;
    const windSpeed = JSON.parse(weatherResponse.body).wind.speed + " m/s";
    return {
        statusCode: 200,
        body: JSON.stringify({
            position: {
                location,
                latitude,
                longitude
            },
            weather: {
                forecast,
                temp,
                tempMin,
                tempMax,
                humidity,
                windSpeed
            }
        }, null, 4)
    };
});
exports.lambdaHandler = lambdaHandler;
function geocodeLocation(pathParameters) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataString = '';
        let location = '';
        return yield new Promise((resolve, reject) => {
            if (!pathParameters || !pathParameters.proxy) {
                resolve({
                    statusCode: 400,
                    body: 'Please provide a location in url'
                });
            }
            else {
                location = pathParameters.proxy;
            }
            https.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.GEO_KEY}&limit=1`, function (res) {
                res.on('data', (chunk) => {
                    dataString += chunk;
                });
                res.on('end', () => {
                    let latitude = '';
                    let longitude = '';
                    try {
                        latitude = JSON.parse(dataString).features[0].center[1];
                        longitude = JSON.parse(dataString).features[0].center[0];
                    }
                    catch (e) {
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify({
                                "Error": "Failed to geocode location"
                            })
                        });
                    }
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({
                            location,
                            latitude,
                            longitude
                        })
                    });
                });
            }).on('error', (err) => {
                console.log(err);
                reject({
                    statusCode: 500,
                    body: 'Error in location search'
                });
            });
        });
    });
}
exports.geocodeLocation = geocodeLocation;
function getWeather(latitude, longitude) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataString = '';
        return yield new Promise((resolve, reject) => {
            https.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.WEATHER_KEY}`, function (res) {
                res.on('data', (chunk) => {
                    dataString += chunk;
                });
                res.on('end', () => {
                    if (JSON.parse(dataString).cod == "400") {
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify({
                                "Error": "Failed to fetch weather for given location"
                            })
                        });
                    }
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify(JSON.parse(dataString))
                    });
                });
            }).on('error', (err) => {
                console.log(err);
                reject({
                    statusCode: 500,
                    body: 'Error in weather search'
                });
            });
        });
    });
}
exports.getWeather = getWeather;
