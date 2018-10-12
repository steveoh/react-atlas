import React from 'react';
import './MapLens.css';

class MapLens extends React.Component {
  render() {
    return (
      <div id="centerContainer" className="map-lens map-lens--with-border map-lens-side-bar--open">
          <button className="sidebar-toggler btn btn-default btn-xs"
            data-dojo-attach-event="click:toggleSidebar">
            <span className="glyphicon glyphicon-chevron-left" id="sideBarToggle"></span>
          </button>
          <div id="mapDiv"></div>
        </div>
    )
  }
}

export default MapLens;
