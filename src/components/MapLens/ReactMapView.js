import { Map, MapView } from 'arcgis-wrapper';
import React, { Component } from 'react';

export default class ReactSceneView extends Component {
  constructor() {
    super();
    this.map = new Map({
      basemap: 'dark-gray'
    });
  }

  componentDidMount() {
    var view = new MapView({
      container: this.mapViewDiv,
      map: this.map,
      zoom: 4,
      extent: {
        xmax: -11762120.612131765,
        xmin: -13074391.513731329,
        ymax: 5225035.106177688,
        ymin: 4373832.359194187,
        spatialReference: 3857
      },
      ui: {
        components: []
      }
    });

    view.watch('center', this._onCenterChange.bind(this));
  }

  _onCenterChange(center) {
    if (typeof this.props.onCenterChange === 'function') {
      this.props.onCenterChange(center.toJSON());
    }
  }

  render() {
    return (
      <div
        style={{ height: '100%', width: '100%' }}
        ref={mapViewDiv => {
          this.mapViewDiv = mapViewDiv;
        }}
      />
    );
  }
}
