function Settings (chartType){

	this.chartType = chartType;
}



/************************************************************
 * DIMENSIONS
 *
 * **/
Settings.prototype.getDimensions = function( root, iWidth, iHeight ){

		var rootWidth  = $(root).width() - 10;
		var rootHeight = $(root).height();

		switch( this.chartType ){
			case "timeline": return getTimelineDimensions( root, iWidth, rootWidth, rootHeight); break;
			case "barchart": return getBarchartDimensions( root, iWidth, rootWidth, rootHeight); break;
            case "geochart": return getGeochartDimensions(root, rootWidth, rootHeight); break;   /*  TO DO   */
            case "urank": return getUrankDimensions(root, rootWidth, rootHeight); break;   /*  TO DO   */
            case "landscape": return getLandscapeDimensions(root, iWidth, rootWidth, rootHeight); break; 
		}
		
	};
	
	
/************************************************************
 * DIMENSIONS processing
 *
 * **/


function getTimelineDimensions( root, iWidth, rootWidth, rootHeight ){

    var focusMargin = {top: 0, bottom: 100, left: 50, right: 10 };
	var focusHeight = rootHeight - focusMargin.top - focusMargin.bottom;
	var cTop = focusHeight + focusMargin.top + 30;
	var contextMargin	= {top: cTop, bottom: 20, left: 50, right: 10 };
	var cHeight = rootHeight - contextMargin.top - contextMargin.bottom;
	var contextHeight	= cHeight > 0 ? cHeight : 40;

	var width = rootWidth - focusMargin.left - 70 - 20; // 70 = Legend width; 20 = margin right
	var centerOffset = (iWidth/2) - ((width + focusMargin.left + focusMargin.right)/2);
	var verticalOffset = (rootHeight < 500) ? 20 : ($(root).height() - 500) / 2;
		
	return { 'focusMargin': focusMargin, 'focusHeight': focusHeight, 'contextMargin': contextMargin, 'contextHeight': contextHeight, 'width': width,
            'centerOffset': centerOffset, 'verticalOffset': verticalOffset };
}
	
	
function getBarchartDimensions( root, iWidth, rootWidth, rootHeight ){
		
	var margin = { top: 10, bottom: 50, left: 40, right: 0 };
	var height = rootHeight - margin.top - margin.bottom;
	var width = rootWidth - margin.left ;
	var centerOffset = (iWidth/2) - ((width + margin.left + margin.right)/2);
	var verticalOffset = (rootHeight < 500) ? 20 : ($(root).height() - 500) / 2;
	var delay = 400;
		
	return { 'margin': margin, 'height': height, 'width': width, 'centerOffset': centerOffset, 'verticalOffset': verticalOffset, 'delay': delay };
}



function getGeochartDimensions(root, rootWidth, rootHeight){
    return {'width': rootWidth, 'height': rootHeight };
}

function getUrankDimensions(root, rootWidth, rootHeight){
	var rootHeight = $(root).height();
    return {'rootHeight': rootHeight,'width': rootWidth, 'height': rootHeight };
}

function getLandscapeDimensions(root, iWidth, rootWidth, rootHeight){

	var rootHeight = $(root).height();
	var legendWidth = 50; 

	var margin = { top: 30, bottom: 5, left: 80, right: 20 };
	var height = rootHeight - margin.top - margin.bottom;
	var width = rootWidth - margin.left - 140;
    var centerOffset = (iWidth/2) - ((width + margin.left + margin.right)/2);
	var verticalOffset = (rootHeight < 500) ? 20 : ($(root).height() - 500) / 2;
	var tagCloudWidth = (rootWidth-legendWidth) * 0.3 - 10;  
	var landscapesWidth = rootWidth - legendWidth - tagCloudWidth -  margin.right -10;  
	var landscapesHeight = rootHeight - margin.top  - margin.bottom; 
	var tagCloudheight = rootHeight - margin.top - margin.bottom; 
	return {
			'centerOffset': centerOffset, 'verticalOffset': verticalOffset, 
			"width":width,
			"height":height,		
			"landscape" : {'width': landscapesWidth, 'height': landscapesHeight }, 
			"tagCloud" : {'width': tagCloudWidth, 'height': tagCloudheight}};
}








/************************************************************
 * INITDATA
 *
 * **/
Settings.prototype.getInitData = function( data, mappings, arg ){
    var preprocessedData = fixMissingAndMalformattedValues( data );

	switch( this.chartType ){
        case "timeline" : return getTimelineInitData(preprocessedData, mappings); break;
		case "barchart" : return getBarchartInitData(preprocessedData, mappings, arg); break;
        case "geochart" : return getGeochartInitData(preprocessedData, mappings); break;   /*TO DO*/
        case "urank" : return getUrankInitData(preprocessedData, mappings); break;   /*TO DO*/
        case "landscape" : return getLandscapeInitData(preprocessedData, mappings); break;   /*TO DO*/
	}
};


