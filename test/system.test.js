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
const index_1 = require("../index");
const geocode_1 = require("../utils/geocode");
const forecast_1 = require("../utils/forecast");
const createEvent = require('aws-event-mocks');
describe("Test status codes returned for various geocodeLocation input", () => {
    it('should return status code 200 and correct body for valid location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, geocode_1.geocodeLocation)({ proxy: 'london' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('location');
        expect(JSON.parse(response.body)).toHaveProperty('latitude');
        expect(JSON.parse(response.body)).toHaveProperty('longitude');
    }));
    it('should return status code 400 for no location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, geocode_1.geocodeLocation)({ proxy: '' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(400);
    }));
    it('should return status code 500 for invalid location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, geocode_1.geocodeLocation)({ proxy: 'aaaaaaaaa' });
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
    }));
});
describe("Test status codes returned for various getWeather input", () => {
    it('should return status code 200 and correct body for valid position', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, forecast_1.getWeather)('-50', '50');
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('main');
        expect(JSON.parse(response.body)).toHaveProperty('wind');
        expect(JSON.parse(response.body)).toHaveProperty('weather');
    }));
    it('should return status code 500 for invalid location', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, forecast_1.getWeather)('-500', '500');
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
    }));
});
describe("Test status codes returned for various LambdaHandler input", () => {
    const mockEvent = createEvent({ template: "aws:apiGateway" });
    mockEvent.pathParameters = { proxy: {} };
    it('should return status code 200 for valid input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockEvent.pathParameters.proxy = "london";
        const response = yield (0, index_1.lambdaHandler)(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('position');
        expect(JSON.parse(response.body)).toHaveProperty('weather');
    }));
    it('should return status code 400 for no input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockEvent.pathParameters.proxy = '';
        const response = yield (0, index_1.lambdaHandler)(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toHaveProperty('Error');
    }));
    it('should return status code 500 for poor input', () => __awaiter(void 0, void 0, void 0, function* () {
        mockEvent.pathParameters.proxy = 'aaaaaaaaa';
        const response = yield (0, index_1.lambdaHandler)(mockEvent);
        expect(typeof response).toBe("object");
        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toHaveProperty('Error');
    }));
});
