require('dotenv').config();
const https = require('https');
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { IncomingMessage } from "http";

export const lambdaHandler = async (event : APIGatewayProxyEvent) => {
    console.log(event);
    const { pathParameters } = event;

    const geoResponse : APIGatewayProxyResult = <APIGatewayProxyResult> await geocodeLocation(pathParameters);
    const location : string = JSON.parse(geoResponse.body).location;
    const latitude : string = JSON.parse(geoResponse.body).latitude;
    const longitude : string = JSON.parse(geoResponse.body).longitude;

    let url : string = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.WEATHER_KEY}`;

    const weatherResponse : APIGatewayProxyResult = <APIGatewayProxyResult> await getWeather(url);

    const forecast : string = JSON.parse(weatherResponse.body).weather[0].description;
    const temp : string = JSON.parse(weatherResponse.body).main.temp;
    const tempMin : string = JSON.parse(weatherResponse.body).main.temp_min;
    const tempMax : string = JSON.parse(weatherResponse.body).main.temp_max;
    const humidity : string = JSON.parse(weatherResponse.body).main.humidity;
    const windSpeed : string = JSON.parse(weatherResponse.body).wind.speed + " m/s";

    return {
        statusCode : 200,
        body : JSON.stringify({
            position : {
                location,
                latitude,
                longitude
            },
            weather : {
                forecast,
                temp,
                tempMin,
                tempMax,
                humidity,
                windSpeed
            }
        }, null, 4)
    };
}

async function geocodeLocation (pathParameters : APIGatewayProxyEvent["pathParameters"]) {
    let dataString : string = '';
    let location : string = '';

    return await new Promise((resolve, reject) => {
        if (!pathParameters || !pathParameters.proxy) {
            resolve({
                statusCode : 400,
                body : 'Please provide a location in url'
            })
        } else {
            location = pathParameters.proxy;
        }

        let url : string = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.GEO_KEY}&limit=1`;
        const req = https.get(url, function (res : IncomingMessage) {
            res.on('data', (chunk : string) => {
                dataString += chunk;
            });
            res.on('end', () => {
                const latitude = JSON.parse(dataString).features[0].center[1];
                const longitude = JSON.parse(dataString).features[0].center[0];

                resolve({
                    statusCode : 200,
                    body : JSON.stringify({
                        location,
                        latitude,
                        longitude
                    }, null, 4)
                });
            });
        });

        req.on('error', (err : Error) => {
            console.log(err);
            reject({
                statusCode : 500,
                body : 'Error in location search'
            });
        });
    });
}

async function getWeather (url : string) {
    let dataString : string = '';

    return await new Promise((resolve, reject) => {
        const req = https.get(url, function (res : IncomingMessage) {
            res.on('data', (chunk : string) => {
                dataString += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode : 200,
                    body : JSON.stringify(JSON.parse(dataString), null, 4)
                });
            });
        });

        req.on('error', (err : Error) => {
            console.log(err);
            reject({
                statusCode : 500,
                body : 'Error in weather search'
            });
        });
    });
}
