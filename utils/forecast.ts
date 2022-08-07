import { APIGatewayProxyResult } from "aws-lambda";
import https from "https";
import { IncomingMessage } from "http";

const getWeather = async (latitude : string, longitude : string) : Promise<APIGatewayProxyResult> => {
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

module.exports = { getWeather };