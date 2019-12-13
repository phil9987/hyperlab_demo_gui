# UI for hyperlab
This react UI is served using express.js which establishes a websocket connection to the UI. The server then accepts requests which can trigger UI interactions.
The server runs on port 5000.
The following API calls are currently implemented:

| request_type | uri | JSON_payload |
|:-------------|:---|:-------------|
| POST | localhost:5000/robot1/rotate | {degrees:<degree(position on circle)>} |
| POST | localhost:5000/robot2/move | {x:<x_coordinate>, y: <y_coordinate>} |

A collection of sample requests:
https://www.getpostman.com/collections/29f2115d669385ee2193

## build and run
~~~
cd ui
npm run build
cd ..
npm start
~~~