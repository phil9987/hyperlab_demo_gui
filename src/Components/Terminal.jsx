import React from 'react';

class Terminal extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
            bgStyle : {
                width: props.width,
                height: props.height,
                top: props.top,
                left: props.left,
                position: 'absolute'
                },
            text: props.text
      };
    }

    addLine(newLine) {
        console.log("adding line: " + newLine);
        this.setState({
            text: this.state.text + newLine
        })
    }

    componentDidUpdate() {
        this.refs.elem.scrollTop = this.refs.elem.scrollHeight;
    }

    render() {
        return (
            <div className="terminal" style={this.state.bgStyle} ref="elem">
                {this.state.text.split("\n").map((i,key) => {
                    return <div align="left" key={key}>{i}</div>;
                })}
            </div>
        );
    }
}

export default Terminal;