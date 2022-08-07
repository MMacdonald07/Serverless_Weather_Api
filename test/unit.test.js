"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const geocode = require('../utils/geocode');
const forecast = require('../utils/forecast');
const lambda = require("../index");
const { successLocationStub, successWeatherStub, noLocationStub, poorLocationStub, poorWeatherStub } = require("./mock");
const sinon = require('sinon');
const lambdaTester = require('lambda-tester');
const createEvent = require('aws-event-mocks');
describe("Successful Invocation 200", () => {
    before(() => {
        sinon.stub(geocode, "geocodeLocation").resolves(successLocationStub);
        sinon.stub(forecast, "getWeather").resolves(successWeatherStub);
    });
    after(() => {
        geocode.geocodeLocation.restore();
        forecast.getWeather.restore();
    });
    it('should be a successful invocation of the lambda', (done) => {
        const mockEvent = createEvent({ template: "aws:apiGateway" });
        mockEvent.pathParameters = { proxy: {} };
        mockEvent.pathParameters.proxy = 'london';
        lambdaTester(lambda.lambdaHandler).event(mockEvent).expectResult((response) => {
            (0, chai_1.expect)(response.statusCode).to.exist;
            (0, chai_1.expect)(response.statusCode).to.equal(200);
            (0, chai_1.expect)(response.body).to.exist;
            (0, chai_1.expect)(JSON.parse(response.body)).to.be.a("object");
            (0, chai_1.expect)(JSON.parse(response.body).position).to.exist;
            (0, chai_1.expect)(JSON.parse(response.body).weather).to.exist;
            done();
        }).catch(done);
    });
});
describe("Failed Invocation 400 (location)", () => {
    before(() => {
        sinon.stub(geocode, "geocodeLocation").resolves(noLocationStub);
        // Don't need to stub getWeather as lambda will finish running prior to calling function
    });
    after(() => {
        geocode.geocodeLocation.restore();
    });
    it('should return an error 400 due to no location input', (done) => {
        const mockEvent = createEvent({ template: "aws:apiGateway" });
        mockEvent.pathParameters = { proxy: {} };
        mockEvent.pathParameters.proxy = '';
        lambdaTester(lambda.lambdaHandler).event(mockEvent).expectResult((response) => {
            (0, chai_1.expect)(response.statusCode).to.exist;
            (0, chai_1.expect)(response.statusCode).to.equal(400);
            (0, chai_1.expect)(response.body).to.exist;
            (0, chai_1.expect)(response.body).to.be.a("string");
            (0, chai_1.expect)(JSON.parse(response.body).Error).to.exist;
            done();
        }).catch(done);
    });
});
describe("Failed Invocation 500 (location)", () => {
    before(() => {
        sinon.stub(geocode, "geocodeLocation").resolves(poorLocationStub);
    });
    after(() => {
        geocode.geocodeLocation.restore();
    });
    it('should return an error 500 due to bad input', (done) => {
        const mockEvent = createEvent({ template: "aws:apiGateway" });
        mockEvent.pathParameters = { proxy: {} };
        mockEvent.pathParameters.proxy = 'aaaaaaaaa';
        lambdaTester(lambda.lambdaHandler).event(mockEvent).expectResult((response) => {
            (0, chai_1.expect)(response.statusCode).to.exist;
            (0, chai_1.expect)(response.statusCode).to.equal(500);
            (0, chai_1.expect)(response.body).to.exist;
            (0, chai_1.expect)(response.body).to.be.a("string");
            (0, chai_1.expect)(JSON.parse(response.body).Error).to.exist;
            done();
        }).catch(done);
    });
});
describe("Failed Invocation 500 (weather)", () => {
    before(() => {
        sinon.stub(geocode, "geocodeLocation").resolves(successLocationStub);
        sinon.stub(forecast, "getWeather").resolves(poorWeatherStub);
    });
    after(() => {
        geocode.geocodeLocation.restore();
        forecast.getWeather.restore();
    });
    it('should return an error 500 due to bad weather input', (done) => {
        const mockEvent = createEvent({ template: "aws:apiGateway" });
        mockEvent.pathParameters = { proxy: {} };
        mockEvent.pathParameters.proxy = 'aaaaaaaaa';
        lambdaTester(lambda.lambdaHandler).event(mockEvent).expectResult((response) => {
            (0, chai_1.expect)(response.statusCode).to.exist;
            (0, chai_1.expect)(response.statusCode).to.equal(500);
            (0, chai_1.expect)(response.body).to.exist;
            (0, chai_1.expect)(response.body).to.be.a("string");
            (0, chai_1.expect)(JSON.parse(response.body).Error).to.exist;
            done();
        }).catch(done);
    });
});
