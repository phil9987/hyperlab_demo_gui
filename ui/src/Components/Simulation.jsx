import React from 'react';
import backgroundImg from '../Assets/Background.png';
import driverRobotImg from '../Assets/DriverRobot.png';
import robotArmImg from '../Assets/RobotArm.png'
import Background from './Background';
import Robot from './Robot';
import Terminal from './Terminal';
import Ball from './Ball';
import Configuration from './Configuration';

class Simulation extends React.Component {
    // The websocket used to communicate with the GUI backend and the Jacamo application
    ws = new WebSocket('ws://localhost:40510')

    constructor(props) {
        super(props);

        this.state = {
            driverPos: {x: 300, y: 200},
            driverGoal: {x: 300, y: 200},
            driverRotation: 0,
            driverBallLoaded: false,
            driverBallAttached: false,

            robotArm1Pos: {x: 250, y: 400},
            robotArm1Rotation: 0,
            robotArm1RotationGoal: 0,
            robotArm1BallAttached: false,

            robotArm2Pos: {x: 550, y: 400},
            robotArm2Rotation: 0,
            robotArm2RotationGoal: 0,
            robotArm2BallAttached: false,

            ballPos: {x: 615, y: 400},

            windowWidth: 800,
            windowHeight: 600,
            terminalText: ""
        };

        this.driverWidth = 25;
        this.driverHeight = 25;
        this.driverSpeed = 0.1; // fraction of goal-vector by which robot moves towards goal per time interval

        this.ballDestination = {x:615, y: 400};
        this.ballRadius = 15;


        this.robotArmWidth = 120;
        this.robotArmHeight = 17;
        this.robotArmRotationStep = 0.05; // step in rad by which robotArm is moved per time interval

        this.TerminalElement = React.createRef();
    }

