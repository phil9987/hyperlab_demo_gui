import React from 'react';


class Configuration extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        driverRobot: true,
        robotArm1: true,
        robotArm2: true,
        manual1: true,
        manual2: false,
        manual3: false,
      };

      this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;

      this.setState({
        [name]: value
      });
    }

    render() {
      return (
        <form>
          <label class="marginRight">
            Driver Robot:
            <input
              name="driverRobot"
              type="checkbox"
              checked={this.state.driverRobot}
              onChange={this.handleInputChange} />
          </label>
          <label class="marginRight">
            Robot Arm 1:
            <input
              name="robotArm1"
              type="checkbox"
              checked={this.state.robotArm1}
              onChange={this.handleInputChange} />
          </label>
          <label>
            Robot Arm 2:
            <input
              name="robotArm2"
              type="checkbox"
              checked={this.state.robotArm2}
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