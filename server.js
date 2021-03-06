var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");
var app = express();
var cors = require('cors');
const PORT = 5000;
var WebSocket = require('ws');
// TODO: add whitelist https://daveceddia.com/access-control-allow-origin-cors-errors-in-react-express/
app.use(cors());

wss = new WebSocket.Server({port: 40510});

wss.on('connection', function (ws_) {
  ws_.on('message', function(message) {
    console.log('received: %s', message)
    // the message is being forwarded to the other client, i.e. frontend or gui-artifact of jacamo-app
    const jsonMsg = JSON.parse(message);
    forwardToOtherWsClients(jsonMsg, ws_);
  });
});

function forwardToOtherWsClients(jsonMsg, originWs) {
  wss.clients.forEach(function each(ws) {
    if (ws!== originWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(jsonMsg));
    }
  });
}

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'ui/build')));

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/ui/build/index.html'));
});

app.listen(PORT, function () {
  console.log('App is listening on port 5000!');
});