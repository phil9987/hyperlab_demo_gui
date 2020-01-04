import React from 'react';


class Configuration extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        robot2: true,
        robot1: true,
        robot3: true,
        manual2: false,
        manual3: false,
      };

      this.yggdrasilUrl = 'http://localhost:8080';
      this.ws = props.websocket;
      this.handleInputChange = this.handleInputChange.bind(this);
    }

    createRobot(requestObj, robotNumber, withManual) {
      const url = this.constructUrl('/artifacts');
      console.log('dispatching request to ' + url);
      var payload;
      if (robotNumber === 1 || (robotNumber === 2 && !withManual)) {
        payload = `@prefix eve: <http://w3id.org/eve#> .
        <>
            a eve:Artifact ;
            eve:hasName "robot` + robotNumber + `" ;
            eve:isRobot "robot` + robotNumber + `" ;
            eve:hasCartagoArtifact "www.Robot` + robotNumber + `" .`;
      } else if (robotNumber === 2 && withManual) {
        payload = `@prefix eve: <http://w3id.org/eve#> .
        <http://localhost:8080/artifacts/robot2>
          a eve:Artifact ;
          eve:hasName "Robot2" ;
          eve:isRobot "Robot2" ;
          eve:hasCartagoArtifact "www.Robot2" ;
          eve:hasManual [ eve:hasName "driverManual" ;
          eve:hasUsageProtocol [
            eve:hasName "loadAndDrive" ;
            eve:hasFunction "drive(X1,Y1,X2,Y2)" ;
            eve:hasPrecondition "true" ;
            eve:hasBody " move(X1,Y1);
                    load;
                    move(X2,Y2);
                    unload "
          ]
          ].`;
      } else if (robotNumber === 3) {
        payload = `@prefix td: <http://www.w3.org/ns/td#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @prefix iot: <http://iotschema.org/> .
        @prefix http: <http://iotschema.org/protocol/http> .
        @prefix eve: <http://w3id.org/eve#> .
        @prefix ex: <http://example.com/> .

        <http://localhost:8080/artifacts/robot3>
          a td:Thing, eve:Artifact;
          td:name "Robot3"^^xsd:string ;
          td:base "http://192.168.2.50/"^^xsd:anyURI ;
          td:interaction  [
            a td:Action, ex:Base ;
            td:name "Base"^^xsd:string ;
            td:form [
              http:methodName "PUT"^^xsd:string ;
              td:href "https://api.interactions.ics.unisg.ch/leubot/wrist/rotation"^^xsd:anyURI ;
              td:mediaType "application/json"^^xsd:string ;
              td:rel "invokeAction"^^xsd:string
            ] ;
            td:inputSchema [
              td:schemaType td:Object ;
              td:field [
                td:name "token"^^xsd:string ;
                td:schema [ td:schemaType td:Boolean; td:const "\\"c347b252a29f75104fb47b10b4e75e5c\\"" ]
              ] ;
             td:field [
                td:name "value"^^xsd:string ;
                td:schema [ a ex:Value ; td:schemaType td:Number ]
              ]
            ]
           ];
           td:interaction  [
            a td:Action, ex:Gripper ;
            td:name "Gripper"^^xsd:string ;
            td:form [
              http:methodName "PUT"^^xsd:string ;
              td:href "https://api.interactions.ics.unisg.ch/leubot/gripper"^^xsd:anyURI ;
              td:mediaType "application/json"^^xsd:string ;
              td:rel "invokeAction"^^xsd:string
            ] ;
            td:inputSchema [
              td:schemaType td:Object ;
              td:field [
                td:name "value"^^xsd:string ;
                td:schema [ a ex:Value ; td:schemaType td:Number ]
              ]
            ]
          ].
        `;
      }
      requestObj.open('POST', url);
      requestObj.setRequestHeader('content-type', 'text/turtle');
      requestObj.setRequestHeader('slug', 'robot' + robotNumber);
      requestObj.send(payload);
    }

    removeRobot(requestObj, robotNumber) {
      requestObj.open('DELETE', this.constructUrl('/artifacts/robot' + robotNumber));
      requestObj.send();
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
      var xhr = new XMLHttpRequest();
      // get a callback when the server responds
      xhr.addEventListener('load', () => {
          console.log("Received response from Yggdrasil:")
          console.log(xhr.responseText)
        });

      switch (name_) {
          case 'robot1':
            if (value) {
                // activate robot1
                // TODO: also activate corresponding manuals?
                // open the request with the verb and the url
                this.createRobot(xhr, 1);
            } else {
                // deactivate robot1
                // TODO: also deactivate manuals
                this.removeRobot(xhr, 1);
            }
              break;
          case 'robot2':
            if (value) {
              // activate robot2
              this.createRobot(xhr, 2);
            } else {
              // deactivate robot2
              this.removeRobot(xhr, 2);
            }
            break;
          case 'robot3':
            if (value) {
              // activate robot3
              this.createRobot(xhr, 3);
            } else {
              // deactivate robot3
              this.removeRobot(xhr, 3);
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
        <form className="leftbound">
          <label className="marginRight">
            Driver Robot:
            <input
              name="robot2"
              type="checkbox"
              checked={this.state.robot2}
              onChange={this.handleInputChange} />
          </label>
          <label className="marginRight">
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
          <label className="largeMarginRight">
            Manual:
            <input
              name="manual2"
              type="checkbox"
              checked={this.state.manual2}
              onChange={this.handleInputChange} />
          </label>
          <label>
            Manual:
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