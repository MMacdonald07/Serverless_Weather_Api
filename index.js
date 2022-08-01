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
// import { forecast } from "./utils/forecast";
const https = require('https');
const lambdaHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(event);
    let dataString = '';
    const response = yield new Promise((resolve, reject) => {
        const { pathParameters } = event;
        if (!pathParameters || !pathParameters.proxy) {
            resolve({
                statusCode: 400,
                body: 'Please provide a location in url'
            });
        }
        // @ts-ignore
        const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${pathParameters.proxy}.json?access_token=${process.env.GEO_KEY}&limit=1`;
        const req = https.get(geoUrl, function (res) {
            res.on('data', (chunk) => {
                dataString += chunk;
            });
            res.on('end', () => {
                const latitude = JSON.parse(dataString).features[0].center[1];
                const longitude = JSON.parse(dataString).features[0].center[0];
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        latitude,
                        longitude
                    }, null, 4)
                });
            });
        });
        req.on('error', (err) => {
            reject({
                statusCode: 500,
                body: 'Error in location search'
            });
        });
    });
    return response;
});
exports.lambdaHandler = lambdaHandler;
