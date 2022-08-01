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
const https = require('https');
const lambdaHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(event);
    const { pathParameters } = event;
    const geoResponse = yield geocodeLocation(pathParameters);
    const location = JSON.parse(geoResponse.body).location;
    const latitude = JSON.parse(geoResponse.body).latitude;
    const longitude = JSON.parse(geoResponse.body).longitude;
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.WEATHER_KEY}`;
    const weatherResponse = yield getWeather(url);
    return weatherResponse;
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
            let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.GEO_KEY}&limit=1`;
            const req = https.get(url, function (res) {
                res.on('data', (chunk) => {
                    dataString += chunk;
                });
                res.on('end', () => {
                    const latitude = JSON.parse(dataString).features[0].center[1];
                    const longitude = JSON.parse(dataString).features[0].center[0];
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({
                            location,
                            latitude,
                            longitude
                        }, null, 4)
                    });
                });
            });
            req.on('error', (err) => {
                console.log(err);
                reject({
                    statusCode: 500,
                    body: 'Error in location search'
                });
            });
        });
    });
}
function getWeather(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataString = '';
        return yield new Promise((resolve, reject) => {
            const req = https.get(url, function (res) {
                res.on('data', (chunk) => {
                    dataString += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify(JSON.parse(dataString), null, 4)
                    });
                });
            });
            req.on('error', (err) => {
                console.log(err);
                reject({
                    statusCode: 500,
                    body: 'Error in weather search'
                });
            });
        });
    });
}
