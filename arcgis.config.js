const path = require('path');

module.exports = {
  outputPath: path.join(process.cwd(), 'public'),
  dojoModules: ['esri/Map',
  'esri/views/MapView',
  'esri/Graphic',
  'esri/geometry/Point',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol'
]};