    /*
     * Triggered when mouse is pressed on background element
     */
    _onMouseDown(e) {
        // if ball is at its destination, user can place it somewhere by clicking on the map to initiate a new scenario
        if (this.ballAtDestination()) {
            this.setState({ballPos: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}});
            const jsonObj = {jacamo: {placeObject: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}}};
            this.ws.send(JSON.stringify(jsonObj)); // notifies jacamo app
        } else {
            console.log("ball not at destination: x=" + this.state.ballPos.x + " y=" + this.state.ballPos.y);
        }
    }

    /*
     * Returns true if ball is at this.ballDestination
     */
    ballAtDestination() {
        return this.state.ballPos.x === this.ballDestination.x && this.state.ballPos.y === this.ballDestination.y;
    }

    /*
     * Returns true if rotating to the right is faster than rotating to the left in order to reach rotationGoal from currentRotation
     */
    isRightRotationCloser(currentRotation, rotationGoal) {
        return (rotationGoal > currentRotation && rotationGoal - currentRotation < Math.PI)
                || (rotationGoal < currentRotation && currentRotation - rotationGoal > Math.PI)
    }

    /*
     * Returns true if this.state.driverPos and this.state.driverGoal are max 5 pixels apart on x and y coordinates
     */
    driverGoalReached() {
        return Math.abs(this.state.driverPos.x - this.state.driverGoal.x) < 5 &&
                Math.abs(this.state.driverPos.y - this.state.driverGoal.y) < 5;
    }

    /*
     * Returns true if the currentRotation is within a margin of 0.05 to rotationGoal
     */
    rotationGoalReached(currentRotation, rotationGoal) {
        return Math.abs(currentRotation - rotationGoal) < 0.05;
    }

    /*
     * Adds a log entry to the terminal
     */
    addTerminalLine(origin, message) {
        const nextLine = '[' + origin + ']: ' + message + '\n';
        this.setState({terminalText: this.state.terminalText + nextLine});
        this.TerminalElement.current.addLine(nextLine);
    }

    /*
     * Rotation in rad
     * Radius in pixel
     * Center coordinates {x, y}
     * Returns the coordinates x' y' if the element (in our case robotArm) is rotated by Rotation
     */
    getBallPositionWithRotationAndRadius(rotation, radius, center) {
        return { x: center.x + Math.cos(rotation)*radius, y: center.y + Math.sin(rotation)*radius };
    }

    /*
     * Moves this.state.driverPos by movingFactor towards this.state.driverGoal
     */
    moveDriverTowardsGoal(movingFactor) {
        const direction = { x: this.state.driverGoal.x - this.state.driverPos.x, y: this.state.driverGoal.y - this.state.driverPos.y };
        const nextPos = { x: this.state.driverPos.x + direction.x*movingFactor, y: this.state.driverPos.y + direction.y*movingFactor }
        if (this.state.driverBallLoaded) {
            this.setState({
                driverPos: nextPos,
                ballPos: nextPos
            })
        } else if (this.state.driverBallAttached) {
            this.setState({
                driverPos: nextPos,
                ballPos: this.getBallPositionWithRotationAndRadius(this.state.driverRotation - Math.PI/2, this.driverWidth/2 + this.ballRadius, nextPos)
            });
        } else {
            this.setState({ driverPos: nextPos});
        }
    }

    /*
     * Returns the new rotation [radians] if the currentRotation is moved by rotationStep towards rotationGoal
     */
    getNewRotation(currentRotation, rotationGoal, rotationStep) {
        var newRotation;
        if (this.isRightRotationCloser(currentRotation, rotationGoal)) {
            newRotation = (currentRotation + rotationStep) % (2*Math.PI);
        } else {
            newRotation = (currentRotation - rotationStep) % (2*Math.PI);
            if (newRotation < 0) {
                newRotation = 2*Math.PI;
            }
        }
        return newRotation;
    }

    /* robotArmRotation: rotation [radians] of the robot arm
     * robotArmPos: {x,y} center position of the robot arm
     *
     * Returns the position of the ball s.t. it looks like it is grabbed by the robot arm
     */
    getBallPositionAtRobotArm(robotArmRotation, robotArmPos) {
        return this.getBallPositionWithRotationAndRadius(robotArmRotation, this.robotArmWidth/2 - 5, robotArmPos)
    }

    /*
     * Handles the JSON messages received through the websocket and updates the state of the UI components accordingly
     */
    handleMessage(message) {
        switch(Object.keys(message)[0]) {
            case "robot1":
                switch(Object.keys(message.robot1)[0]) {
                    case "rotate":
                        this.setState({robotArm1RotationGoal: (message.robot1.rotate.degrees * Math.PI)/180});
                        break;
                    case "grasp":
                        if(message.robot1.grasp) {
                            console.log("robot1 grasps ball");
                            this.setState({
                                robotArm1BallAttached: true,
                                ballPos: this.getBallPositionAtRobotArm(this.state.robotArm1Rotation, this.state.robotArm1Pos)
                            });
                        } else {
                            console.log("robot1 releases ball");
                            this.setState({robotArm1BallAttached: false});
                        }
                        break
                    default:
                        console.log("unable to process json message: " + message);
                }
                break;
            case "robot2":
                switch(Object.keys(message.robot2)[0]) {
                    case "move":
                        const driverRotation = Math.atan2(message.robot2.move.y - this.state.driverPos.y, message.robot2.move.x - this.state.driverPos.x) + Math.PI / 2;
                        console.log("setting driverGoal and Rotation: " + driverRotation + " from current rotation: " + this.state.driverRotation);
                        this.setState({
                            driverGoal: {x: message.robot2.move.x, y: message.robot2.move.y},
                            driverRotation: driverRotation,
                        });
                        break;
                    case "load":
                        this.setState({
                            driverBallLoaded: true,
                            ballPos: this.state.driverPos
                        });
                        break
                    case "attach":
                        console.log("attaching ball to driver robot...");
                        this.setState({
                            driverBallAttached: true,
                            ballPos: this.getBallPositionWithRotationAndRadius(this.state.driverRotation - Math.PI/2, this.driverWidth/2 + this.ballRadius, this.state.driverPos)
                        })
                        break
                    case "release":
                        this.setState({
                            driverBallLoaded: false,
                            driverBallAttached: false
                        })
                        break
                    default:
                        console.log("unable to process json message: " + message);
                }
                break;
            case "robot3":
                switch(Object.keys(message.robot3)[0]) {
                    case "rotate":
                        this.setState({robotArm2RotationGoal: (message.robot3.rotate.degrees * Math.PI)/180});
                        break;
                    case "grasp":
                        if(message.robot3.grasp) {
                            console.log("robot3 grasps ball");
                            this.setState({
                                robotArm2BallAttached: true,
                                ballPos: this.getBallPositionAtRobotArm(this.state.robotArm2Rotation, this.state.robotArm2Pos)
                            });
                        } else {
                            console.log("robot3 releases ball");
                            this.setState({robotArm2BallAttached: false});
                            if (Math.abs(this.state.robotArm2Rotation) <= 0.05) {
                                // we reached the destination
                                console.log("Ball has reached destination!");
                                this.setState({
                                    ballPos: this.ballDestination
                                });
                            }
                        }
                        break;
                    default:
                        console.log("unable to process json message: " + JSON.stringify(message));
                }
                break;
            case "terminal":
                console.log("received log message");
                this.addTerminalLine(message.terminal.origin, message.terminal.message);
                break;
            default:
                console.log("invalid json message: " + JSON.stringify(message));
        };
    }

    /*
     * The loop which updates the UI elements of the simulation. It is bound by the setInterval() call in the componentDidMount() function
     */
    gameLoop() {
        if (!this.driverGoalReached()) {
            console.log("driverRobot has not yet reached its goal, moving into direciton of goal...");
            this.moveDriverTowardsGoal(this.driverSpeed);
        }
        if (!this.rotationGoalReached(this.state.robotArm1Rotation, this.state.robotArm1RotationGoal)) {
            const newRotation = this.getNewRotation(this.state.robotArm1Rotation, this.state.robotArm1RotationGoal, this.robotArmRotationStep);
            console.log("RobotArm1 has not yet reached its goal, moving arm into direction of goal. Rotating to " + newRotation);
            if (this.state.robotArm1BallAttached) {
                this.setState({
                    ballPos: this.getBallPositionAtRobotArm(this.state.robotArm1Rotation, this.state.robotArm1Pos),
                    robotArm1Rotation: newRotation
                });
            } else {
                this.setState({
                    robotArm1Rotation: newRotation
                });
            }
        }
        if (!this.rotationGoalReached(this.state.robotArm2Rotation, this.state.robotArm2RotationGoal)) {
            const newRotation = this.getNewRotation(this.state.robotArm2Rotation, this.state.robotArm2RotationGoal, this.robotArmRotationStep);
            console.log("RobotArm2 has not yet reached its goal, moving arm into direction of goal. Rotating to " + newRotation);
            if (this.state.robotArm2BallAttached) {
                this.setState({
                    ballPos: this.getBallPositionAtRobotArm(this.state.robotArm2Rotation, this.state.robotArm2Pos),
                    robotArm2Rotation: newRotation
                });
            } else {
                this.setState({
                    robotArm2Rotation: newRotation
                });
            }
        }
    }

    componentDidMount(){
        this.intervalId = setInterval(this.gameLoop.bind(this), 10);

        this.ws.onopen = () => {
            console.log('websocket connected.');
        };

        this.ws.onmessage = evt => {
            console.log(evt.data);
            const message = JSON.parse(evt.data);
            console.log(message);
            this.handleMessage(message);
        };

        this.ws.onclose = () => {
            console.log('websocket disconnected.')
            // TODO: automatically try to reconnect on connection loss
        };
    }

    componentWillUnmount(){
        clearInterval(this.intervalId);
    }

    render() {
        return <div tabIndex="0">
            <div className="background">
                <Background backgroundImage={backgroundImg} onMouseDown={this._onMouseDown.bind(this)}
                    windowWidth={this.state.windowWidth} windowHeight={this.state.windowHeight} top={0} left={0} />
            </div>
                <div className="configsection">
                <Configuration websocket={this.ws}/>
                </div>
            <Ball centreX={this.state.ballPos.x} centreY={this.state.ballPos.y} radius={this.ballRadius}/>
            <Robot robotImage={driverRobotImg} centreX={this.state.driverPos.x}
                centreY={this.state.driverPos.y} width={this.driverWidth}
                height={this.driverHeight} rotation={this.state.driverRotation} />
            <Robot robotImage={robotArmImg} centreX={this.state.robotArm1Pos.x}
                centreY={this.state.robotArm1Pos.y} width={this.robotArmWidth}
                height={this.robotArmHeight} rotation={this.state.robotArm1Rotation} />
            <Robot robotImage={robotArmImg} centreX={this.state.robotArm2Pos.x}
                centreY={this.state.robotArm2Pos.y} width={this.robotArmWidth}
                height={this.robotArmHeight} rotation={this.state.robotArm2Rotation} />
            <Terminal ref={this.TerminalElement} top={0} left={this.state.windowWidth} width={window.innerWidth - this.state.windowWidth} height={this.state.windowHeight} text={this.state.terminalText} />
        </div>
    }
}

export default Simulation;