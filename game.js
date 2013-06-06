
frame = 0
ship = {
  pos: [0, 0], 
  v: [0, 0],
  a: 90,  
  controls: {}
}
gravity = [0, -0.02]
bullets = []

window.onkeydown = window.onkeyup = function (e) {
  var isDown = e.type == "keydown"
  switch(e.keyCode) {
  case e.DOM_VK_B:
  case 65: ship.controls.left = isDown; break;
  case 68: ship.controls.right = isDown; break;
  case 16: // Shift
  case 76: ship.controls.thrust = isDown; break;
  case 32: ship.controls.shield = isDown; break;
  case 13: ship.controls.fire = isDown; break; // Enter
  }
}

function set(elementIdDotAttribute, value) {
  var a = elementIdDotAttribute.split('.')
  return document.getElementById(a[0]).setAttribute(a[1], value)
}


function init() {
  set('ship.points', [20,0, -15,-12, -8,-3, -8,4, -15,12])
  set('cave.points', createRegularPolygon(6).scale([600, 300]).rotate(Math.PI/16).repeatNext(3).midpointDisplacement())
  set('shield.r', 26)
  tick()
}

function tick() {
  frame++
  if (ship.controls.left)
    ship.a += 6
  if (ship.controls.right)
    ship.a -= 6
  if (ship.controls.thrust) 
    ship.v.add(createNormal(ship.a).scale(.5), ship.v)
  if (ship.controls.fire) {
    bullets.push({
      pos: ship.pos.add(0),
      v: ship.v.add(createNormal(ship.a).scale(10))
    })
    ship.controls.fire = false
  }
  ship.v.add(gravity, ship.v)
  ship.pos = ship.pos.add(ship.v)
  for(var i=0; i<bullets.length; i++) {
    var b = bullets[i]
    b.pos.add(b.v, b.pos)
  }

  for(var i=0; i<bullets.length; i++) {
    var b = bullets[i]
    if (!b.dom) {
      b.dom = document.getElementById("bullets").appendChild(
        document.createElementNS("http://www.w3.org/2000/svg", "circle"))
      b.dom.setAttribute("r", 1)
      b.dom.setAttribute("stroke", "white")
    }
    b.dom.setAttribute("cx", b.pos[0])
    b.dom.setAttribute("cy", b.pos[1])
  }

  var view = document.getElementById("view")
  set('viewport.transform', 'scale(1,-1) translate('+ (view.clientWidth/2-ship.pos[0]) +','+  (-view.clientHeight/2-ship.pos[1]) +')')
  set('ship.transform', 'translate('+ ship.pos[0] +','+ ship.pos[1] +') rotate('+ ship.a +')')
  set('shield.visibility', ship.controls.shield ? 'visible' : 'hidden')
  if (ship.controls.shield) {
    set('shield.transform', 'translate('+ ship.pos[0] +','+ ship.pos[1] +')')
    set('shield.stroke-dashoffset', frame*2)
  }
  setTimeout(tick, 50)
}

