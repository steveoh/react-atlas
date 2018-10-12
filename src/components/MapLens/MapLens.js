import React, { Component, Fragment } from 'react';
import './MapLens.css';
import ReactMapView from './ReactMapView';

class MapLens extends Component {
  constructor() {
    super();
    this.state = {
      center: {
        spatialReference: { latestWkid: 3857, wkid: 102100 },
        x: 15047024.975994881,
        y: -2875028.188734928
      }
    };
  }
  render() {
    return (
      <div id="centerContainer" className="map-lens map-lens--with-border map-lens-side-bar--open">
        <button className="sidebar-toggler btn btn-default btn-xs"
          data-dojo-attach-event="click:toggleSidebar">
          <span className="glyphicon glyphicon-chevron-left" id="sideBarToggle"></span>
        </button>
        <Fragment>
          <ReactMapView
            onCenterChange={center => {
              this.setState({ center });
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              backgroundColor: "white"
            }}
          >
            center :<br /> x={this.state.center.x} <br />y={this.state.center.y}
          </div>
        </Fragment>
      </div>
    );
  }
}

export default MapLens;
