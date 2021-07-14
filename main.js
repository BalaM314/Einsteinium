




/**
Block IDs:
Air: 0
Fuel Cell: 1
Water Cooler: 2

Beryllium Moderator: 18

*/



class Reactor {
  constructor(x, y, z){
    this.contents = [];
    this.named = "Unnamed Reactor";
    let temp1 = [];
    let temp2 = [];
    for(let i = 0; i < z; i ++){
      temp1.push(0);
    }
    for(let i = 0; i < x; i ++){
      temp2.push(temp1);
    }
    for(let i = 0; i < y; i ++){
      this.contents.push(temp2);
    }
  }

  edit(x, y, z, id){
    if(isNan(id)){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    try {
      this.contents[z][x][y] = id;
      return true;
    } catch(err){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
  }

  validate(){
    return true;// TODO: make this actually validate
  }

  export(){
    console.error("NYI!");
  }
}


var reactorLayers = document.getElementById("reactorlayers");


function generateLayersToDOM(x, y, z){
  x = constrain(x, 1, 17);
  y = constrain(y, 1, 17);
  z = constrain(z, 1, 17);
  reactorLayers.attributes.dimensions = `${x},${y},${z}`;
  let layerInnerHTML = `<div class="layerinner">`;
  for(let i = 0; i < x*z; i ++){
    layerInnerHTML += `<div class="cell"></div>`;
  }
  layerInnerHTML += "</div>";
  for(let i = 0; i < z; i ++){
    let tempElement = document.createElement("div");
    tempElement.className = "layer";
    tempElement.attributes.z = i;
    tempElement.innerHTML = layerInnerHTML;
    reactorLayers.appendChild(tempElement);
  }
}

generateLayersToDOM(5, 5, 5);
