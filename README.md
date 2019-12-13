# UI for hyperlab
This react UI is served using express.js which establishes a websocket connection to the UI. The server then accepts requests which can trigger UI interactions.
The server runs on port 5000.
The following API calls are currently implemented:

| request_type | uri | JSON_payload |
|--------------|:---:|-------------:|
| POST | localhost:5000/robot1/move | {x:<x_coordinate>, y: <y_coordinate>} |



## build and run
~~~
cd ui
npm run build
cd ..
npm start
~~~