// Various response stubs used in order to mock function calls for unit tests

exports.successLocationStub = {
    statusCode : 200,
    body : JSON.stringify({
        location : 'london',
        latitude : 51.5,
        longitude : -0.1
    })
};

exports.successWeatherStub = {
    statusCode : 200,
    body : JSON.stringify({
        "weather" : [
            {
                "description" : "clear sky",
            }
        ],
        "main" : {
            "temp" : 20,
            "temp_min" : 15,
            "temp_max" : 25,
            "humidity" : 100
        },
        "wind" : {
            "speed" : 1.5,
        }})
};

exports.noLocationStub = {
    statusCode: 400,
    body: JSON.stringify({
        "Error": "No location given"
    })
};

exports.poorLocationStub = {
    statusCode: 500,
    body: JSON.stringify({
        "Error": "Couldn't geocode location"
    })
};

exports.poorWeatherStub = {
    statusCode: 500,
    body: JSON.stringify({
        "Error": "Couldn't get weather for location"
    })
};