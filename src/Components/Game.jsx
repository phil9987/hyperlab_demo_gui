import React from 'react';
import backgroundImg from '../Assets/Background.png';
import carImg from '../Assets/Car.png';
import Background from './Background';
import Car from './Car';

class Game extends React.Component {
    SPEED = 1;

    constructor(props) {
        super(props);

        this.state = {
            playerPos: {x: 100, y: 100},
            playerGoal: {x: 100, y: 0},
            playerRotation: 0,
            windowWidth: 0,
            windowHeight: 0,
        };

        this.playerWidth = 50;
        this.playerHeight = 50;
        this.playerSpeed = 10;

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    }
    _onMouseDown(e) {
        this.setState({ playerGoal: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
                        playerRotation: Math.atan2(e.nativeEvent.offsetY - this.state.playerPos.y, e.nativeEvent.offsetX - this.state.playerPos.x) + Math.PI / 2});
        console.log('PlayerPosX: ' + this.state.playerPos.x + ' PlayerPosY: ' + this.state.playerPos.y);
        console.log('newGoalX: ' + this.state.playerGoal.x + ' newGoalY: ' + this.state.playerGoal.y + ' direction: ' + this.state.playerRotation);
    }

    gameLoop() {
        //console.log('PlayerPosX: ' + this.state.playerPos.x + ' PlayerPosY: ' + this.state.playerPos.y);
        if (!this.goalReached()) {
            console.log("goal not yet reached, moving into direciton of Goal!");
            const direction = { x: this.state.playerGoal.x - this.state.playerPos.x, y: this.state.playerGoal.y - this.state.playerPos.y }
            this.setState({ playerPos: { x: this.state.playerPos.x + direction.x*0.1, y: this.state.playerPos.y + direction.y*0.1 }})

        } else {
            // stop
            console.log("goal reached.")
        }
    }

    goalReached() {
        return Math.abs(this.state.playerPos.x - this.state.playerGoal.x) < 5 &&
                Math.abs(this.state.playerPos.y - this.state.playerGoal.y) < 5
    }

    playerMove(x_new, y_new) {
        this.setState({
            playerPos: {x: x_new, y: y_new}
        });
    }

    componentDidMount(){
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);

        this.intervalId = setInterval(this.gameLoop.bind(this), 100);
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
            <Car carImage={carImg} centreX={this.state.playerPos.x}
                centreY={this.state.playerPos.y} width={this.playerWidth}
                height={this.playerHeight} rotation={this.state.playerRotation} />
        </div>
    }
}

export default Game;