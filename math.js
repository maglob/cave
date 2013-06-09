Array.prototype.scale = function(scale, result) {
  if (typeof scale == 'number')
    scale = [scale]
  if (typeof(result) === 'undefined') {
    for (var r=[],i=0; i<this.length; i++) 
      r.push(this[i] * scale[i % scale.length])
    return r
  } else {
    for (i=0; i<this.length; i++) 
      result[i] *= scale[i % scale.length]
    return result
  }
}

Array.prototype.add = function(b, result) {
  if (typeof b == 'number')
    b = [b]
  if(typeof(result) === 'undefined') {
    for (var r=[],i=0; i<this.length; i++) 
      r.push(this[i] + b[i % b.length])
    return r
  } else {
    for (i=0; i<this.length; i++) 
      result[i] = this[i] + b[i % b.length]
    return result
  }
}

Array.prototype.sub = function(b, result) {
  if (typeof(b) === 'number')
    b = [b]
  return this.add(b.scale(-1), result)
}

Array.prototype.rotate = function(angle) {
  for (var r=[],i=0; i<this.length; i+=2) 
    r.push(this[i]*Math.cos(angle) - this[i+1]*Math.sin(angle),
	   (this[i]*Math.sin(angle) + this[i+1]*Math.cos(angle)))
  return r
}

Array.prototype.len = function() {
  return Math.sqrt(this[0]*this[0]+this[1]*this[1])
}

Array.prototype.unit = function() {
  return this.scale(1.0 / this.len())
}

Array.prototype.dot = function(b) {
  return this[0]*b[0] + this[1]*b[1];
}

Array.prototype.normal = function(b) {
  var r = b.sub(this)
  return [-r[1], r[0]].unit()
}

Array.prototype.midpointDisplacement = function() {
  if (this.length >= 4) {
    var r = []
    for(i=0; i<this.length; i+=2) {
      var a = this.slice(i, i+2)
      var b = i<this.length-2 ? this.slice(i+2, i+4) : this.slice(0, 2)
      r.push(a[0], a[1])
      var n = a.normal(b)   
      var mp = a.add(b).scale(0.5)
      var len = b.sub(a).len() * 0.2
      var t = mp.add(n.scale(len-Math.random()*len*2))
      r.push(t[0], t[1])
    }
    return r
  }
}

// Repeat next method in chain n times
//   Example: [1,2,3].repeatNext(5).add(1) --> [6,7,8]
Array.prototype.repeatNext = function(n) {
  var proxy = {}
  var _this = this
  for(var i in this) 
    if (typeof(this[i]) == 'function' && !this.hasOwnProperty(i)) 
      proxy[i] = function(fn) {
        return function() {
          var res = _this;
          for(j=0; j<n; j++) 
            res = this[fn].apply(res, arguments)
          return res          
        };
      }(i);
  return proxy
}

Array.prototype.max = function() {
  return Math.max.apply(this, this)
}

Array.prototype.min = function() {
  return Math.min.apply(this, this)
}

Array.prototype.odd = function() {
  return this.filter(function (v,k) {return k%2 == 1 })
}

Array.prototype.even = function() {
  return this.filter(function (v,k) {return k%2 == 0 })
}

function createRegularPolygon(n) {
  for(var r=[],i=0; i<n; i++) {
    var a = Math.PI * 2 / n * i;
    r.push(Math.cos(a), Math.sin(a))
  }
  return r
}

function createNormal(angle) {
  return [ Math.cos(Math.PI/180*angle), Math.sin(Math.PI/180*angle) ]
}

function Line(a, b) {
  this.a = a.slice()
  this.b = b.slice()
  this.v = b.sub(a)
  this.unit = this.v.unit()
  this.normal = a.normal(b)
  this.length = this.v.len()
  this.midpoint = a.add(this.v.scale(0.5))
}

Line.prototype.distance = function(point) {
  var x = this.unit.dot(point.sub(this.a))
  if (x>=0 && x<=this.length) {
    var p = this.a.add(this.unit.scale(x))
    return this.normal.dot(point.sub(p))
  }
}


function createLines(points) {
  var res = []
  for (var i=0; i<points.length-2; i+=2) {
    res.push(new Line(points.slice(i, i+2), 
                      points.slice(i+2, i+4)))
  }
  res.push(new Line(points.slice(points.length-2, points.length),
                    points.slice(0, 2)))
  return res
}