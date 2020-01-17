import React from 'react';

function Background(props) {
    const bgStyle = {
        width: props.windowWidth,
        height: props.windowHeight,
        top: props.top,
        left: props.left,
        position: 'absolute'
    };

    return (
        <img src={props.backgroundImage} style={bgStyle} onMouseDown={props.onMouseDown} alt="" />
    );
}

export default Background;