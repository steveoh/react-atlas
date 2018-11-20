import React, { Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapLens from './components/MapLens';
import FindAddress from './components/dart-board/FindAddress';
import { Sherlock, WebApiProvider } from './components/Sherlock/Sherlock';
import MapView from './components/esrijs/MapView';
import Printer from './components/esrijs/Print';
import { IdentifyInformation, IdentifyContainer } from './components/Identify';
import { Collapse, Button, Card } from 'reactstrap';
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
    showIdentify: false,
    showPrint: false
  };

  onFindAddress = this.onFindAddress.bind(this);
  onMapClick = this.onMapClick.bind(this);
  showIdentify = this.showIdentify.bind(this);
  onSherlockMatch = this.onSherlockMatch.bind(this);
  togglePrint = this.togglePrint.bind(this);
  setView = this.setView.bind(this);

  render() {
    const quadWord = process.env.REACT_APP_DISCOVER;
    const apiKey = process.env.REACT_APP_WEB_API;

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
    };

    const citySherlock = {
      provider: new WebApiProvider(apiKey, 'SGID10.BOUNDARIES.Municipalities', 'NAME'),
      label: 'Find City',
      placeHolder: 'city name ...',
      maxResultsToDisplay: 10,
      onSherlockMatch: this.onSherlockMatch
    };

    const mapOptions = {
      discoverKey: quadWord,
      zoomToGraphic: this.state.zoomToGraphic,
      onClick: this.onMapClick,
      setView: this.setView
    }

    return (
      <div className="app">
        <Header title="Atlas Utah" version="4.0.0" />
        {this.state.showIdentify ?
        <IdentifyContainer show={this.showIdentify}>
          <IdentifyInformation apiKey={findAddressOptions.apiKey} location={this.state.mapClick} />
        </IdentifyContainer>
        : null}
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

          <Sherlock {...gnisSherlock}></Sherlock>

          <Sherlock {...citySherlock}></Sherlock>

          <Card>
            <Button block onClick={this.togglePrint}>Export Map</Button>
            <Collapse isOpen={this.state.showPrint}>
              {this.state.showPrint ?
                <Printer view={this.state.mapView}></Printer>
                : null}
            </Collapse>
          </Card>

        </Sidebar>
        <MapLens>
          <MapView {...mapOptions} />
        </MapLens>
      </div>
    );
  }

  onFindAddress(graphic) {
    this.setState({
      zoomToGraphic: {
        graphic: graphic,
        level: 18
      }
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

  togglePrint() {
    this.setState({
      showPrint: !this.state.showPrint
    });
  }

  setView(value) {
    this.setState({
      mapView: value
    });
  }
}
