var http = require('http');
var fs = require('fs');
var url = require("url");
var path = require("path");

var d3 = require('d3-dsv');




http.get({
    host: 'earthquake.usgs.gov',
    path: '/earthquakes/feed/v1.0/summary/all_week.csv'
}).on('response', function(response)
{
    if(response.statusCode == 200){
        var body = '';

        response.on('data', function(chunk) {
             body += chunk;
        }).on('end', function() {
            
            var records = d3.csvParse(body)
            
            // remove columns objects
            records.pop(); 
            records = records.map( function(r){
                r.country = r.place.split(',').pop().trim();
                return r;
            }).sort(function(a,b){
                return a.country > b.country ? 1 :
                       a.country < b.country ? -1 : 0;      
            });

            // console.log(records)     
            var countries = [];

            records.forEach(function(r)
            {
                var last = countries[countries.length - 1] || {};

                if(last.country !== r.country)
                    countries.push({
                        country: r.country,
                        points: [r]
                    })
                else 
                    last.points.push(r);
            }); 

            console.log(JSON.stringify(countries))           
        });

    }
}).end()