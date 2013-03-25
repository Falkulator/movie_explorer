var nodes = []
    ,group = 1;

function MainCtrl ($scope) {
    $scope.hist = [];
    $scope.name = "Con Air";
    $scope.cur = {"image": "/movie_explor/images/movie.ico"};
    $scope.query = function () {
      $('.alert').css("display", "none");
      $('.progress').css("visibility", "visible");
      $('.bar').css("width", "10%");
      if ($scope.actor) {
        queryActor($scope.name);
      }
      else {
        queryMovie($scope.name);
      }
      
      
      $scope.hist.unshift( {name: $scope.name, actor: $scope.actor} );
      $scope.name = '';
      $scope.actor = '';
    };
    
    $scope.goHist = function(name, actor) {
      $scope.name = name;
      $scope.actor = actor;
    }
    
}



var queryActor = function(actor) {

  var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';
  var query = [{
  "film": [{
    "film": {
      "name": null,
      "id": null,
      "starring": [{
        "actor": [{"name": null}]
      }],
    }
  }],
  "id": null,
  "name": actor,
  "type": "/film/actor"
  }];

  var qstring = JSON.stringify(query);
  req = new XMLHttpRequest();

  req.open("GET", 'https://www.googleapis.com/freebase/v1/mqlread?query=' + qstring, true);
  req.send();
  req.onreadystatechange = function() {

    if (req.readyState == 4 && req.status == 200) {
      var data = [];
      var response = JSON.parse(req.responseText);

      if (response.result[0] === undefined) {
        $('.alert').css("display", "inline-block");
        $('.progress').css("visibility", "hidden");
      }
      else {
        $('.bar').css("width", "30%");
        angular.element($('.controller')).scope().$apply(function(scope) {
            scope.cur.image = "https://usercontent.googleapis.com/freebase/v1/image/" + response.result[0].id;
            scope.cur.url = "http://www.freebase.com/view" + response.result[0].id;
            scope.cur.year = "";
        })
        $('.media').css("display", "inline");
    
        data.push({'name':response.result[0].name, 'type':'base'});
        console.log(response.result[0]);
        $.each(response.result[0].film, function(i, d) {
          var mnode = {};
          mnode['name'] = d.film.name;
          mnode['type'] = "movie";
          mnode['root'] = group;
          mnode['group'] = [group];
          
          data.push(mnode);
          $.each(d.film.starring, function(j, s) {
            //remove nodes that repeat the base
            if (s.actor[0].name === data[0].name) {
                
            }
            else {
              var anode = {};
              anode['name'] = s.actor[0].name;
              anode['type'] = "actor";
              anode['group'] = [group];
              data.push(anode);
            }
              
          })
          group += 1;
          
        });
        var dubs = {};
        $.each(data, function(x, d) {
           dubs[d.name+d.group+d.root] = d;

        })
        data = [];
        for (var key in dubs) {
            data.push(dubs[key]);
        }
        $('.bar').css("width", "55%");
        addNodes(data);
      }
    }
    else if (req.readyState == 4 && req.status != 200) {

    }

  }
}

var queryMovie = function(film) {
  var query = [{
    "name": film,
    "id":   null,
    "imdb_id": [],
    "starring": [{
      "actor": [{
        "name": null,
        "type": "/film/actor",
        "film": [{
          "film": {
            "imdb_id": [],
            "name":    null,
            "id":      null,
            "starring": [{
              "actor": [{
                "name": null
              }]
            }]
          }
        }]
      }]
    }],
    "type": "/film/film"
  }];

  var qstring = JSON.stringify(query);
  req = new XMLHttpRequest();

  req.open("GET", 'https://www.googleapis.com/freebase/v1/mqlread?query=' + qstring, true);
  req.send();
  req.onreadystatechange = function() {
    // add check for multiple movie results
    if (req.readyState == 4 && req.status == 200) {
      var data = [];
      var response = JSON.parse(req.responseText);

    if (response.result[0] === undefined) {
      $('.alert').css("display", "inline-block");
      $('.progress').css("visibility", "hidden");
    }
    else {
      console.log(response);
      console.log(response.result[0]);

      $('.bar').css("width", "30%");
      angular.element($('.controller')).scope().$apply(function(scope) {
          scope.cur.image = "https://usercontent.googleapis.com/freebase/v1/image/" + response.result[0].id;
          scope.cur.url = "http://www.freebase.com/view" + response.result[0].id;
      })
      $('.media').css("display", "inline");

      data.push({'name':response.result[0].name, 'type':'base'});

        $.each(response.result[0].starring, function(i, a) {
            var node = {};
            node['name'] = a.actor[0].name;
            node['type'] = "actor";
            node['root'] = group;
            node['group'] = [group];
            
            data.push(node);
              $.each(a.actor[0].film, function(j, f) {
                  //remove nodes that repeat the base
                  if (f.film.name === data[0].name) {
                      
                  }
                  else {

                      var node = {};
                      node['name'] = f.film.name;
                      node['type'] = "movie";
                      node['group'] = [group];
                      data.push(node);
                      
                  }

              })
           group += 1;
            

        });
        
        //removes duplicates from query
          var dubs = {};
        $.each(data, function(x, d) {
           dubs[d.name+d.group] = d;

        })
        data = [];
        for (var key in dubs) {
            data.push(dubs[key]);
        }

      $('.bar').css("width", "55%");
      addNodes(data);
    }
  }
  else if (req.readyState == 4 && req.status != 200){

    $('.alert').css("display", "inline-block");
    $('.progress').css("visibility", "hidden");

  }
}
}

