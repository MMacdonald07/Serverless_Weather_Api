require('dotenv').config();
const https = require('https');
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { IncomingMessage } from "http";

export const lambdaHandler = async (event : APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    console.log(event);
    const { pathParameters } = event;
    let geoResponse : APIGatewayProxyResult;
    let weatherResponse : APIGatewayProxyResult;

    geoResponse = await geocodeLocation(pathParameters);

    if (geoResponse.statusCode == 400) {
        return {
            statusCode : 400,
            body : JSON.stringify({
                "Error" : "Please provide a location in url"
            }, null, 4)
        }
    } else if (geoResponse.statusCode == 500) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "Error" : "Failed to geocode provided location"
            }, null, 4)
        }
    }

    const location : string = JSON.parse(geoResponse.body).location;
    const latitude : string = JSON.parse(geoResponse.body).latitude;
    const longitude : string = JSON.parse(geoResponse.body).longitude;

    weatherResponse = await getWeather(latitude, longitude);

    if (weatherResponse.statusCode == 500) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "Error" : "Failed to fetch weather data for provided location"
            }, null, 4)
        }
    }

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

export async function geocodeLocation (pathParameters : APIGatewayProxyEvent["pathParameters"]) : Promise<APIGatewayProxyResult> {
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

        https.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.GEO_KEY}&limit=1`,
            function (res : IncomingMessage) {
                res.on('data', (chunk : string) => {
                    dataString += chunk;
                });
                res.on('end', () => {
                    let latitude = '';
                    let longitude = '';
                    try {
                        latitude = JSON.parse(dataString).features[0].center[1];
                        longitude = JSON.parse(dataString).features[0].center[0];
                    } catch (e : any) {
                        resolve({
                            statusCode : 500,
                            body : JSON.stringify({
                                "Error": "Failed to geocode location"
                            })
                        });
                    }

                    resolve({
                        statusCode : 200,
                        body : JSON.stringify({
                            location,
                            latitude,
                            longitude
                        })
                    });
                });
            }).on('error', (err : Error) => {
            console.log(err);
            reject({
                statusCode : 500,
                body : 'Error in location search'
            });
        });
    });
}

export async function getWeather (latitude : string, longitude : string) : Promise<APIGatewayProxyResult> {
    let dataString : string = '';

    return await new Promise((resolve, reject) => {
        https.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.WEATHER_KEY}`,
            function (res : IncomingMessage) {
                res.on('data', (chunk : string) => {
                    dataString += chunk;
                });
                res.on('end', () => {
                    if (JSON.parse(dataString).cod == "400") {
                        resolve({
                            statusCode : 500,
                            body : JSON.stringify({
                                "Error": "Failed to fetch weather for given location"
                            })
                        });
                    }
                    resolve({
                        statusCode : 200,
                        body : JSON.stringify(JSON.parse(dataString))
                    });
                });
            }).on('error', (err : Error) => {
            console.log(err);
            reject({
                statusCode : 500,
                body : 'Error in weather search'
            });
        });
    });
}
