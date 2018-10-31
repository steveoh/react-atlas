import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { loadModules, loadCss } from 'esri-loader';
import { LayerSelectorContainer, LayerSelector } from '../../components/LayerSelector/LayerSelector';

export default class ReactMapView extends Component {
  displayedZoomGraphic = null;
  urls = {
    landownership: 'https://gis.trustlands.utah.gov/server/' +
      '/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/FeatureServer/0'
  };
  discoverKey = 'career-exhibit-panel-stadium';

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
    const mapRequires = [
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer'
    ];
    const selectorRequires = [
      'esri/layers/support/LOD',
      'esri/layers/support/TileInfo',
      'esri/layers/WebTileLayer',
      'esri/Basemap'
    ];

    const [Map, MapView, FeatureLayer, LOD, TileInfo, WebTileLayer, Basemap] = await loadModules(mapRequires.concat(selectorRequires));

    this.map = new Map({
      basemap: 'dark-gray-vector'
    });

    window.view = this.view = new MapView({
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

    const selectorNode = document.createElement('div');
    this.view.ui.add(selectorNode, 'top-right');

    const layerSelectorOptions = {
      view: this.view,
      quadWord: this.discoverKey,
      baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR'],
      overlays: ['Address Points', {
        Factory: FeatureLayer,
        url: this.urls.landownership,
        id: 'Land Ownership',
        opacity: 0.3
      }],
      modules: [LOD, TileInfo, WebTileLayer, Basemap]
    }

    ReactDOM.render(
      <LayerSelectorContainer>
        <LayerSelector {...layerSelectorOptions}></LayerSelector>
      </LayerSelectorContainer>,
      selectorNode);

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
