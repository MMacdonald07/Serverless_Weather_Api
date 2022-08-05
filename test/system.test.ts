import { lambdaHandler } from "../index";
import { geocodeLocation } from "../utils/geocode";
import { getWeather } from "../utils/forecast";
const createEvent = require('aws-event-mocks');

describe("Test status codes returned for various geocodeLocation input", () => {
    it('should return status code 200 and correct body for valid location', async () => {
        const response = await geocodeLocation({ proxy : 'london' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('location');
        expect(JSON.parse(response.body)).toHaveProperty('latitude');
        expect(JSON.parse(response.body)).toHaveProperty('longitude');
    });

    it('should return status code 400 for no location', async () => {
        const response = await geocodeLocation({ proxy : '' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(400);
    });

    it('should return status code 500 for invalid location', async () => {
        const response = await geocodeLocation({ proxy : 'aaaaaaaaa' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
    });
});

describe("Test status codes returned for various getWeather input", () => {
    it('should return status code 200 and correct body for valid position', async () => {
        const response = await getWeather('-50', '50');
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('main');
        expect(JSON.parse(response.body)).toHaveProperty('wind');
        expect(JSON.parse(response.body)).toHaveProperty('weather');
    });

    it('should return status code 500 for invalid location', async () => {
        const response = await getWeather('-500', '500');
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
    });
});

describe("Test status codes returned for various LambdaHandler input", () => {
    const mockEvent = createEvent({ template : "aws:apiGateway" });
    mockEvent.pathParameters = { proxy: {} };
    it('should return status code 200 for valid input', async () => {
        mockEvent.pathParameters.proxy = "london";
        const response = await lambdaHandler(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('position');
        expect(JSON.parse(response.body)).toHaveProperty('weather');
    });

    it('should return status code 400 for no input', async () => {
        mockEvent.pathParameters.proxy = '';
        const response = await lambdaHandler(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toHaveProperty('Error');
    });

    it('should return status code 500 for poor input', async () => {
        mockEvent.pathParameters.proxy = 'aaaaaaaaa';
        const response = await lambdaHandler(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toHaveProperty('Error');
    });
});
