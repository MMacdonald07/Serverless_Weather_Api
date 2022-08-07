require('dotenv').config();
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
const { geocodeLocation } =  require("./utils/geocode");
const { getWeather } = require("./utils/forecast");

const lambdaHandler = async (event : APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
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

module.exports = { lambdaHandler };