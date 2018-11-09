import React, { Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapLens from './components/MapLens';
import FindAddress from './components/dart-board/FindAddress';
import { Sherlock, SherklockDownshift, WebApiProvider } from './components/Sherlock/Sherlock';
import MapView from './components/esrijs/MapView';
import { IdentifyInformation, IdentifyContainer } from './components/Identify';
import './App.css';

export default class App extends Component {
  state = {
    zoomToPoint: {
      zoomToGraphic: {
        graphic: {},
        level: 0
      }
    },
    mapClick: {},
    showIdentify: false
  };

  onFindAddress = this.onFindAddress.bind(this);
  onMapClick = this.onMapClick.bind(this);
  showIdentify = this.showIdentify.bind(this);
  onSherlockMatch = this.onSherlockMatch.bind(this);


  render() {
    const quadWord = 'career-exhibit-panel-stadium'; //'opera-event-little-pinball';
    const apiKey = 'AGRC-Explorer'; //'AGRC-AC122FA9671436';
    const findAddressOptions = {
      apiKey: apiKey,
      wkid: 3857,
      symbol: {
        type: 'simple-marker',
        style: 'diamond',
        color: [130, 65, 47, 0.5],
        size: '18px',
        outline: {
          color: [230, 126, 21, 0.7],
          width: 1
        }
      }
    };

    const gnisSherlock = {
      provider: new WebApiProvider(apiKey, 'SGID10.LOCATION.PlaceNamesGNIS2010', 'NAME', {
        contextField: 'COUNTY'
      }),
      label: 'Find Point of Interest',
      placeHolder: 'place name ...',
      maxResultsToDisplay: 10,
      onSherlockMatch: this.onSherlockMatch
    }

    const citySherlock = {
      provider: new WebApiProvider(apiKey, 'SGID10.BOUNDARIES.Municipalities', 'NAME'),
      label: 'Find City',
      placeHolder: 'city name ...',
      maxResultsToDisplay: 10,
      onSherlockMatch: this.onSherlockMatch
    }

    return (
      <div className="app">
        <Header title="Atlas Utah" version="4.0.0" />
        <Sidebar>
          <small>Data and services provided by <a href="https://gis.utah.gov/ ">Utah AGRC</a></small>
          <p>Click a location on the map for more information</p>

          <h4>Find Address</h4>
          <div id="geocodeNode">
            <FindAddress
              pointSymbol={findAddressOptions.symbol}
              apiKey={findAddressOptions.apiKey}
              onFindAddress={this.onFindAddress}
              onFindAddressError={this.onFindAddressError} />
          </div>

          <SherklockDownshift {...gnisSherlock}></SherklockDownshift>

          <SherklockDownshift {...citySherlock}></SherklockDownshift>

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
          <MapView discoverKey={quadWord} zoomToGraphic={this.state.zoomToGraphic} onClick={this.onMapClick} />
        </MapLens>
        {this.state.showIdentify ?
          <IdentifyContainer show={this.showIdentify}>
            <IdentifyInformation apiKey={findAddressOptions.apiKey} location={this.state.mapClick} />
          </IdentifyContainer>
          : null}
      </div>
    );
  }

  onFindAddress(graphic) {
    this.setState({
      zoomToGraphic: {
        graphic: graphic,
        level: 18
      }
      // ,
      // showIdentify: false,
      // mapClick: {}
    });
  };

  onFindAddressError(e) {
    console.error(e);
  };

  onMapClick(event) {
    this.setState({
      showIdentify: true,
      mapClick: event.mapPoint
    });
  }

  showIdentify(value) {
    this.setState({ showIdentify: value });
  }

  onSherlockMatch(graphics) {
    // summary:
    //      Zooms to the passed in graphic(s).
    // graphics: esri.Graphic[]
    //      The esri.Graphic(s) that you want to zoom to.
    // tags:
    //      private
    console.log('sherlock:zoom', arguments);

    // check for point feature
    this.setState({
      zoomToGraphic: {
        graphic: graphics,
        preserve: false
      }
    });
  }
}