var addNodes = function(objArr) {
    nodes = objArr;
    var data = buildLinks();

    startForce(data);

}

var buildLinks = function() {
    var links = []
        ,roots = []
        ,dubs = {}
        , dist = 130;

    $.each(nodes, function(i, n) {
        
        if (n.type === 'base') {

        
        }

        else {
          if (!dubs[n.name]) {
              dubs[n.name] = n;
          }
          else {
              dubs[n.name]['group'].push(n.group[0]);
          }
        }
    })
    nodes = [];

    for (var key in dubs) {
      nodes.push(dubs[key]);
    }
    

    $.each(nodes, function(i, n) {
      if (n.root)  {
        var root = {};
        root['group'] = n.group;
        root['index'] = i;
        roots.push(root);
      }
    })

	$('.bar').css("width", "65%");
    var rlength = roots.length
       ,nlength = nodes.length;
  
    for(var i = 0; i < nlength; i++) {
        
        var glength = nodes[i]['group'].length;
        if (glength > 1) {
            for (var k = 0; k < glength; k++)  {
                for (var j = 0; j < rlength; j++) {
                    if (nodes[i]['group'][k] === roots[j].group[0]) {
                        var link = {};
                        link['source'] = i;
                        link['target'] = roots[j].index;
                        link['dist'] = 300;
                        link['color'] = "red";
                        links.push(link);
                    }
                }
            }
        }
        else {
            for (var j = 0; j < rlength; j++) {
                if (nodes[i]['group'][0] === roots[j].group[0]) {
                    var link = {};
                    link['source'] = i;
                    link['target'] = roots[j].index;
                    link['dist'] = 100;
                    link['color'] = "#ccc";
                    links.push(link);
                }
            }
        }
    }

	$('.bar').css("width", "90%");
    var data = {'nodes':nodes, 'links':links};
    return data;
}

var startForce = function(data) {


    d3.selectAll('.node').data([]).exit().remove();
    d3.selectAll('.link').data([]).exit().remove();
    
    var force = d3.layout.force()
    .gravity(.08)
    .distance(function(d) {return d.dist;})
    .charge(-600)
    .size([width, height]);

     force
      .nodes(data.nodes)
      .links(data.links)
      .start();

    var link = svg.selectAll(".link")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke", function(d){ return d.color;});
      
    var node = svg.selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .attr("class", "node")
    .on("click", function(d, i) {
        angular.element($('.controller')).scope().$apply(function(scope) {
            scope.name = d.name;
            if (d.type === 'actor') {
                scope.actor = true;
            }
            else if (d.type === 'movie') {
                scope.actor = false;
            }
        }) 
    })
    .call(force.drag);
      

  node.append("image")
      .attr("xlink:href", function(d, i) {
          if (d.type === "movie") {
              return "/movie_explor/images/movie.ico"
          }
          else if (d.type === "actor") {
              return "/movie_explor/images/actor.ico"
          }
      })
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 16);

  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });
    
    force.start();
    
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

	//hides progress bar
	$('.progress').css("visibility", "hidden");
	$('.bar').css("width", "0%");
    //clears nodes for next force
    nodes = [];
}
