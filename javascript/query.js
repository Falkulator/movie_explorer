

MOVIEXP.Query = function () {
  this.group = 1;
  this.nodes = [];
  this.progress = new MOVIEXP.Progress();
}


MOVIEXP.Query.prototype.query = function (qstring, type, callback) {
  var that = this;
	req = new XMLHttpRequest();
  this.progress.start();
  req.open("GET", 'https://www.googleapis.com/freebase/v1/mqlread?query=' + qstring, true);
  req.send();
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200) {

        var response = JSON.parse(req.responseText);
        if (response.result[0] === undefined) {
          that.progress.error();
        } else {
          that.nodes.push({'name':response.result[0].name, 'type':'base'});
          console.log(response.result[0]);
          that.resParser(response, type);
          that.progress.hide();
          that.display(response.result[0].id);
          callback(that.nodes);
        }
    }
    
  }

  
}
        

MOVIEXP.Query.prototype.resParser = function (response, type) {
  var group = 1;
  var that = this;

  if (type === "actor") {
    $.each( response.result[0].film, function (i, d) {
      that.addNode( d.film.name, "movie", true, group);
      $.each( d.film.starring, function (j, s) {
       //remove nodes that repeat the base
        if (s.actor[0].name === that.nodes[0].name) {

        } else {
          that.addNode( s.actor[0].name, "actor", false, group);
        }
      });
    group += 1;
    });

  } else {
    $.each( response.result[0].starring, function (i, a) {
     that.addNode( a.actor[0].name, "actor", true, group);
     $.each( a.actor[0].film, function (j, f) {
       //remove nodes that repeat the base
        if (f.film.name === that.nodes[0].name) {
            
        } else {
          that.addNode( f.film.name, "movie", false, group);
       }
     });
    group += 1;
    });
  }

  this.removeDupes();
}


/**
 * Adds individual node object to the data array
 * @param {String} name 
 * @param {String} type
 * @param {Bool} root
 * @param {Int} group
 */
MOVIEXP.Query.prototype.addNode = function (name, type, root, group) {
	var node = {}
	if (root) {
		node['root'] = group;
	}
	node['name'] = name;
	node['type'] = type;
	node['group'] = [group];

  this.nodes.push(node);
}

/**
 * Removes duplicate entries in the nodes array
 */
MOVIEXP.Query.prototype.removeDupes = function () {
	var dubs = {};
    $.each(this.nodes, function(x, d) {
       dubs[d.name+d.group] = d;

    })
    this.nodes = [];
    for (var key in dubs) {
        this.nodes.push(dubs[key]);
    }
}

/**
 *Generates image and link for search
 *@param {Int} id
 */
MOVIEXP.Query.prototype.display = function (id) {
  angular.element($('.controller')).scope().$apply(function(scope) {
      scope.cur.image = "https://usercontent.googleapis.com/freebase/v1/image/" + id;
      scope.cur.url = "http://www.freebase.com/view" + id;
      scope.cur.year = "";
  })
  $('.media').css("display", "inline");
}



