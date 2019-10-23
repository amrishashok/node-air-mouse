const fs = require('fs');
const https = require('https');
const express = require('express');
const robotjs = require('robotjs');
const app = express();

app.use(express.static(process.env.SERVE_DIRECTORY || 'dist'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
// app.get('/', function(req, res) {
//   return res.end('<p>This server serves up static files.</p>');
// });

const options = {
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8'),
    passphrase: process.env.HTTPS_PASSPHRASE || ''
};
const server = https.createServer(options, app);


// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// });
var io = require('socket.io')(server);
let mouseXPosition = robotjs.getMousePos().x;
let mouseYPosition = robotjs.getMousePos().y;
const mouseRatio = 2;
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });

    socket.on('accelerometerX', function (accelerometerX) {
        const accelerometer = JSON.parse(accelerometerX);
        if (robotjs.getMousePos().x === 0 && accelerometerX >= 1) {
            return
        }
        if ((accelerometerX >= 1 || accelerometerX <= -1)) {
            mouseXPosition = robotjs.getMousePos().x + (accelerometerX * -mouseRatio);
            robotjs.moveMouse(mouseXPosition, robotjs.getMousePos().y);
            // console.log('X: ' + accelerometerX);
        }
    });

    socket.on('accelerometerY', function (accelerometerY) {

        if (robotjs.getMousePos().y === 0 && accelerometerY >= 1) {
            return
        }

        if (accelerometerY >= 1 || accelerometerY <= -1) {
            // accelerometerY = yValue;
            mouseYPosition =  robotjs.getMousePos().y + (accelerometerY * -mouseRatio);
            robotjs.moveMouse(robotjs.getMousePos().x, mouseYPosition);
            // console.log('Y: ' + accelerometerY);
        }
    });
    socket.on('button', function (buttonName) {
        robotjs.mouseClick(buttonName);
    });

    socket.on('keyboard', function(key) {
        console.log(key);
        // robotjs.keyTap (key); 
    })
})
server.listen(8080);

// http.listen(3000, function () {
//     console.log('listening on *:3000');
// });