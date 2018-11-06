import React, { Component } from 'react'
import PropTypes from 'prop-types';
import './Sherlock.css'
import { Input, Button, InputGroup, InputGroupAddon } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Helpers from '../../Helpers'
import escapeRegExp from 'lodash.escaperegexp';
import { loadModules } from 'esri-loader';

class Sherlock extends Component {
  state = {
    results: [],
    selectedIndex: -1,
    value: ''
  }

  static propTypes = {
    placeHolder: PropTypes.string,
    maxResultsToDisplay: PropTypes.number,
    zoomLevel: PropTypes.number,
  };

  static defaultProps = {
    placeHolder: 'Map Search...',
    maxResultsToDisplay: 20,
    zoomLevel: 5,
    symbols: {
      polygon: {
        type: 'simple-fill',
        outline: {
          style: 'dash-dot',
          color: [255, 255, 0],
          width: 1.5
        }
      },
      line: {
        type: 'simple-line',
        style: 'solid',
        color: [255, 255, 0],
        width: 5
      },
      point: {
        type: 'simple-marker',
        style: 'circle',
        color: [255, 255, 0, 0.5],
        size: 10
      }
    }
  }

  updateValue = this.updateValue.bind(this);
  handleSpecialKeys = this.handleSpecialKeys.bind(this);
  handleMouse = this.handleMouse.bind(this);
  // onBlur = this.onBlur.bind(this);

  render() {
    const selectedIndex = this.state.selectedIndex;
    let results = this.state.results.map((item, index) => (
      <li className={'sherlock__match-item' + (selectedIndex === index ? ' sherlock__match-item--selected' : '')} key={index}>
        <Highlighted text={item.attributes[this.props.provider.searchField]} highlight={this.state.value}></Highlighted>
        <div>{item.attributes[this.props.provider.contextField] || ''}</div>
      </li>
    ));
    if (this.state.message) {
      results.push((
        <li className="sherlock__message text-muted" key="message">
          {this.state.message}
        </li>
      ))
    }
    return (
      <div className="sherlock">
        <InputGroup>
          <Input value={this.state.value} placeholder={this.props.placeHolder} onChange={this.updateValue} onKeyUp={this.handleSpecialKeys} onBlur={this.blur} onFocus={this.focus}></Input>
          <InputGroupAddon addonType="append">
            <Button size="sm" color="secondary">
              <FontAwesomeIcon icon={faSearch} size="lg"></FontAwesomeIcon>
            </Button>
          </InputGroupAddon>
        </InputGroup>
        {
          results.length < 1 ? null :
          <div className="sherlock__match-dropdown" onMouseEnter={() => this.handleMouse(true)} onMouseLeave={() => this.handleMouse(false)}>
            <ul className="sherlock__matches" data-dojo-attach-point="matchesList">
              {results}
            </ul>
          </div>
        }
      </div>
    )
  }

  updateValue(event) {
    this.setState({ value: event.target.value });
  }

  async handleSpecialKeys(event) {
    const code = event.key;

    switch (code) {
      case 'Enter':
        // zoom if there is at least one match
        if (this.state.results.length > 1) {
          console.log(`sherlock:handleSpecialKeys.selectedIndex: ${this.state.selectedIndex}`);

          await this.setMatch(this.state.results[this.state.selectedIndex]);
        } else {
          // search
          this.search(event.target.value);
        }

        break;
      case 'ArrowDown':
        this.moveSelection(1);

        break;
      case 'ArrowUp':
        this.moveSelection(-1);

        break;
      case 'Escape':
        this.setState({
          results: [],
          value: '',
          selectedIndex: -1
        });

        break;
      default:
        this.startSearchTimer();

        break;
    }
  }

  moveSelection(change) {
    // summary:
    //      Moves the selected row in the results table based upon
    //      the arrow keys being pressed.
    // change: Number
    //      The number of rows to move. Positive moves down, negative moves up.
    // tags:
    //      private
    console.log('sherlock:moveSelection', arguments);

    // exit if there are no matches in table
    if (this.state.results.length < 2) {
      this.startSearchTimer();

      return;
    }

    // increment index
    let currentIndex = this.state.selectedIndex + change;

    // prevent out of bounds index
    if (currentIndex < 0) {
      currentIndex = 0;
    } else if (currentIndex > this.state.results.length - 1) {
      currentIndex = this.state.results.length - 1;
    }

    this.setState({
      selectedIndex: currentIndex
    });
  }

  blur(event) {
    console.log('sherlock:blur', event);
  }

  focus(event) {
    console.log('sherlock:focus', event);
  }

  handleMouse(isOverTable) {
    console.log('sherlock:handleMouse', isOverTable);

    this.setState({
      isOverTable
    });
  }

