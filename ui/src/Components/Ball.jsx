import React from 'react';
import Draggable from 'react-draggable';
import ballImg from '../Assets/Ball.png';


function Ball(props) {
    const left = Math.round(props.centreX - (props.radius / 2));
    const top = Math.round(props.centreY - (props.radius / 2));
    console.log("creating ball with left=" + left + ' top=' + top + " centreX=" + props.centreX + " centreY=" + props.centreY + " radius=" + props.raduis);

    const ballStyle = {
        width: `calc(${props.radius}px)`,
        height: `calc(${props.radius}px)`,
        top: `calc(${top}px)`,
        left: `calc(${left}px)`,
        position: 'absolute',
        zIndex: 2
    };

    return (
        <Draggable
            onStart={() => {}}
            onStop={() => {}}
            scale={1}>
            <div>
                <img src={ballImg} style={ballStyle} alt=""/>
            </div>
        </Draggable>
    );
}

export default Ball;
