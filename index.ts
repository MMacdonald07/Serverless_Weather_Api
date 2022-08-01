require('dotenv').config();
const https = require('https');
import { APIGatewayProxyEvent } from "aws-lambda";

export const lambdaHandler = async (event : APIGatewayProxyEvent) => {
    console.log(event);
    let dataString : string = '';
    let location : string = '';

    const response = await new Promise((resolve, reject) => {
        const { pathParameters } = event;

        if (!pathParameters || !pathParameters.proxy) {
            resolve({
                statusCode: 400,
                body: 'Please provide a location in url'
            })
        } else {
            location = pathParameters.proxy;
        }

        const geoUrl: string = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.GEO_KEY}&limit=1`;
        const req = https.get(geoUrl, function (res : any) {
            res.on('data', (chunk : string) => {
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

        req.on('error', (err : Error) => {
            console.log(err);
            reject({
                statusCode: 500,
                body: 'Error in location search'
            })
        })
    })

    return response;
}