  startSearchTimer() {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.search(this.state.value);
    }, 350);
  }

  async search(searchString) {
    console.log(`sherlock:searching for ${searchString}`);

    if (searchString.length <= 2) {
      this.setState({
        results: [],
        message: 'Type more than 2 characters'
      });

      return;
    }

    // this.props.provider.cancelPendingRequests();

    const response = await this.props.provider.search(searchString).catch((err) => {
      // clear results
      this.setState({
        results: []
      });

      // swallow errors from cancels
      if (err.message === 'The user aborted a request.') {
        return;
      } else if (err.message !== 'undefined') {
        throw new Error('sherlock.Sherlock Provider Error: ' + err.message);
      }
    });

    if (!response.ok) {
      this.setState({
        results: [],
        message: response.message
      });

      return; // this.props.onError(response.message);
    }

    const results = response.data;

    console.log('sherlock:search.results:');
    console.log(results);

    let features = this.prettify(results);

    const featureCount = features.length;
    console.log(`sherlock:search.unique results: ${featureCount}`);

    let message = '';
    // return if too many values or no values
    if (featureCount > this.props.maxResultsToDisplay) {
      message = `More than ${this.props.maxResultsToDisplay} matches found...`;
      features = features.slice(0, this.props.maxResultsToDisplay);
    } else if (featureCount === 0) {
      message = 'There are no matches.';
    }

    this.setState({
      results: features,
      message
    });
  }

  async setMatch(feature) {
    // summary:
    //      Sets the passed in feature as a match in the text box and
    //      zooms to the feature.
    // feature: Object
    //      The feature object that you want to set the textbox to.
    // tags:
    //      private
    console.log('sherlock:setMatch', arguments);

    // clear any old graphics
    // this.graphicsLayer.removeAll();

    // clear table
    // this._toggleTable(false);

    // clear prompt message
    // this.hideMessage();

    // set textbox to full value
    const searchValue = feature.attributes[this.props.provider.searchField];
    let contextValue;
    if (this.props.provider.contextField) {
      contextValue = feature.attributes[this.props.provider.contextField];
    }

    this.setState({
      value: searchValue,
      results: []
    });

    // execute query / canceling any previous query
    // this.props.provider.cancelPendingRequests();

    const response = await this.props.provider.getFeature(searchValue, contextValue);

    if (!response.ok) {
      this.setState({
        results: [],
        message: response.message
      });

      return; // this.props.onError(response.message);
    }

    const [Graphic] = await loadModules(['esri/Graphic']);

    const results = response.data;

    const graphics = results.map(feature =>
      (new Graphic({
        geometry: feature.geometry,
        attributes: feature.attributes,
        symbol: this.props.symbols[feature.geometry.type]
      }))
    );

    this.props.onSherlockMatch(graphics);
  }

  prettify(features) {
    // summary:
    //      Processes the features returned from the search provider
    // features: Object[]
    // tags:
    //      private
    console.log('sherlock:prettify', arguments);

    try {
      // remove duplicates
      features = this.sortArray(this.toDistinct(features));

      return features;
    } catch (e) {
      throw new Error('sherlock.Sherlock_processResults: ' + e.message);
    }
  }

  sortArray(list) {
    // summary:
    //      Sorts the array by both the searchField and contextField
    //      if there is a contextField specied. If no context field is
    //      specified, no sorting is done since it's already done on the server
    //      with the 'ORDER BY' statement. I tried to add a second field to the
    //      'ORDER BY' statement but ArcGIS Server just choked.
    console.log('sherlock:sortArray', arguments);

    // custom sort function
    const sortFeatures = (a, b) => {
      const searchField = this.props.provider.searchField;
      const contextField = this.props.provider.contextField;

      if (a.attributes[searchField] === b.attributes[searchField]) {
        if (a.attributes[contextField] < b.attributes[contextField]) {
          return -1;
        }

        return 1;
      } else if (a.attributes[searchField] < b.attributes[searchField]) {
        return -1;
      }

      return 1;
    }

    // sort features
    return list.sort(sortFeatures);
  }

  toDistinct(features) {
    // summary:
    //      Removes duplicates from the set of features.
    // features: Object[]
    //      The array of features that need to be processed.
    // returns: Object[]
    //      The array after it has been processed.
    // tags:
    //      private
    console.log('sherlock:toDistinct', arguments);

    const list = [];
    features.forEach((f) => {
      if (list.some((existingF) => {
        if (existingF.attributes[this.props.provider.searchField] === f.attributes[this.props.provider.searchField]) {
          if (this.props.provider.contextField) {
            if (existingF.attributes[this.props.provider.contextField] === f.attributes[this.props.provider.contextField]) {
              return true;
            }
          } else {
            return true; // there is a match
          }
        }

        return false;
      }, this) === false) {
        // add item
        list.push(f);
      }
    }, this);

    return list;
  }
}

class ProviderBase {
  controller = new AbortController();
  signal = this.controller.signal;

  getOutFields(outFields, searchField, contextField) {
    outFields = outFields || [];

    // don't mess with '*'
    if (outFields[0] === '*') {
      return outFields;
    }

    const addField = (fld) => {
      if (fld && outFields.indexOf(fld) === -1) {
        outFields.push(fld);
      }
    };

    addField(searchField);
    addField(contextField);

    return outFields;
  }

  getSearchClause(text) {
    return `UPPER(${this.searchField}) LIKE UPPER('%${text}%')`;
  }

