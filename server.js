var express = require('express');
const path = require('path');
var bodyParser = require("body-parser");
var app = express();
//Here we are configuring express to use body-parser as middle-ware. This enables it to receive POST requests with JSON payload
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = 5000;

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: 40510});
var ws;

wss.on('connection', function (ws_) {
  ws = ws_;
  ws_.on('message', function (message) {
    console.log('received: %s', message)
  });
})

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'ui/build')));

app.post('/robot1/rotate',function(request,response){
  console.log(request.body)
  console.log('Received request to rotate robot1 to ' + JSON.stringify(request.body));
  const jsonObj = {robot1: {rotate: {degrees: request.body.degrees}}};
  ws.send(JSON.stringify(jsonObj));
  response.json(request.body);
});

app.post('/robot2/move',function(request,response){
  console.log(request.body)
  console.log('Received request to move robot2 to ' + JSON.stringify(request.body));
  const jsonObj = {robot2: {move: {x: request.body.x, y: request.body.y}}};
  ws.send(JSON.stringify(jsonObj));
  response.json(request.body);
});

app.post('/terminal/addText',function(request,response){
  console.log(request.body)
  console.log('Received request from ' + request.body.origin + ' to add text to terminal: ' + request.body.text);
  const jsonObj = {terminal: {origin: request.body.origin, text: request.body.text}};
  ws.send(JSON.stringify(jsonObj));
  response.json(request.body);
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/ui/build/index.html'));
});

app.listen(5000, function () {
  console.log('App is listening on port 5000!');
});