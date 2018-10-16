import React, { Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapLens from './components/MapLens';
import FindAddress from './components/dart-board/FindAddress';
import MapView from './components/esrijs/MapView';
import './App.css';

export default class App extends Component {
  state = {
    zoomToPoint: {}
  };

  onFindAddress = this.onFindAddress.bind(this);

  onFindAddress(point) {
    this.setState({
      zoomToPoint: {
        point,
        zoom: 18
      }
    });
  };

  onFindAddressError(e) {
    console.error(e);
  };

  toggle() {

  }

  render() {
    const findAddressOptions = {
      apiKey: 'AGRC-Explorer',
      wkid: 3857
    };

    return (
      <div className="app">
        <Header title="Atlas Utah" version="4.0.0"/>
        <Sidebar>
          <small>Data and services provided by <a href="http://gis.utah.gov">Utah AGRC</a></small>
          <p>Click a location on the map for more information</p>

          <h4>Find Address</h4>
          <div id="geocodeNode">
            <FindAddress
              apiKey={findAddressOptions.apiKey}
              onFindAddress={this.onFindAddress}
              onFindAddressError={this.onFindAddressError} />
          </div>

          <h4>Find Point of Interest</h4>
          <div id="gnisNode"></div>

          <h4>Find City</h4>
          <div id="cityNode"></div>

          <div className="panel panel-default">
            <div className="panel-heading" role="tab">
              <h4 className="panel-title">
                <button onClick={this.toggle} className="collapsed">
                  Export Map
                </button>
              </h4>
            </div>
            <div id="collapseExport" className="panel-collapse collapse" role="tabpanel">
              <div className="panel-body">
                <div id="printDiv"></div>
              </div>
            </div>
          </div>
        </Sidebar>
        <MapLens>
          <MapView zoomToPoint={this.state.zoomToPoint} />
        </MapLens>
      </div>
    );
  }
}
