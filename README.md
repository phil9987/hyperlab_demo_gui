# UI for hyperlab
This react UI is served using express.js which establishes a websocket connection to the UI. The server then accepts requests which can trigger UI interactions.
The server runs on port 5000.
A websocket connection to the websocket server from the jacamo app in `jacamo-app/src/env/www/ShopFloorMap.java`

## API: Jacamo → GUI
### Robotarm (robot1 and robot3)
`{robotX: {rotate: {degrees: 180}}}` // rotates robot arm to given degree value

`{robotX: {grasp: true/false}}` // grasps / releases robot arm

### TransporterRobot (robot2)
`{robot2: {move: {x: x_coordinate, y: y_coordinate}}}` // turns transporter into direction of given coordinates and moves there

`{robot2: {load: true}}` // loads ball on top of robot2 and keeps it there while moving until release (note that the position of the ball will be set to the center of robot2 when this message is received. For a smooth UI experience make sure that the ball is there or close by already.

`{robot2: {attach: true}}` // attaches ball to the front of robot2 and keeps it there, to simulate pushing the ball around. The ball remains attached throughout move messages until a release message is received.

`{robot2: {release: true}}` // releases an either loaded or attached ball. In the UI nothing changes except that if move is called, the ball will not move with robot2.

### Terminal
`{terminal: {origin: msg_origin, message: "message to be logged"}}` // logs a message in the format `"[<origin>]: <message>"` to the terminal on the right side of the GUI

## API Jacamo ← GUI
`{jacamo: {placeObject: {x: x_coordinate, y: y_coordinate}}}` // Event: ball has been placed in the UI at given coordinates

`{jacamo: {changeArtifact: {name: artifact_name, enabled: true/false}}}` // Event: enable/disable given artifact

`{jacamo: {changeManual: {name: manual_name, enabled: true/false}}}` // Event: enable/disable given manual

## build and run
~~~
cd ui
npm run build
cd ..
npm start
~~~
