import React from 'react';

function Terminal(props) {
    const bgStyle = {
        width: props.width,
        height: props.height,
        top: props.top,
        left: props.left,
        position: 'absolute'
    };

    return (
        <div className="terminal" style={bgStyle}>
            {props.text.split("\n").map((i,key) => {
                return <div key={key}>{i}</div>;
            })}
        </div>
    );
}

export default Terminal;