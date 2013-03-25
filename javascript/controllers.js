var MOVIEXP = MOVIEXP || {};
MOVIEXP.nodes = [];

function MainCtrl ($scope) {
    $scope.hist = [];
    $scope.name = "Con Air";
    $scope.cur = {"image": "/movie_explor/images/movie.ico"};
    $scope.query = function () {
      $('.alert').css("display", "none");
      $('.progress').css("visibility", "visible");
      $('.bar').css("width", "10%");
      if ($scope.actor) {
        MOVIEXP.queryActor($scope.name);
      }
      else {
        MOVIEXP.queryMovie($scope.name);
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



MOVIEXP.queryActor = function(actor) {

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

  var qstring = JSON.stringify(query),
      that = this,
      q = new MOVIEXP.Query();
      
  q.query(qstring, "actor", function (nodes) {
    that.buildLinks(nodes)
  });

}

MOVIEXP.queryMovie = function(film) {
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

  var qstring = JSON.stringify(query),
      that = this,
      q = new MOVIEXP.Query();

  q.query(qstring, "movie", function (nodes) {
    that.buildLinks(nodes)
  });

  
}

MOVIEXP.buildLinks = function (nodes) {
  
  var l = new MOVIEXP.Link();
  var data = l.build(nodes);
  startForce(data);
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

}
