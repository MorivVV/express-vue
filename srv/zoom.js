var request = require('request');

const { EncryptJWT } = require('jose/jwt/encrypt');

let apiKey = "m3S4G5-2QdeLgI7rnCw-Sg";
let secretKey = "dqlZPnoJLjCQdorTeHQMad9HkzzyuvwcX5Wo";
const generateKey = async() => {
    const jwt = await new EncryptJWT({ 'urn:example:claim': true })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setIssuer('urn:example:issuer')
        .setAudience('urn:example:audience')
        .setExpirationTime('2h')
        .encrypt(secretKey)
    console.log(jwt)
    return jwt
}

const getConference = (jwt) => {
    var options = {
        'method': 'POST',
        'url': 'https://api.zoom.us//v2/users/me/meetings',
        'headers': {
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "topic": "string",
            "type": 1,
            "start_time": "2021-05-31 23:00:00",
            "duration": 15,
            "password": "123tester",
            "agenda": "тестовый запуск встречи",
            "recurrence": {
                "type": 1,
                "end_date_time": "2021-05-31 23:15:00"
            },
            "settings": {
                "registrants_email_notification": true
            }
        })

    };
    request(options, function(error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
}
generateKey();