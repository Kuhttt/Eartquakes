
var http = require('http');
var fs = require('fs');
var url = require("url");
var path = require("path");
var csv2geojson = require('csv2geojson');
var index;

http.createServer(function (req, res) {

	var ar=req.url.split('/');
	var name=ar.slice(2, ar.length).join("\\");
	switch (ar[1]){

		case 'static': file(req, res, name);
	break;

        case '': file(req,res,'map.html');
    break;

        case 'earthquake': earthquake(req,res);
    break;
}
}).listen(8080);

function file(req, res, name){
	var uri = url.parse(req.url).pathname
	, filename=path.join(process.cwd(), name);
	console.log(filename);

    fs.stat(filename, function (err, stat) {
     	
    if(err) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;
    }

     fs.readFile(filename, "binary", function(err, file) {

      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
      }
  	  res.writeHead(200);
      res.end(file);
    });
 });

}

function earthquake(req,res){
	var options = {
	  host: 'earthquake.usgs.gov',
	  path: '/earthquakes/feed/v1.0/summary/all_week.csv',
	  method: 'GET'
	};

    var req=http.get(options).on('response', function (response) {
	response.setEncoding('utf8');
	switch(response.statusCode){
		case 500:{
		res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        return;
		}
		break;

		case 404: {
	  res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      return;}
      break;

      case 200:{
	    var body = '';
	    response.on('data', function (chunk) {
		        body += chunk;
		    });

	    response.on('end', function () {
	        csv2geojson.csv2geojson(body.toString(), {
		    latfield: 'latitude',
		    lonfield: 'longitude',
		    delimiter: ','
		}, function(err, data) {
		  	  res.writeHead(200);
		      res.end(JSON.stringify(data));
	    });
		});
		}
		break;
};


	});


req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});
};


console.log('Server running on port 8080.');