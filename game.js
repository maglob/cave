
frame=0
ship={x:0, y:-0, a:90, vx:0, vy:0, controls: {left: false, right: false, thrust: false, shield: false}}

window.onkeydown = window.onkeyup = function (e) {
  var isDown = e.type == "keydown"
  switch(e.keyCode) {
  case 65: ship.controls.left = isDown; break;
  case 68: ship.controls.right = isDown; break;
  case 76: ship.controls.thrust = isDown; break;
  case 32: ship.controls.shield = isDown; break;
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
  if (ship.controls.thrust) {
    ship.vx += Math.cos(Math.PI/180*ship.a)*.5
    ship.vy += Math.sin(Math.PI/180*ship.a)*.5
  }
  ship.vy -= 0.02
  ship.x += ship.vx
  ship.y += ship.vy
  var view = document.getElementById("view")
  set('viewport.transform', 'scale(1,-1) translate('+ (view.clientWidth/2-ship.x) +','+  (-view.clientHeight/2-ship.y) +')')
  set('ship.transform', 'translate('+ ship.x +','+ ship.y +') rotate('+ ship.a +')')
  set('shield.visibility', ship.controls.shield ? 'visible' : 'hidden')
  if (ship.controls.shield) {
    set('shield.transform', 'translate('+ ship.x +','+ ship.y +')')
    set('shield.stroke-dashoffset', frame*2)
  }
  setTimeout(tick, 50)
}

