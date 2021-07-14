//Library


// TODO: font handler, reset, save profiles
let keysPressed = [];
let mouseIsPressed = false;
var xscroll = 0;
var yscroll = 0;
var tileSize;
var programStart = new Date();

function keyPressed(){}
function mousedown(){}
function OnKeyDown(event){
  if(!keysPressed.includes(event.key)){
    keysPressed.push(event.key);
  }
  keyPressed(event);
}
function OnKeyUp(event){
  if(keysPressed.includes(event.key)){
    keysPressed.splice(keysPressed.indexOf(event.key));
  }
}
function OnMouseDown(event){
  let border = 0;
  mouseIsPressed = true;
  mouseX = constrain(event.clientX - 17, 0, 600);
  mouseY = constrain(event.clientY - 17, 0, 600);
  mousedown();
}
function OnMouseUp(event){
  mouseIsPressed = false;
}

let mouseX = 0;
let mouseY = 0;
let pmouseX = 0;
let pmouseY = 0;
var cancel;
function OnMouseMove(event){
  pmouseX = mouseX;
  pmouseY = mouseY;
  mouseX = constrain(event.clientX - 17, 0, 600);
  mouseY = constrain(event.clientY - 17, 0, 600);
}

window.onmousemove = OnMouseMove;
window.onkeydown = OnKeyDown;
window.onkeyup = OnKeyUp;
window.onkeypress = keyPressed;
window.onmousedown = OnMouseDown;
window.onmouseup = OnMouseUp


