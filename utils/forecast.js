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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = void 0;
const https_1 = __importDefault(require("https"));
const getWeather = (latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    let dataString = '';
    return yield new Promise((resolve, reject) => {
        https_1.default.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.WEATHER_KEY}`, function (res) {
            res.on('data', (chunk) => {
                dataString += chunk;
            });
            res.on('end', () => {
                if (JSON.parse(dataString).cod == "400") {
                    resolve({
                        statusCode: 500,
                        body: JSON.stringify({
                            "Error": "Failed to fetch weather for given location"
                        })
                    });
                }
                resolve({
                    statusCode: 200,
                    body: JSON.stringify(JSON.parse(dataString))
                });
            });
        }).on('error', (err) => {
            console.log(err);
            reject({
                statusCode: 500,
                body: 'Error in weather search'
            });
        });
    });
});
exports.getWeather = getWeather;
