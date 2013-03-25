
MOVIEXP.Link = function () {
	this.links = [];
}

MOVIEXP.Link.prototype.build = function (nodes) {
	var dubs = {},
		roots = [],
        nlength = nodes.length;
	for (var i = 0; i < nlength; i ++) {
		var n = nodes[i];
		if (n.type === 'base') {
        
        } else {
            if (!dubs[n.name]) {
                dubs[n.name] = n;
            } else {
                dubs[n.name]['group'].push(n.group[0]);

            }
        }

	}
	nodes = [];

    for (var key in dubs) {
      nodes.push(dubs[key]);
    }

    nlength = nodes.length;
    for (var i = 0; i < nlength; i++) {
    	var n = nodes[i];
    	if (n.root)  {
	        var root = {};
	        root['group'] = n.group;
	        root['index'] = i;
	        roots.push(root);
      	}
    }

    var rlength = roots.length;

    for (var i = 0; i < nlength; i++) {
        
        var glength = nodes[i]['group'].length;
        if (glength > 1 && nodes[i]['root'] === undefined) {


            for (var k = 0; k < glength; k++)  {
                for (var j = 0; j < rlength; j++) {
                    if (nodes[i]['group'][k] === roots[j].group[0]) {
                        this.addLink(i, roots[j].index, "red", 300);
                    }
                }
            }
        } else {
            for (var j = 0; j < rlength; j++) {
                if (nodes[i]['group'][0] === roots[j].group[0]) {
                    this.addLink(i, roots[j].index, "#ccc", 100);
                }
            }
        }
    }

    var data = {'nodes':nodes, 'links':this.links};
    return data;
}

MOVIEXP.Link.prototype.addLink = function (source, dest, color, dist) {
    var link = {};
    link['source'] = source;
    link['target'] = dest;
    link['dist'] = dist;
    link['color'] = color;
    this.links.push(link);
}