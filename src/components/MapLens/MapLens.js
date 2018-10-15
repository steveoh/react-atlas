import React, { Component } from 'react';
import './MapLens.css';

export default class MapLens extends Component {
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
        {this.props.children}
      </div>
    );
  }
}
