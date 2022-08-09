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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const geocodeLocation = (pathParameters) => __awaiter(void 0, void 0, void 0, function* () {
    let dataString = '';
    let location = '';
    return yield new Promise((resolve, reject) => {
        // Doesn't make the request if no location is provided in URL
        if (!pathParameters || !pathParameters.proxy) {
            resolve({
                statusCode: 400,
                body: 'Please provide a location in url'
            });
        }
        else {
            location = pathParameters.proxy;
        }
        https_1.default.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.GEO_KEY}&limit=1`, function (res) {
            // Upon receiving a data chunk, adds it to the data string
            res.on('data', (chunk) => {
                dataString += chunk;
            });
            // Upon no more chunks being received
            res.on('end', () => {
                let latitude = '';
                let longitude = '';
                // Will try to parse the obtained data, returning an internal server error if it fails
                // If invalid location has been searched, parsing will result in a TypeError which requires catching
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
            // If error occurs, reject with an internal server error
        }).on('error', (err) => {
            console.log(err);
            reject({
                statusCode: 500,
                body: 'Error in location search'
            });
        });
    });
});
module.exports = { geocodeLocation };
