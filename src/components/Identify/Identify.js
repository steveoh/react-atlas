import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Identify.css';
import { Navbar, Container, Col } from 'reactstrap';
import { projection } from 'arcgis-wrapper';
import Helpers from '../../Helpers';

class IdentifyInformation extends Component {
  state = {
    county: 'loading...',
    municipality: 'loading...',
    landOwner: 'loading...',
    utmX: 0,
    utmY: 0,
    zip: '00000',
    address: 'loading...',
    lat: 0,
    lon: 0
  };

  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    wkid: PropTypes.number
  };

  static defaultProps = {
    wkid: 3857
  };

  identify = this.identify.bind(this);

  featureClassNames = {
    counties: 'SGID10.BOUNDARIES.Counties',
    municipalities: 'SGID10.BOUNDARIES.Municipalities',
    landOwnership: 'SGID10.CADASTRE.LandOwnership',
    nationalGrid: 'SGID10.INDICES.NationalGrid',
    dem: 'SGID10.RASTER.USGS_DEM_10METER',
    gnis: 'SGID10.LOCATION.PlaceNamesGNIS2010',
    zip: 'SGID10.BOUNDARIES.ZipCodes'
  };

  fieldNames = {
    // counties & municipalities
    NAME: 'NAME',
    // state
    STATE_LGD: 'STATE_LGD',
    GRID1Mil: 'GRID1Mil',
    GRIS100K: 'GRID100K',
    FEET: 'feet',
    METERS: 'value',
    ZIP5: 'ZIP5'
  };

  urls = {
    search: 'https://api.mapserv.utah.gov/api/v1/search'
  }

  outside = 'Outside of Utah';

  requests = [
    [
      this.featureClassNames.counties,
      this.fieldNames.NAME,
      (data) => {
        if (!data) {
          this.setState({county: this.outside});

          return;
        }
        this.setState({county: data[this.fieldNames.NAME]});
      }
    ], [
      this.featureClassNames.municipalities,
      this.fieldNames.NAME,
      (data) => {
        if (!data) {
          this.setState({municipality: 'Unincorporated'});

          return;
        }
        this.setState({municipality: data[this.fieldNames.NAME]});
      }
    ], [
      this.featureClassNames.landOwnership,
      this.fieldNames.STATE_LGD,
      (data) => {
        if (!data) {
          this.setState({landOwner: this.outside});

          return;
        }
        this.setState({landOwner: data[this.fieldNames.STATE_LGD]});
      }
    ], [
      this.featureClassNames.nationalGrid,
      this.fieldNames.GRID1Mil + ',' + this.fieldNames.GRIS100K,
      (data) => {
        if (!data) {
          this.setState({nationalGrid: this.outside});

          return;
        }

        const values = [
          data[this.fieldNames.GRID1Mil],
          data[this.fieldNames.GRIS100K], data.x, data.y
        ];
        this.setState({nationalGrid: ('{0} {1} {2} {3}', values)});
      }
    ], [
      this.featureClassNames.dem,
      this.fieldNames.FEET + ',' + this.fieldNames.METERS,
      (data) => {
        if (!data) {
          this.setState({elevFeet: this.outside});
          this.setState({elevMeters: this.outside});

          return;
        }

        this.setState({elevFeet: data[this.fieldNames.FEET]});
        this.setState({elevMeters: data[this.fieldNames.METERS]});
      }
    ], [
      this.featureClassNames.zip,
      this.fieldNames.ZIP5,
      (data) => {
        if (!data) {
          this.setState({zip: this.outside});

          return;
        }

        this.setState({zip: data[this.fieldNames.ZIP5]});
      }
    ]
  ];

  async fetch(requestMetadata, mapPoint) {
    await requestMetadata.forEach(async item => {

      const url = `${this.urls.search}/${item[0]}/${item[1]}?`;
      const query = Helpers.toQueryString({
        geometry: `point: ${JSON.stringify(mapPoint.toJSON())}`,
        attributeStyle: 'identical',
        apiKey: this.props.apiKey,
        spatialReference: this.props.wkid
      });

      const response = await fetch(url + query);
      let result = await response.json();
      result = result.result;

      let data;
      // const decimalLength = -5;
      if (result.length > 0) {
        data = result[0].attributes || {};
      }

      item[2](data);
    });
  }

  identify() {
    console.log('identifying');
    this.fetch(this.requests, this.props.location);
    this.projectPoint(this.props.location, 4326);
    this.projectPoint(this.props.location, 26912);
  }

  projectPoint(mapPoint, srid) {
    // if (projection.isSupported()) {
    //   console.log('supported', mapPoint, srid);
      // promise = projection.load().then(() => {
      //   // lat/long coords
      //   const ll = projection.project(evt.mapPoint, { wkid: 4326 });
      //   const decimalPlaces = 100000;
      //   this.lng.innerHTML = Math.round(ll.x * decimalPlaces) / decimalPlaces;
      //   this.lat.innerHTML = Math.round(ll.y * decimalPlaces) / decimalPlaces;

      //   // utm coords
      //   const utm = projection.project(evt.mapPoint, { wkid: 26912 });
      //   const utmx = Math.round(utm.x);
      //   const utmy = Math.round(utm.y);
      //   this.utmX.innerHTML = utmx;
      //   this.utmY.innerHTML = utmy;

      //   this.googleMapsLink.href = `https://www.google.com/maps?q&layer=c&cbll=${ll.y},${ll.x}`;
      // }
  }

  componentDidMount() {
    this.identify();
  }

  componentDidUpdate(prevProps) {
    const currentLocation = (((this.props || false).location || false).x || false);
    const previousLocation = (((prevProps || false).location || false).x || false);

    if (currentLocation !== previousLocation && currentLocation !== false) {
      this.identify();
    }
  }

  render() {
    return (
      <Container fluid className="identify">
        <Col md="3" sm="6" xs="6">
          <p>UTM 12 NAD83 Coordinates</p>
          <p className="identify--muted">{ this.state.utmX }, {this.state.utmY}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>Approximate Street Address</p>
          <p className="identify--muted">{this.state.address}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>Zip Code</p>
          <p className="identify--muted">{this.state.zip}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>Land Administration Category</p>
          <p className="identify--muted">{this.state.landOwner}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>WGS84 Coordinates</p>
          <p className="identify--muted">{this.state.lat}, {this.state.lon}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>City</p>
          <p className="identify--muted">{this.state.municipality}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>County</p>
          <p className="identify--muted">{this.state.county}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>US National Grid</p>
          <p className="identify--muted">{this.state.nationalGrid}</p>
        </Col>
        <Col md="3" sm="6" xs="6">
          <p>Elevation Meters</p>
          <p className="identify--muted">{this.state.elevMeters}</p>
        </Col>
        <Col>
          <p>Elevation Feet</p>
          <p className="identify--muted">{this.state.elevFeet}</p>
        </Col>
        <Col>
          <a href={this.state.googleMapsLink} className="text-info" target="_blank" rel="noopener noreferrer">Google Street View (opens in new window)</a>
        </Col>
      </Container>
    );
  }
}

class IdentifyContainer extends Component {
  close = this.close.bind(this);

  close() {
    this.props.show(false);
  }

  render() {
    return (
      <Navbar dark color="dark" fixed="bottom" className="border-top border-warning">
        <button type="button" className="identify__close" aria-label="Close" onClick={this.close}>
          <span aria-hidden="true">&times;</span>
        </button>
        {this.props.children}
      </Navbar>
    );
  }
}

export { IdentifyContainer, IdentifyInformation }
