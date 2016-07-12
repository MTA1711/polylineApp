/** @const **/
var app = {};


/** @type {!angular.Module} **/
app.module = angular.module('app', ['ngeo']);

var featuresSelected ;


var DeleteFeatureActivate = 0;


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

  this.deleteElement = false;
  DeleteFeatureActivate = (this.deleteElement) ? 1 :  0;
  console.log("DeleteFeatureActivate = "+DeleteFeatureActivate);
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
      deleteCondition: function(event) {
          //console.log("deleteCondition call ");
          console.log("deleteCondition call --->");
          console.log(event);
          return ol.events.condition.altKeyOnly(event) &&
              ol.events.condition.singleClick(event);
      }

    }));

  /*var modify = new ol.interaction.Modify({
        features: features,
        deleteCondition: function(event) {
          console.log("deleteCondition call --->");
          console.log(event);
          return ol.events.condition.shiftKeyOnly(event) &&
              ol.events.condition.singleClick(event);
        }
      }); */
  /*this.features.on('singleclick', (function(evt) {
    console.log("interaction event callback");
    console.log(evt);
  }) );*/

  var interaction = this.interaction;
  interaction.setActive(true);
  this.map.addInteraction(interaction);

  /*var interactionSelect = new ol.interaction.Select({
  });
  this.map.addInteraction(interactionSelect);

  interactionSelect.on('select', function (event) {
     featuresSelected = event.target.getFeatures();
  });*/

  this.map.on('pointermove', function(e) {
    if (e.dragging) return;
    var pixel = this.getEventPixel(e.originalEvent);
    var hit = this.hasFeatureAtPixel(pixel);
    
    this.getTarget().style.cursor = hit ? 'pointer' : '';
  });



  this.map.on('singleclick', function(e) {
    if (DeleteFeatureActivate == 1){
      console.log (e.coordinate);
      console.log (e.pixel);

      var Coordinate = e.coordinate ;
      var Pixel = e.pixel ;

      if (this.hasFeatureAtPixel(Pixel)){
        console.log (" Features find");
        //console.log (vector);
        var Feature = vector.getSource().getClosestFeatureToCoordinate(Coordinate);
        var TypeFeature = Feature.getGeometry().getType();
        console.log ( TypeFeature ) ;

        if ( TypeFeature == "Point"){
          console.log (" remove point ");
          vector.getSource().removeFeature(Feature);
        }else if( TypeFeature == "LineString"){
          console.log (" remove point on LineString ");

          if (Feature.getGeometry().getLength() > 2 ){
            //var PointInLine = Feature.getGeometry().getClosestPoint(Coordinate);
            //console.log (PointInLine);
            var PrevCoordinates = Feature.getGeometry().getCoordinates();
            console.log (PrevCoordinates);

            var PointInLine = getClosestPoint(Coordinate, PrevCoordinates);
            //console.log (PointInLine);

            var NewCoordinates = [];
            var j = 0;
            for (i in PrevCoordinates){
               if (PrevCoordinates[i][0] == PointInLine[0] && PrevCoordinates[i][1] == PointInLine[1]){
                 console.log("continue");
                 continue;
               }else{
                 console.log("no continue");
                 NewCoordinates[j++] = PrevCoordinates[i];
               }
            }
            console.log(NewCoordinates);
            Feature.getGeometry().setCoordinates(NewCoordinates);
          }else{
            vector.getSource().removeFeature(Feature);
          }
          
        }
      }else{
        console.log (" No features ");
      }
    }else{
      console.log("delete element desactivated");
    }

  });
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
  console.log(json);
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


app.MainController.prototype.removeSelectedFeatures = function (){
  //this.vector_.getSource().getFeaturesCollection().removeAt(0);
  this.vector_.getSource().getFeaturesCollection().clear();

  /* if ( typeof featuresSelected != 'undefined' ){
    //console.log(featuresSelected);
    //console.log(featuresSelected.getLength());
    for (x in featuresSelected.getArray()){
      a = featuresSelected.getArray()[x] ;
      console.log (a.getId());
      console.log(this.vector_.getSource().getFeaturesCollection());
      this.vector_.getSource().getFeaturesCollection().remove(a);
    }*
   }*/
}

app.module.controller('MainController', app.MainController);

$(function() {
  $( "#controlPanel" ).draggable();
});


function DeletePointOnMap(MyMap, Pixel){
  if (MyMap.hasFeatureAtPixel(pixel)){

  }else{
    console.log (pixel + " No features ");
  }
}


function DistanceBetweenPoints(  a ,  b){
  return  Math.sqrt ( ( a[0] - b[0] ) * ( a[0] - b[0] ) + ( a[1] - b[1] )*( a[1] - b[1] ) ) ;
}

function getClosestPoint( Point, ArrayOfPoint){
  var PositionOfClosestPoint = 0;
  var MinimunDistance = Number.MAX_SAFE_INTEGER ;
  for (i in ArrayOfPoint){
     var d = DistanceBetweenPoints ( Point, ArrayOfPoint[i]) ;
     if (d < MinimunDistance) {
       MinimunDistance = d ;
       PositionOfClosestPoint = i ;
     }
  }
  console.log(MinimunDistance);
  return ArrayOfPoint[PositionOfClosestPoint];
}

/*function deleteActivited(){
  if (DeleteFeatureActivate == 0){
     DeleteFeatureActivate = 1;
  }else
}*/