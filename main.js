




/**
Block IDs:
Air: 0
Fuel Cell: 1
Water Cooler: 2

Cryotheum Cooler: 11

Beryllium Moderator: 18

*/
const VERSION = "1.0.2";



class Reactor {
  constructor(x, y, z){
    this.contents = [];
    this.x = constrain(x, 1, 17);
    this.y = constrain(y, 1, 17);
    this.z = constrain(z, 1, 17);
    this.name = "Unnamed Reactor";
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
    for(let i = 0; i < this.y; i ++){
      let tempElement = document.createElement("div");
      tempElement.className = "layer";
      tempElement.attributes.z = i;
      let layerInnerHTML = `<div class="layerinner" onclick="alert('Reactor editing is not yet implemented.')">`;
      for(let j = 0; j < this.x*this.z; j ++){
        layerInnerHTML += `<div class="cell">${this.contents[i][Math.floor(j/this.x)][j % this.x]}</div>`;//Todo: optimize the crap out of this as its being run several hundred times.
      }
      layerInnerHTML += "</div>";
      tempElement.innerHTML = layerInnerHTML;
      reactorLayers.appendChild(tempElement);
    }
    document.getElementById("reactorName").value = this.name;
  }

  export(){
    download(
      document.getElementById("reactorName").value./*TODO: NEEDS BETTER SANITIZING*/replaceAll("/", "").replaceAll(".", "") + ".json",
      `{\n\t"readme":"Hello! You appear to have tried to open this JSON file with a text editor. You shouldn't be doing that as it's raw JSON which makes no sense. Please open this using the website at https://balam314.github.io/Einsteinium/index.html",\n\t"READMEALSO":"This is the data storage file for a NuclearCraft fission reactor generated with Einsteinium.",\n\t"content": ` + JSON.stringify(this.contents) + `,\n\t"metadata":{"version":"${VERSION}","dimensions":[${this.x},${this.y},${this.z}],"name": "${this.name}"}\n}`
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


var uploadButton = document.getElementById('uploadButton');
uploadButton.type = 'file';
uploadButton.onchange = function(e){

   // getting a hold of the file reference
   var file = e.target.files[0];

   // setting up the reader
   var reader = new FileReader();
   reader.readAsText(file);

   // here we tell the reader what to do when it's done reading...
   reader.onload = function(readerEvent){
      var content = readerEvent.target.result; // this is the content!
      console.log(content);
      loadReactor(content);
   }
}

function loadReactor(data){
  try {
    var x = JSON.parse(data);
    console.assert(x.metadata.version.match(/[1-9].[0.9].[0-9]/gi));
    if(x.metadata.version != VERSION){
      console.warn("Loading JSON file with a different data version.");
    }
    defaultReactor = new Reactor(x.metadata.dimensions[0], x.metadata.dimensions[1], x.metadata.dimensions[2]);
    defaultReactor.contents = x.content;
    defaultReactor.name = x.metadata.name;
    console.assert(defaultReactor.validate());
    defaultReactor.updateDOM(reactorLayers);
  } catch(err){
    console.error("Invalid JSON!" + err);
  }
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
