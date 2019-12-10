import React from 'react';

function DriverRobot(props) {
    const left = Math.round(props.centreX - (props.width / 2));
    const top = Math.round(props.centreY - (props.height / 2));

    const driverRobotStyle = {
        width: `calc(${props.width}px)`,
        height: `calc(${props.height}px)`,
        top: `calc(${top}px)`,
        left: `calc(${left}px)`,
        position: 'absolute',
        transform: `rotate(${props.rotation}rad)`,
        zIndex: 1
    };

    return (
        <img src={props.driverRobotImage} style={driverRobotStyle} alt=""/>
    );
}

export default DriverRobot;
