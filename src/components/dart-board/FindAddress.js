import React, { Component } from 'react'
import PropTypes from 'prop-types';
import './FindAddress.css';
import { Graphic } from 'arcgis-wrapper'
import { Button, Form, FormGroup, FormText, Label, Input, } from 'reactstrap';

export default class FindAddress extends Component {
  state = {
    street: '2236 atkin ave',
    zone: 'slc',
    streetIsValid: true,
    zoneIsValid: true,
    found: true
  };

  find = this.find.bind(this);

  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    onFindAddress: PropTypes.func.isRequired,
    onFindAddressError: PropTypes.func,
    wkid: PropTypes.number,
    inline: PropTypes.bool,
    pointSymbol: PropTypes.object
  };

  static defaultProps = {
    wkid: 3857,
    inline: false
  };

  render() {
    return (
      <Form className={this.inline ? 'form-inline find-address' : 'find-address'}>
        <FormGroup>
          <Label for="address">Street Address</Label>
          <Input type="text" value={this.state.street} onChange={(e) => this.handleChange('street', e)} onKeyPress={this.handleKeyPress} />
          <FormText color="danger" className={this.state.streetIsValid ? 'find-address__help-block' : ''}>Required!</FormText>
        </FormGroup>
        <FormGroup>
          <Label for="zone">Zip or City</Label>
          <Input type="text" value={this.state.zone} onChange={(e) => this.handleChange('zone', e)} onKeyPress={this.handleKeyPress} />
          <FormText color="danger" className={this.state.zoneIsValid ? 'find-address__help-block' : ''}>Required!</FormText>
        </FormGroup>
        <FormGroup>
          <Button outline color="dark" onClick={this.find}>Find</Button>
          <FormText color="danger" className={this.state.found ? 'find-address__help-block' : ''}>No match found!</FormText>
        </FormGroup>
      </Form>
    )
  };

  async find() {
    console.info('FindAddress.find');
    if (!this.validate()) {
      return false;
    }

    const response = await this.fetch({
      street: this.state.street,
      zone: this.state.zone
    });

    let location = await this.extractResponse(response);

    return this.props.onFindAddress(location);
  };

  fetch(options) {
    const url = `https://api.mapserv.utah.gov/api/v1/Geocode/${options.street}/${options.zone}?`;

    const query = {
      apiKey: this.props.apiKey,
      spatialReference: this.props.wkid
    };

    const querystring = Object.keys(query)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(query[key]))
      .join('&')
      .replace(/%20/g, '+');

    return fetch(url + querystring, {
      query: options
    });
  };

  async extractResponse(response) {
    if (!response.ok) {
      this.setState({ found: false });

      return this.props.onFindAddressError(response);
    }

    let result = await response.json();

    if (result.status !== 200) {
      this.setState({ found: false });

      return this.props.onFindAddressError(response);
    }

    result = result.result;

    const point = {
      type: 'point',
      x: result.location.x,
      y: result.location.y,
      spatialReference: {
        wkid: this.props.wkid
      }
    };

    const graphic = new Graphic({
      geometry: point,
      symbol: this.props.pointSymbol
    });

    return graphic;
  };

  validate() {
    const propsToValidate = ['street', 'zone'];

    const newState = propsToValidate.reduce((accum, key) => {
      accum[key + 'IsValid'] = this.state[key].trim().length > 0;

      return accum;
    }, {});

    newState.found = true;

    this.setState(newState);

    return propsToValidate.every(key => newState[key + 'IsValid'] === true);
  };

  handleChange(value, event) {
    this.setState({ [value]: event.target.value });
  };

  handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      await this.find();
    }
  };
};
