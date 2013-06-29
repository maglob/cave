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

Array.prototype.div = function(divisor, result) {
  return this.scale(1.0/divisor, result)
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
  var cosa = Math.cos(angle)
  var sina = Math.sin(angle)
  for (var r=[],i=0; i<this.length; i+=2) 
    r.push(this[i]*cosa - this[i+1]*sina,
	   this[i]*sina + this[i+1]*cosa)
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
    for(var r=[],i=0; i<this.length/2; i++) {
      var a = this.point(i)
      var b = this.point((i+1) % (this.length/2))
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

Array.prototype.point = function(/* index0, index1, ... indexN */) {
  for(var r=[],i=0; i<arguments.length; i++) {
    var p = arguments[i]
    r.push(this[p*2], this[p*2+1])
  }
  return r
}

Array.prototype.clone = function() {
  return this.slice()
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
  this.a = a.clone()
  this.b = b.clone()
  this.v = b.sub(a)
  this.unit = this.v.unit()
  this.normal = a.normal(b)
  this.length = this.v.len()
  this.midpoint = a.add(this.v.scale(0.5))
}

Line.prototype.distance = function(point) {
  var x = this.unit.dot(point.sub(this.a))
  var p = this.a.add(this.unit.scale(x))
  return this.normal.dot(point.sub(p)) 
}

Line.prototype.intersects = function(pa, pb) {
  if (this.distance(pa) * this.distance(pb) < 0) {
    var xa = this.unit.dot(pa.sub(this.a))
    var xb = this.unit.dot(pb.sub(this.a))
    var x1 = Math.min(xa, xb)
    var x2 = Math.max(xa, xb)
    return x1<this.length && x2>=0
  } else
    return false
}

Line.prototype.toString = function() {
  return "{"+ this.a + ", "+ this.b +", "+ this.v +", "+ this.unit + ", "+ this.length +", "+ this.midpoint +"}"
}

function createLines(points) {
  for (var r=[],i=0; i<points.length/2-1; i++) 
    r.push(new Line(points.point(i), points.point(i+1)))
  r.push(new Line(points.point(points.length/2-1), points.point(0)))
  return r
}

function insideRect(p, minCorner, maxCorner) {
  return p[0]>=minCorner[0] && p[0]<maxCorner[0] && p[1]>=minCorner[1] && p[1]<maxCorner[1]
}