function fill(r, g, b, a){
  if(arguments.length == 1){
    if(typeof r == "string"){
      ctx.fillStyle = r;
    } else if(typeof r == "number"){
      var x = unRgb(r);
      fill(x[0], x[1], x[2])
    }
  } else {
    if(a){
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      ctx.globalAlpha = a / 255;
    } else {
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.globalAlpha = 1;
    }
  }
}
function sq(x){
  return x * x;
}
function millis(){
  return (new Date()).valueOf() - programStart.valueOf();
};
function stroke(r, g, b){
  if(arguments.length == 1){
    if(typeof r == "string"){
      ctx.strokeStyle = r;
    } else if(typeof r == "number"){
      var x = unRgb(r);
      stroke(x[0], x[1], x[2])
    }
  } else {
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
  }
}
function rgb(r, g, b){
  if(typeof r == "object"){
    b = r[2];
    g = r[1];
    r = r[0];
    console.log(r, g, b);
  }
  return (65536 * Math.round(r)) + (256 * Math.round(g)) + Math.round(b);
}
function randomColor(){
  return rgb(random(0, 255), random(0, 255), random(0, 255));
}
function randomHexColor(){
  var temp2 = "#";
  temp2 += randInt(0, 15).toString(16);
  temp2 += randInt(0, 15).toString(16);
  temp2 += randInt(0, 15).toString(16);
  temp2 += randInt(0, 15).toString(16);
  temp2 += randInt(0, 15).toString(16);
  temp2 += randInt(0, 15).toString(16);
  return temp2;
}
function unRgb(x){
  var b = x % 256;
  x -= b;
  x /= 256;
  var g = x % 256;
  x -= g;
  var r = x / 256;
  return [r, g, b];
}
function color(r, g, b){
  return (65536 * r) + (256 * g) + b;//LINK rgb()
}
function point(x, y){
  ellipse(x, y, 2, 2);
}
function rect(x, y, w, h, stroke){
  ctx.fillRect(x, y, w, h);
  if(!stroke){ctx.strokeRect(x, y, w, h);}
}
function ellipse(x, y, w, h, r, start, stop){
  if(r == undefined){r = 0;}
  if(start == undefined){start = 0;}
  if(stop == undefined){stop = Math.PI * 2;}
  ctx.beginPath();
  ctx.ellipse(x, y, w/2, h/2, r, start, stop);
  ctx.fill();
}
function randInt(min, max){
  return floor(random(min, max + 1));
}
function quad(x1, y1, x2, y2, x3, y3, x4, y4){
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.closePath();
}
function text(msg, x, y, spacing, font){
  msg = msg.split("\n");
  if(msg.length == 1){
    ctx.fillText(msg, x, y);
  } else {
    for(var i in msg){
      ctx.fillText(msg[i], x, y + spacing*(i - (msg.length + 1) / 4));
    }
  }
}
function line(x1, y1, x2, y2){
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function background(r, g, b){
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.lineWidth = 0;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function rad(x){
  return x * Math.PI * 2/ 90
}
function gcd(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number'))
    return false;
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}
function random(min,max){
  if(arguments.length > 2){
    throw new Error("Too many arguments for random");
  }
  if(arguments.length == 1){
    max = min;
    min = 0;
  }
  if(arguments.length == 0){
    min = 0;
    max = 1;
  }
  return Math.random()*(max-min) + min;
}
function randInt(min, max){
  if(arguments.length > 2){
    throw new Error("Too many arguments for randInt");
  }
  if(arguments.length == 1){
    max = min;
    min = 0;
  }
  if(arguments.length == 0){
    min = 0;
    max = 1;
  }
  return Math.floor(Math.random()*(max + 1 - min) + min);
}
function constrain(x, min, max){
  if(x < min){
    return min;
  } else if (x > max){
    return max;
  } else {
    return x;
  }
}
function round(x){
  return Math.round(x);
}
function map(x, min1, max1, min2, max2){
  return (((x - min1)/Math.abs(max1-min1))*(max2-min2)) + min2;
}
function bezierPoint(a, b, c, e, d){
  return (1-d) * (1-d) * (1-d) *a+3*(1-d)*(1-d)*d*b+3*(1-d)*d*d*c+d*d*d*e
};
function polygon(args){
  if(typeof args !== "array"){
    args = arguments;
  }
  if(args.length % 2 !== 0){
    throw new Exception("List of coordinates not in pairs");
  }
  ctx.beginPath();
  for(var i = 0; i < args.length; i += 2){
    ctx.lineTo(args[i], args[i+1]);
  }
  ctx.fill();
}
function hsb(h, s, v){
    h /= 100;
    s /= 100;
    v /= 100;
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

function colorPos(x, y){
  theta = x >= 0 ? Math.atan(y/x) : y > 0 ? (Math.PI - Math.atan(-y/x)) : Math.atan(y/x) - Math.PI;
  return hsb(map(theta, -Math.PI, Math.PI, 0, 100), 100, /*map(Math.sqrt(x*x, y*y), 0, 848.52, 100, 50)*/100);
}

function euler(x, y){
  return x > 0 ? Math.atan(y/x) : y > 0 ? (Math.PI - Math.atan(-y/x)) : Math.atan(y/x) - Math.PI;
}

Number.prototype.constrain = function(min = -1, max = 1){
  //console.log(min, max);
};

function swap(x, y){
  let temp7 = x;
  x = y;
  y = temp7;
}

function loadImage(src, w, h){
  var image = new Image();
  image.src = src;
  image.width = w;
  image.height = h;
  return image;
}
CanvasRenderingContext2D.prototype.image = function(){
  throw "oops: IT'S ctx.drawImage, NOT ctx.image YA NOOB!";
}

class LargeNumber {
  constructor(val){

  }
}

var Complex = function(a, b){
    this.a = a;
    this.b = b;
};

Complex.prototype.add = function(z){
  if(!(z instanceof Complex)){
    if(typeof z === "number"){
      z = new Complex(z, 0)
    } else {
      throw("Complex.add(z) takes another Complex object as an argument.");
    }
  }
  return new Complex(this.a + z.a, this.b + z.b);
};

Complex.prototype.sub = function(z){
  if(!(z instanceof Complex)){
    throw("Complex.add(z) takes another Complex object as an argument.");
  }
  return new Complex(this.a - z.a, this.b - z.b);
};

Complex.prototype.mult = function(z){
  if(!(z instanceof Complex)){
    throw("Complex.add(z) takes another Complex object as an argument.");
  }
  return new Complex(this.a*z.a - this.b*z.b, this.b * z.a + this.a*z.b);
};

Complex.prototype.div = function(z){
  if(!(z instanceof Complex)){
    throw("Complex.add(z) takes another Complex object as an argument.");
  }
  return new Complex((this.a * z.a + this.b * z.b)/((z.a*z.a)+(z.b*z.b)),(this.a * z.b * -1 + this.b * z.a)/((z.a*z.a)+(z.b*z.b)));//Whoo!!
};

Complex.prototype.conj = function(){
  return new Complex(this.a, this.b * -1);
};

Complex.prototype.toString = function(){
  return this.a + " + " + this.b + "i";
}

Complex.prototype.magnitude = function(){
  return Math.sqrt(this.a*this.a + this.b*this.b);
}
function abs(x){
	if(x instanceof Complex){
		return x.magnitude();
	} else {
		return Math.abs(x);
	}
}

function pointInRect(rX, rY, rW, rH, pX, pY){
  return pX > rX &&
         pX < rX + rW &&
         pY > rY &&
         pY < rY + rH;
}


class Button {
  constructor(config){
      this.x = config.x || 300;
      this.y = config.y || 300;
      this.width = config.width || 80;
      this.height = config.height || 50;
      this.label = config.label || "Click";
      this.color = config.color || color(0, 0, 255);
      this.textSize = config.textSize || "19px";
      this.onClick = config.onClick || function() {};
      this.clicky = false;
  };
  display(){
      fill(this.color)
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.lineWidth = 1;
      rect(this.x, this.y, this.width, this.height, 5);
      if(this.isMouseInside()){
        if(mouseIsPressed){
          fill(0, 255, 0, 15);
          if(!this.clicky){
            this.onClick();
            this.clicky = true;
          }
        } else {
          fill(255, 255, 255, 55);
        }
        rect(this.x, this.y, this.width, this.height, 5);
      }
      if(!mouseIsPressed){
        this.clicky = false;
      }
      ctx.font = `${this.textSize} sans-serif`;
      ctx.textAlign = "center";
      var tempBaseline = ctx.textBaseline;
      ctx.textBaseline = "middle";
      fill(0, 51, 255);
      ctx.fillText(this.label,this.x + this.width/2,this.y + this.height/2);
      ctx.textBaseline = tempBaseline;
  };
  isMouseInside(){
      return mouseX > this.x &&
             mouseX < this.x + this.width &&
             mouseY > this.y &&
             mouseY < this.y + this.height;
  };
  handleMouseClick(){
      if(this.isMouseInside()) {
          //this.onClick();
      }
  };
}

class PVector {
  constructor(x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
  }
  add(a, b){
    if(arguments.length == 1){
      this.x += a.x;
      this.y += a.y;
      return this;
    } else if(arguments.length == 2){
      return a.add(b);
    }
  }
  sub(a, b){
    if(arguments.length == 1){
      this.x -= a.x;
      this.y -= a.y;
      return this;
    } else if(arguments.length == 2){
      return a.sub(b);
    }
  }
  mult(a){
      this.x *= a;
      this.y *= a;
      return this;
  }
  div(a, b){
    this.x /= a;
    this.y /= a;
    return this;
  }
  dist(a){
    return Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
  }
}

class Sprite{
  constructor(config){
      this.mass = config.mass || 1;
      this.position = new PVector(config.x, config.y) || new PVector(200, 200);
      this.velocity = new PVector(0, 0);
      this.acceleration = new PVector(0, 0);
      this.w = config.w || 100;
      this.h = config.h || 100;
      this.SPEED = config.SPEED || 10;
      this.FRICTION = 0.86;
      this.gravity = Gravity;
      this.jumping = false;
  }
  display(){
      ctx.fillStyle = 'rgb(0, 255, 0)';
      ctx.fillRect(this.position.x + xscroll, this.position.y + yscroll, this.w, this.h);
  }
  applyForce(force){
      var f = new PVector(force.x, force.y).div(this.mass);
      this.acceleration.add(f);
  }
  collide(platf){
      if(platf == undefined){
        return;
      }
      if(platf.v){
        return;
      }
      if(platf.w == undefined){
        platf.w = tileSize;
      }
      if(platf.h == undefined){
        platf.h = tileSize;
      }
      var plat = {x: platf.pixelX, y: platf.pixelY - yscroll, w: tileSize, h: tileSize};
      var nextPos = new PVector(this.position.x, this.position.y - yscroll);
      var velocity = new PVector(this.velocity.x, this.velocity.y);
      velocity.add(this.acceleration);
      velocity.x = constrain(velocity.x, -this.SPEED, this.SPEED);
      nextPos.add(velocity);
      /*****
      ↑↑This bit calculates the next position of the sprite ↑↑
      */

      if( (nextPos.x + this.w > plat.x)&&
          (nextPos.y + this.h > plat.y)&&
          (nextPos.x < plat.x + plat.w)&&
          (nextPos.y < plat.y + plat.h))//Sprite will be inside a platform on next frame
          {

          if((this.velocity.y > 0) && (this.position.y - yscroll + this.h - 1) < plat.y){//landing
              this.velocity.y = 0;
              this.position.y = plat.y - this.h + yscroll;
              this.acceleration.y = 0;
              this.jumping = false;
              console.log("floor");
          }
          if((this.velocity.x > 0) && (this.position.x + this.w - 1) < plat.x && (this.position.y - yscroll + this.h) > plat.y && this.position.y - yscroll < plat.y + plat.h){//moved into left wall of platform
              this.velocity.x = 0;
              this.position.x = plat.x - this.w;
          }
          if(((this.velocity.x < 0) && (this.position.x + 1) > (plat.x + plat.w) && (this.position.y - yscroll + this.h) > plat.y) && this.position.y - yscroll < plat.y + plat.h){//moved into right wall of platform
              this.velocity.x = 0;
              this.position.x = plat.x + plat.w;
          }
          if((this.velocity.y < 0) && (this.position.y - yscroll + 1) > (plat.y + plat.h) && (this.position.x + this.w > plat.x) && (this.position.x < plat.x + plat.w)){//hit ceiling
              this.velocity.y = 0;
              this.position.y = plat.y + plat.h + yscroll;
          }
      }
  }
  run(){
      this.velocity.x = constrain(this.velocity.x, -this.SPEED, this.SPEED);
      this.velocity.y = constrain(this.velocity.y, -20, 20);
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.acceleration.mult(0);
      this.display();
      if(keysPressed.includes("d")){
          this.applyForce(new PVector(0.15, 0));
          this.velocity.x *= 1 + (1 - this.FRICTION)/10;
      }
      if(keysPressed.includes("a")){
          this.applyForce(new PVector(-0.15, 0));
          this.velocity.x *= 1 + (1 - this.FRICTION)/10;
      }
      if(keysPressed.includes("w") && !this.jumping){
          this.applyForce(new PVector(0, -6.5));
          this.jumping = true;
      }
      if(!this.jumping){
          this.velocity.x *= this.FRICTION;
      } else if(this.jumping){
          this.velocity.x *= 0.9999;
      }
      if(this.position.y - yscroll > 450){
          yscroll += this.velocity.y;//YScroll down!
      }
      if(this.position.y - yscroll < 50){
          yscroll -= 3;//YScroll up!
      }
      if(this.position.x + this.w + xscroll > 550){
          xscroll -= Math.abs(this.velocity.x);//XScroll right!
      }
      if(this.position.x + xscroll < 50){
          xscroll += Math.abs(this.velocity.x);//XScroll left!
      }
      xscroll = constrain(xscroll, -600, 0);
      this.applyForce(new PVector(0, this.gravity));
      this.position.x = constrain(this.position.x, 0, 1150);
  };
}

var Platform = function(config){
    this.position = new PVector(config.x, config.y);
    this.w = config.w;
    this.h = config.h;
    this.type = config.type;//todo implement
};

Platform.prototype.display = function(){
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(this.position.x, this.position.y, this.w, this.h);
};


//██╗░░██╗░█████╗░  ░█████╗░███╗░░██╗██╗░░░░░██╗░░░██╗
//██║░██╔╝██╔══██╗  ██╔══██╗████╗░██║██║░░░░░╚██╗░██╔╝
//█████═╝░███████║  ██║░░██║██╔██╗██║██║░░░░░░╚████╔╝░
//██╔═██╗░██╔══██║  ██║░░██║██║╚████║██║░░░░░░░╚██╔╝░░
//██║░╚██╗██║░░██║  ╚█████╔╝██║░╚███║███████╗░░░██║░░░
//╚═╝░░╚═╝╚═╝░░╚═╝  ░╚════╝░╚═╝░░╚══╝╚══════╝░░░╚═╝░░░
/*
var Button = function(config){
    this.x = config.x || 300;
    this.y = config.y || 300;
    this.width = config.width || 80;
    this.height = config.height || 50;
    this.label = config.label || "Click";
    this.color = config.color || color(0, 0, 255);
    this.onClick = config.onClick || function() {};};
Button.prototype.display = function(){
    rectMode(CORNER);
    if (this.isMouseInside() && mouseIsPressed) {
        fill(255, 255, 255);
    } else {
       fill(this.color);
    }
    stroke(0, 0, 0);
    strokeWeight(1);
    rect(this.x, this.y, this.width, this.height, 5);
    fill(0, 0, 0);
    textSize(19);
    textAlign(CENTER, CENTER);
    fill(0, 51, 255);
    text(this.label,this.x + this.width/2,this.y + this.height/2);
};
Button.prototype.isMouseInside = function(){
    return mouseX > this.x &&
           mouseX < this.x + this.width &&
           mouseY > this.y &&
           mouseY < this.y + this.height;
};
Button.prototype.handleMouseClick = function(){
    if(this.isMouseInside()) {
        this.onClick();
    }
};

function setGradient(x, y, w, h, c1, c2, axis){
    var dR = red(c2) - red(c1);
    var dG = green(c2) - green(c1);
    var dB = blue(c2) - blue(c1);
    var cR = red(c1);
    var cG = green(c1);
    var cB = blue(c1);
    var c;
    if(axis === Y_AXIS){
        for (var j = y; j <= (y + h); j++){
            c = color((cR + (j - y) * (dR / h)),(cG + (j - y) * (dG / h)),(cB + (j - y) * (dB / h)));
            stroke(c);
            line(x, j, x+w, j);
        }
    } else if(axis === X_AXIS){
        for (var j = y; j <= (y + w); j++){
            c = color((cR + (j - y) * (dR / h)),(cG + (j - y) * (dG / h)),(cB + (j - y) * (dB / h)));
            stroke(c);
            line(x, j, x+h, j);
        }
    }
}
*/
