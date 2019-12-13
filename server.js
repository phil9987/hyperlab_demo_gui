var express = require('express');
const path = require('path');
var bodyParser = require("body-parser");
var app = express();

var app = express();
//Here we are configuring express to use body-parser as middle-ware.
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

  /*setInterval(
    () => ws_.send(`{"move": "${new Date()}"}`),
    1000
  )*/
})

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'ui/build')));

// An api endpoint that returns a short list of items
app.get('/api/getList', (req,res) => {
  var list = ["item1", "item2", "item3"];
  res.json(list);
  console.log('Sent list of items');
  const myObj = {move: {x: 500, y: 600}};
  ws.send(JSON.stringify(myObj));
});

app.post('/robot1/move',function(request,response){
  console.log(request.body)
  console.log('Received request to move robot1 to ' + JSON.stringify(request.body));
  const moveJsonObj = {move: {x: request.body.x, y: request.body.y}};
  ws.send(JSON.stringify(moveJsonObj));
  response.json(request.body);
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/ui/build/index.html'));
});

app.listen(5000, function () {
  console.log('App is listening on port 5000!');
});