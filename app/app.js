/** @const **/
var app = {};


/** @type {!angular.Module} **/
app.module = angular.module('app', ['ngeo']);


/**
 * @param {!angular.Scope} $scope Angular scope.
 * @param {ol.Collection.<ol.Feature>} ngeoFeatures Collection of features.
 * @param {ngeo.ToolActivateMgr} ngeoToolActivateMgr Ngeo ToolActivate manager
 *     service.
 * @constructor
 */
app.MainController = function($scope, $document, ngeoFeatures, ngeoToolActivateMgr) {
  
  /**
   * @private
   * @type {Document}
   */
  this.$document_ = $document;

  /**
   * @private
   * @type {ol.format.KML}
   */
  this.kmlFormat_ = new ol.format.KML();

  /**
   * @private
   * @type {ol.format.GeoJSON}
   */
  this.geoJsonFormat_ = new ol.format.GeoJSON();

  /**
   * @type {!angular.Scope}
   * @private
   */

  this.features = null;
  console.log("test");


  this.scope_ = $scope;

  var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
      wrapX: false,
      features: ngeoFeatures
    })
  });

  /**
   * @type {ol.Map}
   * @export
   */
  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      vector
    ],
    view: new ol.View({
      center: [0, 0],
      zoom: 3
    })
  });

  /**
   * @type {boolean}
   * @export
   */
  this.drawActive = false;

  var drawToolActivate = new ngeo.ToolActivate(this, 'drawActive');
  ngeoToolActivateMgr.registerTool('mapTools', drawToolActivate, false);

  /**
   * @type {boolean}
   * @export
   */
  this.dummyActive = true;

  var dummyToolActivate = new ngeo.ToolActivate(this, 'dummyActive');
  ngeoToolActivateMgr.registerTool('mapTools', dummyToolActivate, true);

  console.log(vector.getSource());
  this.features = vector.getSource().getFeatures();

};

app.module.constant('ngeoExportFeatureFormats', [
    ngeo.FeatureHelper.FormatType.KML,
    ngeo.FeatureHelper.FormatType.GPX
]);

/**
 * @export
 */
app.MainController.prototype.exportAsKml = function() {
  
  var kml = this.kmlFormat_.writeFeatures(this.features);

  var charset = this.$document_.characterSet || 'UTF-8';
  var type = 'application/vnd.google-earth.kml+xml;charset=' + charset;
  var blob = new Blob([kml], {type: type});

  saveAs(blob, 'file.kml');
};

app.MainController.prototype.exportAsJson = function() { 
  var json = this.geoJsonFormat_.writeFeatures(this.features);
  var blob = new Blob([json], {type: "application/json"});
  saveAs(blob, 'fileJSON.json');
};

app.module.controller('MainController', app.MainController);
