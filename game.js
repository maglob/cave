
var frame = 0
var ship = {
  pos: [0, 0], 
  v: [0, 0],
  a: Math.PI/2,  
  controls: {}
}
var gravity = [0, -0.02]
var bullets = []
var asteroids = []
var sparks = []
var shipPoints = [20,0, -15,-12, -8,-3, -8,4, -15,12]
var cavePoints = createRegularPolygon(6).scale([1000, 500]).rotate(Math.PI/16).repeatNext(3).midpointDisplacement()
var caveLines = createLines(cavePoints)
var asteroidPoints = createRegularPolygon(6).scale(40).midpointDisplacement()
var asteroidLines = createLines(asteroidPoints)
var starPoints = [-100, 100, 0, 0, 200, 200]
var isPause = false
var grid = new Grid([cavePoints.even().min(), cavePoints.odd().min()], 
                    [cavePoints.even().max(), cavePoints.odd().max()],
                    64,
                    function (p, size) {
                      return caveLines.filter(function(line) { 
                        return line.midpoint.sub(p.add(size/2)).len() < line.length/2 + size/2*Math.SQRT2
                      })
                    })

window.onclick = function(e) {
  var x = e.clientX - view.clientWidth/2 + ship.pos[0]
  var y = -1*(e.clientY - view.clientHeight/2) + ship.pos[1]
}

window.onkeydown = window.onkeyup = function (e) {
  var isDown = e.type == "keydown"
  switch(e.keyCode) {
  case 65: ship.controls.left = isDown; break;
  case 68: ship.controls.right = isDown; break;
  case 16: ship.controls.thrust = isDown; break; // Shift
  case 32: ship.controls.shield = isDown; break;
  case 13: ship.controls.fire = isDown; break; // Enter
  case 80: isDown && (isPause = !isPause); break;
  }
}

function set(elementIdDotAttribute, value) {
  var a = elementIdDotAttribute.split('.')
  return document.getElementById(a[0]).setAttribute(a[1], value)
}

function Grid(minCorner, maxCorner, cellSize, fnInitCell) {
  this.cells = []
  this.cellSize = cellSize
  this.minCorner = minCorner.sub(cellSize)
  this.maxCorner = maxCorner.add(cellSize)
  this.cellsPerRow = Math.ceil((this.maxCorner[0]-this.minCorner[0]) / cellSize)
  this.fnInitCell = fnInitCell ? fnInitCell : function() { return [] }
}

Grid.prototype.toGridCoord = function (p) {
  return p.sub(this.minCorner).div(this.cellSize).map(Math.floor)
}

Grid.prototype.getCellId = function (p) {
  return this.toGridCoord(p).dot([1, this.cellsPerRow])
}

Grid.prototype.getCell = function (p) {
  if (insideRect(p, this.minCorner, this.maxCorner)) {
    var id = this.getCellId(p)
    var r = this.cells[id]
    if (!r) 
      r = this.cells[id] = this.fnInitCell(this.toGridCoord(p).scale(this.cellSize).add(this.minCorner), this.cellSize)
    return r
  } else
    return []
}

function createSvgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name)
}

function Bullet(pos, v) {
  this.pos = pos.clone()
  this.v = v.clone()
  this.dom = spritesDom.appendChild(createSvgElement("rect"))
  this.dom.setAttribute("width", 2)
  this.dom.setAttribute("height", 2)
  this.dom.setAttribute("stroke", "white")
}

function Asteroid(pos, v, a, av) {
  this.pos = pos.clone()
  this.v = v.clone()
  this.a = a
  this.av = av
  this.dom = spritesDom.appendChild(createSvgElement("polygon"))
  this.dom.setAttribute("points", asteroidPoints)
  this.dom.setAttribute("stroke", "lightgray")
  this.dom.setAttribute("fill", "gray")
}

function Spark(pos, v, ttl) {
  this.pos = pos.clone()
  this.v = v.clone()
  this.ttl = ttl
  this.dom = spritesDom.appendChild(createSvgElement("circle"))
  this.dom.setAttribute("r", 2)
  this.dom.setAttribute("fill", "white")
}

function init() {
  spritesDom = document.getElementById("sprites")
  set('ship.points', shipPoints)
  set('cave.points', cavePoints)
  set('shield.r', 26)
  set('msg.x', 10)
  set('msg.y', view.clientHeight-4)
  for(var i=0; i<8; i++)
    asteroids.push(new Asteroid(ship.pos.add([-800+i*200,200]), 
                                createUnit(Math.random()*Math.PI*2).scale(2+Math.random()*2),
                                Math.random()*Math.PI*2, .5-Math.random()*1))
  tick()
}

