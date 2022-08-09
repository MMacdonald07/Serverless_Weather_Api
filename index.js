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
require('dotenv').config();
const { geocodeLocation } = require("./utils/geocode");
const { getWeather } = require("./utils/forecast");
const lambdaHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(event);
    const { pathParameters } = event;
    let geoResponse;
    let weatherResponse;
    geoResponse = yield geocodeLocation(pathParameters);
    // If no location is inputted in endpoint will return invalid request error
    if (geoResponse.statusCode == 400) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                "Error": "Please provide a location in url"
            }, null, 4)
        };
        // If location is not found by mapbox will return internal server error
    }
    else if (geoResponse.statusCode == 500) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "Error": "Failed to geocode provided location"
            }, null, 4)
        };
    }
    // If successful geocoding request will save the location, latitude and longitude
    const location = JSON.parse(geoResponse.body).location;
    const latitude = JSON.parse(geoResponse.body).latitude;
    const longitude = JSON.parse(geoResponse.body).longitude;
    weatherResponse = yield getWeather(latitude, longitude);
    // If location is not found by openweathermap, will return internal server error
    if (weatherResponse.statusCode == 500) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "Error": "Failed to fetch weather data for provided location"
            }, null, 4)
        };
    }
    // If successful request, saves necessary information to return to user
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
module.exports = { lambdaHandler };
