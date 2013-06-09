
var frame = 0
var ship = {
  pos: [0, 0], 
  v: [0, 0],
  a: 90,  
  controls: {}
}
var gravity = [0, -0.02]
var bullets = []
var shipPoints = [20,0, -15,-12, -8,-3, -8,4, -15,12]
var cavePoints = createRegularPolygon(6).scale([600, 300]).rotate(Math.PI/16).repeatNext(3).midpointDisplacement()
var caveLines
var isPause = false

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

function Bullet(pos, v) {
  this.pos = pos.slice()
  this.v = v.slice()
  this.dom = document.getElementById("bullets").appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "circle"))
  this.dom.setAttribute("r", 1)
}

function init() {
  caveLines = createLines(cavePoints)
  set('ship.points', shipPoints)
  set('cave.points', cavePoints)
  set('shield.r', 26)
  set('msg.x', 10)
  set('msg.y', view.clientHeight-4)
  tick()
}

function updateWorld() {
  if (ship.controls.left)
    ship.a += 6
  if (ship.controls.right)
    ship.a -= 6
  if (ship.controls.thrust) 
    ship.v.add(createNormal(ship.a).scale(.5), ship.v)
  if (ship.controls.fire) 
    bullets.push(new Bullet(ship.pos, createNormal(ship.a).scale(10).add(ship.v)));
  ship.v.add(gravity, ship.v)
  ship.pos.add(ship.v, ship.pos)
  for(var i=0; i<bullets.length; i++) {
    var b = bullets[i]
    b.pos.add(b.v, b.pos)
    for(var j=0; j<caveLines.length; j++) {
      var d = caveLines[j].distance(b.pos)
      b.collision |= d && d<0 && d>-20
    }
  }
  for(var i=0; i<bullets.length; i++)
    if(bullets[i].collision) {
      bullets[i].dom.parentNode.removeChild(bullets[i].dom)
      bullets.splice(i--, 1)
    }
      
}

function renderView() {
  for(var i=0; i<bullets.length; i++) {
    var b = bullets[i]
    b.dom.setAttribute("cx", b.pos[0])
    b.dom.setAttribute("cy", b.pos[1])
  }

  var view = document.getElementById("view")
  set('viewport.transform', 'scale(1,-1) translate('+ (view.clientWidth/2-ship.pos[0]) +','+  (-view.clientHeight/2-ship.pos[1]) +')')
  set('ship.transform', 'translate('+ ship.pos[0] +','+ ship.pos[1] +') rotate('+ ship.a +')')
  set('shield.visibility', ship.controls.shield ? 'visible' : 'hidden')
  if (ship.controls.shield) {
    var p = ship.pos
    set('shield.transform', 'translate('+ p[0] +','+ p[1] +')')
    set('shield.stroke-dashoffset', frame*2)
  }
  if(ship.controls.thrust) {
    var p = ship.pos.add(createNormal(ship.a - 180).scale(10))
    set('thrust.r', 6 + frame%6)
    set('thrust.cx', p[0])
    set('thrust.cy', p[1])
    set('thrust.visibility', 'visible')
  } else 
    set('thrust.visibility','hidden')
  document.getElementById("msg").firstChild.data = "Frame: " + frame +" Bullets: "+ bullets.length
}

function tick() {
  frame++
  if (!isPause) {
    updateWorld()
    renderView()
  }
  setTimeout(tick, 50)
}

