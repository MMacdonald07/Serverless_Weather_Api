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
exports.lambdaHandler = void 0;
require('dotenv').config();
const geocode_1 = require("./utils/geocode");
const forecast_1 = require("./utils/forecast");
const lambdaHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(event);
    const { pathParameters } = event;
    let geoResponse;
    let weatherResponse;
    geoResponse = yield (0, geocode_1.geocodeLocation)(pathParameters);
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
    weatherResponse = yield (0, forecast_1.getWeather)(latitude, longitude);
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