  getFeatureClause(searchValue, contextValue) {
    let statement = `${this.searchField}='${searchValue}'`;

    if (this.contextField) {
      if (contextValue && contextValue.length > 0) {
        statement += ` AND ${this.contextField}='${contextValue}'`;
      } else {
        statement += ` AND ${this.contextField} IS NULL`;
      }
    }

    return statement;
  }

  cancelPendingRequests() {
    this.controller.abort();
  }
}

class WebApiProvider extends ProviderBase {
  constructor(apiKey, searchLayer, searchField, options) {
    super();
    console.log('sherlock.providers.WebAPI:constructor', arguments);

    const defaultWkid = 3857;
    this.geometryClasses = {
      point: console.log,
      polygon: console.log,
      polyline: console.log
    };

    this.searchLayer = searchLayer;
    this.searchField = searchField;

    if (options) {
      this.wkid = options.wkid || defaultWkid;
      this.contextField = options.contextField;
      this.outFields = this.getOutFields(options.outFields, this.searchField, this.contextField);
    } else {
      this.wkid = defaultWkid;
    }

    this.outFields = this.getOutFields(null, this.searchField, this.contextField);
    this.webApi = new WebApi(apiKey, this.signal);
  }

   async search(searchString) {
    console.log('sherlock.providers.WebAPI:search', arguments);

    return await this.webApi.search(this.searchLayer, this.outFields, {
      predicate: this.getSearchClause(searchString),
      spatialReference: this.wkid
    });
  }

  async getFeature(searchValue, contextValue) {
    console.log('sherlock.providers.WebAPI:getFeature', arguments);

    return await this.webApi.search(this.searchLayer, this.outFields.concat('shape@'), {
      predicate: this.getFeatureClause(searchValue, contextValue),
      spatialReference: this.wkid
    });
  }
}

const Highlighted = ({ text = '', highlight = '' }) => {
  if (!highlight.trim()) {
    return <div>{text}</div>;
  }

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi')
  const parts = text.split(regex)

  return (
    <div>
      {
        parts.filter(part => part).map((part, i) => (
          regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
        ))
      }
    </div>
  )
}

class WebApi {
  constructor(apiKey, signal) {
    this.baseUrl = 'https://api.mapserv.utah.gov/api/v1/';

    // defaultAttributeStyle: String
    this.defaultAttributeStyle = 'identical';

    // xhrProvider: dojo/request/* provider
    //      The current provider as determined by the search function
    this.xhrProvider = null;


    // Properties to be sent into constructor

    // apiKey: String
    //      web api key (http://developer.mapserv.utah.gov/AccountAccess)
    this.apiKey = apiKey;

    this.signal = signal;
  }

  async search(featureClass, returnValues, options) {
    // summary:
    //      search service wrapper (http://api.mapserv.utah.gov/#search)
    // featureClass: String
    //      Fully qualified feature class name eg: SGID10.Boundaries.Counties
    // returnValues: String[]
    //      A list of attributes to return eg: ['NAME', 'FIPS'].
    //      To include the geometry use the shape@ token or if you want the
    //      envelope use the shape@envelope token.
    // options.predicate: String
    //      Search criteria for finding specific features in featureClass.
    //      Any valid ArcObjects where clause will work. If omitted, a TSQL *
    //      will be used instead. eg: NAME LIKE 'K%'
    // options.geometry: String (not fully implemented)
    //      The point geometry used for spatial queries. Points are denoted as
    //      'point:[x,y]'.
    // options.spatialReference: Number
    //      The spatial reference of the input geographic coordinate pair.
    //      Choose any of the wkid's from the Geographic Coordinate System wkid reference
    //      or Projected Coordinate System wkid reference. 26912 is the default.
    // options.tolerance: Number (not implemented)
    // options.spatialRelation: String (default: 'intersect')
    // options.buffer: Number
    //      A distance in meters to buffer the input geometry.
    //      2000 meters is the maximum buffer.
    // options.pageSize: Number (not implemented)
    // options.skip: Number (not implemented)
    // options.attributeStyle: String (defaults to 'identical')
    //      Controls the casing of the attributes that are returned.
    //      Options:
    //
    //      'identical': as is in data.
    //      'upper': upper cases all attribute names.
    //      'lower': lowercases all attribute names.
    //      'camel': camel cases all attribute names
    //
    // returns: Promise
    console.log('WebApi:search', arguments);

    var url = `${this.baseUrl}search/${featureClass}/${encodeURIComponent(returnValues.join(','))}?`;

    if (!options) {
      options = {};
    }

    options.apiKey = this.apiKey;
    if (!options.attributeStyle) {
      options.attributeStyle = this.defaultAttributeStyle;
    }

    const querystring = Helpers.toQueryString(options);

    const response = await fetch(url + querystring, { signal: this.signal });

    if (!response.ok) {
      return {
        ok: false,
        message: response.message || response.statusText
      };
    }

    const result = await response.json();

    if (result.status !== 200) {
      return {
        ok: false,
        message: result.message
      };
    }

    return {
      ok: true,
      data: result.result
    };
  }
}

export { Sherlock, WebApiProvider }
