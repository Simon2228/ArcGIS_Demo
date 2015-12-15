/*
var map;
require(["esri/map", "esri/urlUtils", "esri/dijit/Directions", "dojo/parser", 
	"dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dojo/domReady!"],
        function(Map, urlUtils, Directions, parser) {
        	parser.parse();
        	
	       	urlUtils.addProxyRule({
	          urlPrefix: "route.arcgis.com",
	          proxyUrl: "/proxy/"
	        });
	        urlUtils.addProxyRule({
	          urlPrefix: "traffic.arcgis.com",
	          proxyUrl: "/proxy/"
	        });

			map = new Map("map", {
    			basemap: "topo",
        		center: [32.871013, -117.217737], // hardcoded my current location
       	 		zoom: 10
       	 	});

			//used logistics service hosted from ArcGIS online
       	 	var directions = new Directions({
          		map: map,
          		travelModesServiceUrl: "http://utility.arcgis.com/usrsvcs/servers/cdc3efd03ddd4721b99adce219629489/rest/services/World/Utilities/GPServer"
          	}, "dir");

        	directions.startup();
}); */

var map, serviceAreaTask, params, clickpoint;

require([
    "esri/map", "esri/config", 
    "esri/tasks/ServiceAreaTask", "esri/tasks/ServiceAreaParameters", "esri/tasks/FeatureSet",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
    "esri/geometry/Point", "esri/graphic",
    "dojo/parser", "dojo/dom", "dijit/registry", 
    "esri/Color", "dojo/_base/array",
    "dijit/layout/BorderContainer", "dijit/layout/ContentPane", 
    "dijit/form/HorizontalRule", "dijit/form/HorizontalRuleLabels", "dijit/form/HorizontalSlider",
    "dojo/domReady!"
	], function(
      Map, esriConfig, 
      ServiceAreaTask, ServiceAreaParameters, FeatureSet, 
      SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
      Point, Graphic,
      parser, dom, registry,
      Color, arrayUtils
    ) {
      
    	parser.parse();


     	//esriConfig.defaults.io.proxyUrl = "/proxy/";
      
      	map = new Map("map", { 
        	basemap: "streets",
        	center: [-117.217737, 32.871013],  //hardcode my current location
        	zoom: 14
      	});

      	map.on("click", mapClickHandler);

      	params = new ServiceAreaParameters();
      	params.defaultBreaks= [1];
      	params.outSpatialReference = map.spatialReference;
      	params.returnFacilities = false;
      
      	serviceAreaTask = new ServiceAreaTask("http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Service Area");
            
      	registry.byId("hslider").on("change", updateHorizontalLabel);
      	updateHorizontalLabel();

      	//Create function that updates horizontal label
      	function updateHorizontalLabel() {
        	// Get access to nodes/widgets we need to get/set values
        	var hSlider = registry.byId("hslider");
        	var label = dom.byId("decValue");
        	// Update label
        	label.innerHTML = hSlider.get("value");
        	params.defaultBreaks = [ hSlider.value / 60 ];
        	if (clickpoint) {
          		mapClickHandler(clickpoint);
        	}
      	}
      
      	function mapClickHandler(evt) {
        	clickpoint = evt;
        	map.graphics.clear(); //clear existing graphics
        	//define the symbology used to display the results and input point
        	var pointSymbol = new SimpleMarkerSymbol(
          		"diamond",
          		20,
          		new SimpleLineSymbol(
           	 		"solid",
            		new Color([88,116,152]), 2
          		),
          		new Color([88,116,152,0.45])
        	);

        	var inPoint = new Point(evt.mapPoint.x, evt.mapPoint.y, map.spatialReference);
        	var location = new Graphic(inPoint, pointSymbol);

        	map.graphics.add(location);
	        var features = [];
	        features.push(location);
	        var facilities = new FeatureSet();
	        facilities.features = features;
	        params.facilities = facilities;

	        //solve 
	        serviceAreaTask.solve(params,function(solveResult){
	          var polygonSymbol = new SimpleFillSymbol(
	            "solid",  
	            new SimpleLineSymbol("solid", new Color([232,104,80]), 2),
	            new Color([232,104,80,0.25])
	          );
	          arrayUtils.forEach(solveResult.serviceAreaPolygons, function(serviceArea){
	            serviceArea.setSymbol(polygonSymbol);
	            map.graphics.add(serviceArea);
	          });
	          
	        }, function(err){
	          console.log(err.message);
	        });
      	}
});