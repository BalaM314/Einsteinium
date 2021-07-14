




/**
Block IDs:
Air: 0
Fuel Cell: 1
Water Cooler: 2

Beryllium Moderator: 18

*/
const VERSION = 1.0.1;



class Reactor {
  constructor(x, y, z){
    this.contents = [];
    this.x = constrain(x, 1, 17);
    this.y = constrain(y, 1, 17);
    this.z = constrain(z, 1, 17);
    this.named = "Unnamed Reactor";
    let temp1 = [];
    let temp2 = [];
    for(let i = 0; i < this.z; i ++){
      temp1.push(0);
    }
    for(let i = 0; i < this.x; i ++){
      temp2.push(temp1);
    }
    for(let i = 0; i < this.y; i ++){
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

  updateDOM(reactorLayers){
    reactorLayers.innerHTML = "";
    reactorLayers.style.setProperty("--cells-z", this.z.toString());
    reactorLayers.style.setProperty("--cells-x", this.x.toString());
    let layerInnerHTML = `<div class="layerinner" onclick="alert('Reactor editing is not yet implemented.')">`;
    for(let i = 0; i < this.x*this.z; i ++){
      layerInnerHTML += `<div class="cell"></div>`;//This should be different based on the actual reactor's cell.
    }
    layerInnerHTML += "</div>";
    for(let i = 0; i < this.y; i ++){
      let tempElement = document.createElement("div");
      tempElement.className = "layer";
      tempElement.attributes.z = i;
      tempElement.innerHTML = layerInnerHTML;
      reactorLayers.appendChild(tempElement);
    }
  }

  export(){
    download(
      document.getElementById("reactorName").value./*TODO: NEEDS BETTER SANITIZING*/replaceAll("/", "").replaceAll(".", "") + ".json",
      `{\n\t"readme":"Hello! You appear to have tried to open this JSON file with a text editor. You shouldn't be doing that as it's raw JSON which makes no sense. Please open this using the website at https://balam314.github.io/Einsteinium/index.html",\n\t"READMEALSO":"This is the data storage file for a NuclearCraft fission reactor generated with Einsteinium.",\n\t"content": ` + JSON.stringify(this.contents) + `,\n\t"metadata":{"version":${VERSION},"dimensions":[${this.x},${this.y},${this.z}]}\n}`
    );
    //It's messy but it works.
  }
}

function download(filename, text) {
  var temp2 = document.createElement('a');
  temp2.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  temp2.setAttribute('download', filename);
  temp2.style.display = 'none';
  document.body.appendChild(temp2);
  temp2.click();
  document.body.removeChild(temp2);
}

var reactorLayers = document.getElementById("reactorlayers");

var defaultReactor;
function regenReactor(){
  defaultReactor = new Reactor(
    document.getElementById("x_input").value,
    document.getElementById("y_input").value,
    document.getElementById("z_input").value);
  defaultReactor.updateDOM(reactorLayers);
}
regenReactor();

/*
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
*/
