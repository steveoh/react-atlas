import React, { Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapLens from './components/MapLens';
import FindAddress from './components/dart-board/FindAddress';
import './App.css';

export default class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const findAddress = {
      zoomLevel: 12,
      apiKey: 'AGRC-Explorer',
      wkid: 3857
    };

    return (
      <div className="app">
        <Header title="Atlas Utah" version="4.0.0"/>
        <MapLens />
        <Sidebar>
          Data and services provided by <a href="http://gis.utah.gov">Utah AGRC</a>
          <p>Click a location on the map for more information</p>

          <h4>Find Address</h4>
          <div id="geocodeNode">
            <FindAddress
              apiKey={findAddress.apiKey}
              wkid={findAddress.wkid}
              zoomLevel={findAddress.zoomLevel}
              onFind={findAddress.onFind}
              onError={this.props.onError} />
          </div>

          <h4>Find Point of Interest</h4>
          <div id="gnisNode"></div>

          <h4>Find City</h4>
          <div id="cityNode"></div>

          <div className="panel panel-default">
            <div className="panel-heading" role="tab">
              <h4 className="panel-title">
                <a role="button" data-toggle="collapse" data-target="#collapseExport" className="collapsed">
                  Export Map
                </a>
              </h4>
            </div>
            <div id="collapseExport" className="panel-collapse collapse" role="tabpanel">
              <div className="panel-body">
                <div id="printDiv"></div>
              </div>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  }
}
