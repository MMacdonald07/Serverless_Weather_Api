import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const lambdaHandler = async (event : APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    let location : String = '';

    if (event.pathParameters && event.pathParameters.proxy) {
        location = event.pathParameters.proxy;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            location
        })
    }
}