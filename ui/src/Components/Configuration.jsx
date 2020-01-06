import React from 'react';


class Configuration extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        robot2: true,
        robot1: true,
        robot3: true,
        manual2: true,
        manual3: true,
      };

      this.yggdrasilUrl = 'http://localhost:8080';
      this.ws = props.websocket;
      this.handleInputChange = this.handleInputChange.bind(this);
    }

    updateRobot2(withManual) {
      var requestObj = new XMLHttpRequest();
      // get a callback when the server responds
      requestObj.addEventListener('load', () => {
          console.log("Received response from Yggdrasil:")
          console.log(requestObj.responseText)
        });
      const url = this.constructUrl('/artifacts/robot2');
      var payload = `@prefix eve: <http://w3id.org/eve#> .

      <http://localhost:8080/artifacts/robot2>
        a eve:Artifact ;
        eve:hasName "Robot2" ;
        eve:isRobot "Robot2" ;
        eve:hasCartagoArtifact "www.Robot2" .
      `;
      if (withManual) {
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
      }
      requestObj.open('PUT', url);
      requestObj.setRequestHeader('content-type', 'text/turtle');
      requestObj.setRequestHeader('slug', 'robot2');
      requestObj.send(payload);
    }

    createRobot(requestObj, robotNumber) {
      const url = this.constructUrl('/artifacts');
      console.log('dispatching request to ' + url);
      var payload;
      if (robotNumber === 1) {
        payload = `@prefix eve: <http://w3id.org/eve#> .
        <>
            a eve:Artifact ;
            eve:hasName "Robot1" ;
            eve:isRobot "Robot1" ;
            eve:hasCartagoArtifact "www.Robot1" .`;
      } else if (robotNumber === 2) {
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

    updateWorkspace() {
      var request = new XMLHttpRequest();
      const url = this.constructUrl('/workspaces');
      var payload = `@prefix eve: <http://w3id.org/eve#> .
      <>
          a eve:Workspace;
          eve:hasName "interactionsWksp";`
      if (this.state.robot1) {
        payload +=  `
        eve:contains <http://localhost:8080/artifacts/robot1>;`;
      }
      if (this.state.robot2) {
        payload += `
        eve:contains <http://localhost:8080/artifacts/robot2>;`;
      }
      if (this.state.robot3) {
        payload += `
        eve:contains <http://localhost:8080/artifacts/robot3>;`;
      }
      if (this.state.manual3) {
        payload += `
        eve:contains <http://localhost:8080/manuals/phantomXmanual>`;
      }
      payload += '.';
      console.log("sending payload: " + payload);
      request.open('POST', url);
      request.setRequestHeader('content-type', 'text/turtle');
      request.setRequestHeader('slug', 'interactionsWksp');
      request.send(payload);
    }

    constructUrl(relativePath) {
        return this.yggdrasilUrl + relativePath;
    }

    changeManual(name_, active, updateRobot) {
      // send info to jacamo
      const jsonObj = {jacamo: {changeManual: {name: name_, enabled: active}}};
      this.ws.send(JSON.stringify(jsonObj));

      // send info to yggdrasil
      if (name_ === 'manual2') {
        this.setState({
          manual2: active
        });
        if (updateRobot) {
          this.updateRobot2(active);
        }
      } else if (name_ === 'manual3') {
        // manual3
        this.setState({
          manual3: active
        });
        var xhr = new XMLHttpRequest();
        // get a callback when the server responds
        xhr.addEventListener('load', () => {
            console.log("Received response from Yggdrasil:")
            console.log(xhr.responseText)
          });
        if (active) {
          const payload = `@prefix eve: <http://w3id.org/eve#> .

          <http://localhost:8080/manuals/phantomXmanual> a eve:Manual ;
              eve:hasName "phantomXmanual" ;
              eve:explains <http://localhost:8080/artifacts/robot3> ;
              eve:hasUsageProtocol [
                eve:hasName "deliver" ;
                eve:hasFunction "pickAndPlace(D1,D2)" ;
                eve:hasPrecondition "true" ;
                eve:hasBody " -+rotating(\\"Robot3\\",D1); -+grasping(\\"Robot3\\"); -+rotating(\\"Robot3\\",D2); -+releasing(\\"Robot3\\") "
              ] .`;
          xhr.open('POST', this.constructUrl('/manuals'));
          xhr.setRequestHeader('content-type', 'text/turtle');
          xhr.setRequestHeader('slug', 'phantomXmanual');
          xhr.send(payload)
        } else {
          xhr.open('DELETE', this.constructUrl('/manuals/phantomXmanual'));
          xhr.send();
        }
      }
    }

    handleInputChange(event) {
      const target = event.target;
      const value = target.checked;
      const name_ = target.name;

      var jsonObj;
      if (name_.startsWith("manual")) {
        jsonObj = {jacamo: {changeManual: {name: name_, enabled: value}}};
      } else {
        jsonObj = {jacamo: {changeArtifact: {name: name_, enabled: value}}};
      }
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
                // activate robot1 (doesn't have a manual)
                this.createRobot(xhr, 1);
            } else {
                // deactivate robot1
                this.removeRobot(xhr, 1);
            }
              break;
          case 'robot2':
            this.changeManual('manual2', value);
            if (value) {
              // activate robot2
              this.createRobot(xhr, 2);
            } else {
              // deactivate robot2
              this.removeRobot(xhr, 2);
            }
            break;
          case 'robot3':
            this.changeManual('manual3', value);
            if (value) {
              // activate robot3
              this.createRobot(xhr, 3);
            } else {
              // deactivate robot3
              this.removeRobot(xhr, 3);
            }
            break;
          case 'manual2':
            this.changeManual(name_, value, true);
            break;
          case 'manual3':
            this.changeManual(name_, value, false);
            break;
          default:
              console.log("unexpected name: " + name_);
      }

      this.setState({
        [name_]: value
      }, function() {
        console.log("state is updated, updating workspace " + value);
        console.log(this.state)
        this.updateWorkspace();
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