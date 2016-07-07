/** @const **/
var app = {};


/** @type {!angular.Module} **/
app.module = angular.module('app', ['ngeo']);

/**
 * @param {angular.$window} $window The Angular window service.
 * @return {angular.Directive} Directive Definition Object.
 * @ngInject
 */
app.filereadDirective = function($window) {
  if (!$window.FileReader) {
    throw new Error('Browser does not support FileReader');
  }
  return {
    restrict: 'A',
    scope: {
      'fileread': '=appFileread'
    },
    link:
        /**
         * @param {angular.Scope} scope Scope.
         * @param {angular.JQLite} element Element.
         * @param {angular.Attributes} attrs Attributes.
         */
        function(scope, element, attrs) {
          console.log("import file call");
          element.bind('change', function(changeEvent) {
            var fileReader = new FileReader();
            fileReader.onload = function(loadEvent) {
              scope.$apply(function() {
                scope.fileread = loadEvent.target.result;
              });
            };
            fileReader.readAsText(changeEvent.target.files[0]);
          });
        }
  };
};


app.module.directive('appFileread', app.filereadDirective);

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
        //source: new ol.source.OSM()

        source: new ol.source.TileWMS({
              url: 'http://demo.opengeo.org/geoserver/wms',
              params: {LAYERS: 'nasa:bluemarble', VERSION: '1.1.1'}
            })

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


  this.features = vector.getSource().getFeatures();
  this.vector_ = vector;

  /**
   * @type {string}
   * @export
   */
  this.fileread = '';

  $scope.$watch(angular.bind(this, function() {
    return this.fileread;
  }), angular.bind(this, this.importJSON_));



  this.interaction = new ngeo.interaction.Modify(
    /** @type {olx.interaction.ModifyOptions} */({
      features: this.vector_.getSource().getFeaturesCollection(),

      removeCondition: function(event) {
          console.log("deleteCondition call ");
          return ol.events.condition.altKeyOnly(event) &&
              ol.events.condition.singleClick(event);
      }

    }));

  var interaction = this.interaction;
  interaction.setActive(true);
  this.map.addInteraction(interaction);

};



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
  console.log(this.vector_.getSource().getFeaturesCollection());
  var json = this.geoJsonFormat_.writeFeatures(this.features);
  var blob = new Blob([json], {type: "application/json"});
  saveAs(blob, 'fileJSON.json');
};

/**
 * @param {string} jsonFile jsonFile document.
 * @private
 */
app.MainController.prototype.importJSON_ = function(jsonFile) {
  
  if (jsonFile.length > 0){
    console.log(jsonFile);
    var features = this.geoJsonFormat_.readFeatures(jsonFile);
    this.vector_.getSource().clear(true);
    this.vector_.getSource().addFeatures(features);
    alert("import finished");
    $("#importFile").val("");
  }else{
    console.log("select a file !!!");
  }

};


app.module.controller('MainController', app.MainController);

$(function() {
  $( "#controlPanel" ).draggable();
});