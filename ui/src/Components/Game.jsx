import React from 'react';
import backgroundImg from '../Assets/Background.png';
import driverRobotImg from '../Assets/DriverRobot.png';
import robotArmImg from '../Assets/RobotArm.png'
import Background from './Background';
import DriverRobot from './DriverRobot';
import RobotArm from './RobotArm';

class Game extends React.Component {

    ws = new WebSocket('ws://localhost:40510')


    constructor(props) {
        super(props);

        this.state = {
            driverPos: {x: 120, y: 120},
            driverGoal: {x: 120, y: 120},
            driverRotation: 0,

            robotArm1Pos: {x: 500, y: 500},
            robotArm1Rotation: 0,
            robotArm1RotationGoal: 0,
            windowWidth: 0,
            windowHeight: 0,
        };

        this.driverWidth = 50;
        this.driverHeight = 50;
        this.driverSpeed = 10;

        this.robotArmWidth = 240;
        this.robotArmHeight = 34;



        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    }
    _onMouseDown(e) {
        // TODO: replace this by a REST-API. onMouseDown is only for demo purpose
        this.setState({ driverGoal: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
                        driverRotation: Math.atan2(e.nativeEvent.offsetY - this.state.driverPos.y, e.nativeEvent.offsetX - this.state.driverPos.x) + Math.PI / 2,
                        robotArm1RotationGoal: (Math.atan2(e.nativeEvent.offsetY - this.state.robotArm1Pos.y, e.nativeEvent.offsetX - this.state.robotArm1Pos.x) + 2*Math.PI) % (2*Math.PI),
                    });
        console.log(this.state);
    }

    gameLoop() {
        //console.log('driverPosX: ' + this.state.driverPos.x + ' driverPosY: ' + this.state.driverPos.y);
        if (!this.driverGoalReached()) {
            console.log("driverRobot has not yet reached its goal, moving into direciton of goal...");
            const direction = { x: this.state.driverGoal.x - this.state.driverPos.x, y: this.state.driverGoal.y - this.state.driverPos.y }
            this.setState({ driverPos: { x: this.state.driverPos.x + direction.x*0.1, y: this.state.driverPos.y + direction.y*0.1 }})

        } 
        if (!this.rotationGoalReached()) {
            console.log("RobotArm has not yet reached its goal, moving arm into direction...");
            console.log(this.state);
            if ((this.state.robotArm1RotationGoal > this.state.robotArm1Rotation && this.state.robotArm1RotationGoal - this.state.robotArm1Rotation < Math.PI)
                || (this.state.robotArm1RotationGoal < this.state.robotArm1Rotation && this.state.robotArm1Rotation - this.state.robotArm1RotationGoal > Math.PI)) {
                this.setState({ robotArm1Rotation: (this.state.robotArm1Rotation + 0.05) % (2*Math.PI) });
            } else {
                var nextRotation = (this.state.robotArm1Rotation - 0.05) % (2*Math.PI);
                if (nextRotation < 0) {
                    nextRotation = 2*Math.PI;
                }
                this.setState({ robotArm1Rotation: nextRotation});
            }
        } else {
            console.log("robot arm is already at desired rotation : " + this.state.robotArm1Rotation + ' (' + this.state.robotArm1RotationGoal + ')');
        }
    }

    driverGoalReached() {
        return Math.abs(this.state.driverPos.x - this.state.driverGoal.x) < 5 &&
                Math.abs(this.state.driverPos.y - this.state.driverGoal.y) < 5;
    }

    rotationGoalReached() {
        return Math.abs(this.state.robotArm1Rotation - this.state.robotArm1RotationGoal) < 0.05;
    }

    playerMove(x_new, y_new) {
        this.setState({
            driverPos: {x: x_new, y: y_new}
        });
    }

    componentDidMount(){
        this.ws.onopen = () => {
            console.log('websocket connected.')
        }
        this.ws.onmessage = evt => {
            console.log(evt.data)
            const message = JSON.parse(evt.data)
            console.log(message)
            console.log(message.move)
            this.setState({
                driverGoal: {x: message.move.x, y: message.move.y}
            });
        }
        this.ws.onclose = () => {
            console.log('websocket disconnected.')
            // automatically try to reconnect on connection loss
        }
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.intervalId = setInterval(this.gameLoop.bind(this), 10);
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.updateWindowDimensions);
        clearInterval(this.intervalId);
    }

    updateWindowDimensions() {
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
    }

    render() {
        return <div onMouseDown={this._onMouseDown.bind(this)} tabIndex="0">
            <Background backgroundImage={backgroundImg}
                windowWidth={this.state.windowWidth} windowHeight={this.state.windowHeight} />
            <DriverRobot driverRobotImage={driverRobotImg} centreX={this.state.driverPos.x}
                centreY={this.state.driverPos.y} width={this.driverWidth}
                height={this.driverHeight} rotation={this.state.driverRotation} />
            <RobotArm robotArmImage={robotArmImg} centreX={this.state.robotArm1Pos.x}
                centreY={this.state.robotArm1Pos.y} width={this.robotArmWidth}
                height={this.robotArmHeight} rotation={this.state.robotArm1Rotation} />
        </div>
    }
}

export default Game;