function cleanupSprites(sprites) {
  sprites.filter(function (s) { 
    return s.collision 
  }).forEach(function (s) {
    spritesDom.removeChild(s.dom)
  })
  return sprites.filter(function (s) {
    return !s.collision
  })
}

function updateWorld() {
  if (ship.controls.left)
    ship.a += .13
  if (ship.controls.right)
    ship.a -= .13
  if (ship.controls.thrust) {
    ship.v.add(createUnit(ship.a).scale(.5), ship.v)
    for(var i=0; i<4; i++)
      sparks.push(new Spark(ship.pos.add(createUnit(ship.a).scale(-10)), 
                            createUnit(ship.a+Math.PI-0.8+Math.random()*1.6).scale(7+Math.random()*4).add(ship.v),
                            10+Math.random()*5))
  }
  if (ship.controls.fire) 
    bullets.push(new Bullet(ship.pos, createUnit(ship.a).scale(10).add(ship.v)));
  ship.v.add(gravity, ship.v)
  ship.pos.add(ship.v, ship.pos)
  var trPoints = shipPoints.rotate(ship.a).add(ship.pos)
  ship.collision = grid.getCell(ship.pos).some(function (line) {
    return line.intersectsPolygon(trPoints)
  })
  ship.controls.shield = ship.collision

  bullets.forEach(function (b) {
    b.pos.add(b.v, b.pos)
    b.collision = grid.getCell(b.pos).some(function (line) {
      return line.intersects(b.pos.sub(b.v), b.pos)
    })
  })

  asteroids.forEach(function (a) {
    a.pos.add(a.v, a.pos)
    a.a += a.av
    var trPoints = asteroidPoints.rotate(a.a).add(a.pos)
    a.collision = grid.getCell(a.pos).some(function (line) {
      return line.intersectsPolygon(trPoints)
    })
  })

  sparks.forEach(function (b) {
    b.v.scale(0.9, b.v)
    b.pos.add(b.v, b.pos)
    b.collision = --b.ttl<=0 || grid.getCell(b.pos).some(function (line) {
      return line.intersects(b.pos.sub(b.v), b.pos)
    })
  })

  bullets = cleanupSprites(bullets)
  asteroids = cleanupSprites(asteroids)
  sparks = cleanupSprites(sparks)
}

function renderView() {
  for(var i=0; i<bullets.length; i++) {
    var b = bullets[i]
    b.dom.setAttribute("x", b.pos[0])
    b.dom.setAttribute("y", b.pos[1])
  }
  for(var i=0; i<asteroids.length; i++) {
    var a = asteroids[i]
    a.dom.setAttribute("transform", "translate("+ a.pos[0] +","+ a.pos[1] +") rotate(" + (a.a/Math.PI*180) +")");
  }
  for(var i=0; i<sparks.length; i++) {
    var b = sparks[i]
    b.dom.setAttribute("cx", b.pos[0])
    b.dom.setAttribute("cy", b.pos[1])
    b.dom.setAttribute("fill", ["#222", "#666", "#999", "#ccc", "#eee"][Math.min(4,Math.floor(b.ttl/15*4))])
  }
  var view = document.getElementById("view")
  set('viewport.transform', 'scale(1,-1) translate('+ (view.clientWidth/2-ship.pos[0]) +','+  (-view.clientHeight/2-ship.pos[1]) +')')
  set('ship.transform', 'translate('+ ship.pos[0] +','+ ship.pos[1] +') rotate('+ (ship.a/Math.PI*180) +')')
  set('shield.visibility', ship.controls.shield ? 'visible' : 'hidden')
  if (ship.controls.shield) {
    var p = ship.pos
    set('shield.transform', 'translate('+ p[0] +','+ p[1] +')')
    set('shield.stroke-dashoffset', frame*2)
  }
  set('thrust.visibility', ship.controls.thrust ? 'visible' : 'hidden')
  if(ship.controls.thrust) {
    var p = ship.pos.add(createUnit(ship.a - Math.PI).scale(10))
    set('thrust.r', 6 + frame%6)
    set('thrust.cx', p[0])
    set('thrust.cy', p[1])
  }
  document.getElementById("msg").firstChild.data 
    =" Frame: " + frame 
    +" Bullets: "+ bullets.length 
    +" Asteoids: "+ asteroids.length
    +" Sparks: "+ sparks.length
  document.body.style.backgroundPosition = ""+(1024-(ship.pos[0]%1024)) +" "+ (ship.pos[1]%1024);
}

function tick() {
  frame++
  if (!isPause) {
    updateWorld()
    renderView()
  }
  setTimeout(tick, 50)
}