/************************************************************
 * INITDATA processing
 *
 * **/

function fixMissingAndMalformattedValues( data ){
    var dataArray = [];
    data.forEach(function(d, i){
        var obj = {};
        obj['id'] = d.id;
        obj['title'] = d.title;
        obj['uri'] = d.uri;
        obj['facets'] = new Array();
        obj['facets']['language'] = d.facets.language || 'en';
        obj['facets']['provider'] = d.facets.provider;
        
        var year = d.facets["year"];
        var check = year.split(/[^\d]/).filter(function(n){if((n >=-9999)&& (n <= 9999))return n;});
        if(check.length === 0 ){
           !('unkown'.localeCompare(year)) ? year = new Date().getFullYear().toString()
                       : year = year.slice(0, 4);
        } else {
           year = check[0].toString();
        }
        obj['facets']['year'] = parseDate(year);
        obj['facets']['country'] = d.facets.country || "";
        obj['facets']['keywords'] = d.facets.keywords || [];
        obj['coordinate'] = d.coordinate || null;
        dataArray.push(obj);
    });
    
    return dataArray;
}




function getTimelineInitData( processedData, initMapping ){

    var mapping = [];

    initMapping.forEach(function(m){
        mapping[m.visualattribute] = m.facet;
    });

    var xAxisChannel = mapping['x-axis'];
    var yAxisChannel = mapping['y-axis'];
    var colorChannel = mapping['color'];
    var data = [];

    processedData.forEach(function(d) {

        var obj = {
            id : d.id,
            title : d.title,
            uri : d.uri,
            language : d.facets.language,
            year : d.facets.year,
            provider : d.facets.provider,
            country : d.facets.country,
            keywords : d.facets.keywords,
            isHighlighted : d.isHighlighted
        };
        data.push(obj);
    });

    var keywords = [];

    data.forEach(function(d){
        d.keywords.forEach(function(k){
            if(keywords.indexOf(k) == -1)
                keywords.push(k);
        });
    });

    return {'data': data, 'xAxisChannel': xAxisChannel, 'yAxisChannel': yAxisChannel, 'colorChannel': colorChannel,
            'keywords': keywords};
}




function getBarchartInitData( processedData, mappings, yearRange ){

	var xAxis, yAxis, color;

	var i = 0;
	while(i < mappings.length && mappings[i]['visualattribute'] != 'x-axis')
		i++;
		
	// Visual channels
	xAxis = mappings[i]['facet'];
	color = xAxis;
	yAxis = 'count';
		
	// domain and counter are parallel arrays
	var domain = d3.set( processedData.map(function(d){ return d.facets[xAxis]; }) ).values();
	var counter = Array();
	domain.forEach(function(d, i){
        counter.push( parseInt(0) );
	});
		
	processedData.forEach(function(d){
		var index = domain.indexOf( d.facets[xAxis] );
		counter[index]++;
	});
		
	var array = [];
		
	domain.forEach(function(d, i){
		var obj = {};
		obj[xAxis] = d;
		obj['count'] = counter[i];
		obj['selected'] = false;
		array.push( obj );
	});
		
	// INITDATA
	return {'data': array, 'recomList': processedData, 'xAxisChannel': xAxis, 'yAxisChannel': yAxis, 'colorChannel': color};
}
	


function getGeochartInitData(processedData, mappings){
    return { 'data': processedData };
}

function getUrankInitData(processedData, mappings){
    return { 'data': processedData };
}

function getLandscapeInitData(processedData, initMapping){
	
    var mapping = [];

    initMapping.forEach(function(m){
        mapping[m.visualattribute] = m.facet;
    });

    var colorChannel = mapping['color'];
    var data = [];

    processedData.forEach(function(d) {

        var obj = {
            id : d.id,
            title : d.title,
            uri : d.uri,
            language : d.facets.language,
            year : d.facets.year,
            provider : d.facets.provider,
            country : d.facets.country,
            keywords : d.facets.keywords,
            isHighlighted : d.isHighlighted
        };
        data.push(obj);
    });

    var keywords = [];

    data.forEach(function(d){
        d.keywords.forEach(function(k){
            if(keywords.indexOf(k) == -1)
                keywords.push(k);
        });
    });

    return {'data': processedData, 'colorChannel': colorChannel,
            'keywords': keywords};
    // return { 'data': processedData };
}

