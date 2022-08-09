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
const { lambdaHandler } = require("../index");
const { geocodeLocation } = require("../utils/geocode");
const { getWeather } = require("../utils/forecast");
const createEvent = require('aws-event-mocks');
// geocodeLocation end-to-end tests
describe("Test status codes returned for various geocodeLocation input", () => {
    it('should return status code 200 and correct body for valid location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield geocodeLocation({ proxy: 'london' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('location');
        expect(JSON.parse(response.body)).toHaveProperty('latitude');
        expect(JSON.parse(response.body)).toHaveProperty('longitude');
    }));
    it('should return status code 400 for no location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield geocodeLocation({ proxy: '' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(400);
    }));
    it('should return status code 500 for invalid location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield geocodeLocation({ proxy: 'aaaaaaaaa' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
    }));
});
// getWeather end-to-end tests
describe("Test status codes returned for various getWeather input", () => {
    it('should return status code 200 and correct body for valid position', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield getWeather('-50', '50');
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('main');
        expect(JSON.parse(response.body)).toHaveProperty('wind');
        expect(JSON.parse(response.body)).toHaveProperty('weather');
    }));
    it('should return status code 500 for invalid location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield getWeather('-500', '500');
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
    }));
});
// lambdaHandler end-to-end tests
describe("Test status codes returned for various LambdaHandler input", () => {
    const mockEvent = createEvent({ template: "aws:apiGateway" });
    mockEvent.pathParameters = { proxy: {} };
    it('should return status code 200 for valid input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockEvent.pathParameters.proxy = "london";
        const response = yield lambdaHandler(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('position');
        expect(JSON.parse(response.body)).toHaveProperty('weather');
    }));
    it('should return status code 400 for no input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockEvent.pathParameters.proxy = '';
        const response = yield lambdaHandler(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toHaveProperty('Error');
    }));
    it('should return status code 500 for poor input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockEvent.pathParameters.proxy = 'aaaaaaaaa';
        const response = yield lambdaHandler(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toHaveProperty('Error');
    }));
});
