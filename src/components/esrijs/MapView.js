import React, { Component } from 'react';
import { loadModules, loadCss } from 'esri-loader';

export default class ReactMapView extends Component {
  displayedZoomGraphic = null;

  zoomTo(zoomObj) {
    this.view.goTo(zoomObj);

    if (this.displayedZoomGraphic) {
      this.view.graphics.remove(this.displayedZoomGraphic);
    }

    this.displayedZoomGraphic = zoomObj.target;

    this.view.graphics.add(this.displayedZoomGraphic);
  }

  async componentDidMount() {
    loadCss('https://js.arcgis.com/4.9/esri/css/main.css');
    const [Map, MapView] = await loadModules(['esri/Map', 'esri/views/MapView']);

    this.map = new Map({
      basemap: 'dark-gray-vector'
    });

    this.view = new MapView({
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
        components: ['zoom']
      }
    });

    this.view.on('click', (e) => {
      this.props.onClick(e);
    });
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

  componentDidUpdate(prevProps) {
    const currentGraphic = (((this.props || false).zoomToGraphic || false).graphic || false);
    const previousGraphic = (((prevProps || false).zoomToGraphic || false).graphic || false);

    if (currentGraphic !== previousGraphic && currentGraphic !== false) {
      this.zoomTo({
        target: this.props.zoomToGraphic.graphic,
        zoom: this.props.zoomToGraphic.level
      });
    }
  }
}
