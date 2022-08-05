import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import https from "https";
import { IncomingMessage } from "http";

export const geocodeLocation = async (pathParameters : APIGatewayProxyEvent["pathParameters"]) : Promise<APIGatewayProxyResult> => {
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