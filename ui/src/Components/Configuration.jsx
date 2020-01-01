import React from 'react';


class Configuration extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        robot2: true,
        robot1: true,
        robot3: true,
        manual1: true,
        manual2: false,
        manual3: false,
      };

      this.yggdrasilUrl = 'http://localhost:8080';
      this.ws = props.websocket;
      this.handleInputChange = this.handleInputChange.bind(this);
    }

    constructUrl(relativePath) {
        return this.yggdrasilUrl + relativePath;
    }

    handleInputChange(event) {
      const target = event.target;
      const value = target.checked;
      const name_ = target.name;

      const jsonObj = {jacamo: {changeArtifact: {name: name_, enabled: value}}};
      console.log("setting " + name_ + " enabled: " + value);
      this.ws.send(JSON.stringify(jsonObj)); // notifies jacamo app
      console.log('preparing request to yggdrasil...');
      var xhr = new XMLHttpRequest()
      // get a callback when the server responds
      xhr.addEventListener('load', () => {
          // update the state of the component with the result here
          console.log(xhr.responseText)
        });

      switch (name_) {
          case 'robot1':
            if (value === true) {
                // activate
                // TODO: also activate corresponding manuals?

                // open the request with the verb and the url
                console.log('dispatching request to ' + this.constructUrl('/artifacts'));
                xhr.open('POST', this.constructUrl('/artifacts/robot1'));
                //xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                xhr.setRequestHeader('content-type', 'text/turtle');
                xhr.setRequestHeader('slug', 'robot1');
                const payload = `@prefix eve: <http://w3id.org/eve#> .

                <>
                    a eve:Artifact ;
                    eve:hasName "robot1" ;
                    eve:isRobot "robot1" ;
                    eve:hasCartagoArtifact "www.Robot1" .`
                xhr.send(payload);
            } else {
                // deactivate
                // TODO: also deactivate manuals
                xhr.open('DELETE', this.constructUrl('/artifacts/robot1'));
                //xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                xhr.setRequestHeader('slug', 'robot1');
                xhr.send();
            }

              break;
          default:
              console.log("unexpected name: " + name_);
      }

      this.setState({
        [name_]: value
      });
    }

    render() {
      return (
        <form>
          <label class="marginRight">
            Driver Robot:
            <input
              name="robot2"
              type="checkbox"
              checked={this.state.robot2}
              onChange={this.handleInputChange} />
          </label>
          <label class="marginRight">
            Robot Arm 1:
            <input
              name="robot1"
              type="checkbox"
              checked={this.state.robot1}
              onChange={this.handleInputChange} />
          </label>
          <label>
            Robot Arm 2:
            <input
              name="robot3"
              type="checkbox"
              checked={this.state.robot3}
              onChange={this.handleInputChange} />
          </label>
          <br />
          <label class="marginRight">
            Manual 1:
            <input
              name="manual1"
              type="checkbox"
              checked={this.state.manual1}
              onChange={this.handleInputChange} />
          </label>
          <label class="marginRight">
            Manual 2:
            <input
              name="manual2"
              type="checkbox"
              checked={this.state.manual2}
              onChange={this.handleInputChange} />
          </label>
          <label>
            Manual 3:
            <input
              name="manual3"
              type="checkbox"
              checked={this.state.manual3}
              onChange={this.handleInputChange} />
          </label>
        </form>
      );
    }
}

export default Configuration;