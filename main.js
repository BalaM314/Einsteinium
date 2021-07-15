




/**
Block IDs:
Air: 0
Fuel Cell: 1
Water Cooler: 2

Cryotheum Cooler: 11

Beryllium Moderator: 18

*/
const VERSION = "1.0.3";

var settings = {
  "heatMult": 1.0,
  "neutronRadiationReach": 4,
  "maxReactorSize": 10,
  "moderatorExtraHeat": 2,
  "coolers": [0, 0, 60, 90, 90, 120, 130, 120, 150, 140, 120, 160, 80, 160, 80, 120, 110]
};

var hardSettings = {
  "defaultName": "Unnamed Reactor"
};

//Util functions
function cp(data){
  return JSON.parse(JSON.stringify(data));
}
function gna(arr, x, y, z){//Safely get a value from nested arrays
  if(arr){
    if(arr[x]){
      if(arr[x][y]){
        if(arr[x][y][z] != undefined){
          return arr[x][y][z];
        }
      }
    }
  }
  return null;
}


class Reactor {
  constructor(x, y, z){
    this.contents = [];
    /*
    Reactor.contents is a 3-dimensional array storing the id of each block(as a number).
    It is stored in the format Reactor.contents[y][x][z].
    */
    this.y = constrain(y, 1, settings.maxReactorSize);
    this.x = constrain(x, 1, settings.maxReactorSize);
    this.z = constrain(z, 1, settings.maxReactorSize);
    //some input validation cus why not

    this.name = hardSettings.defaultName;

    //code to populate the this.contents array
    let temp1 = [];
    let temp2 = [];
    for(let i = 0; i < this.z; i ++){
      temp1.push(0);
    }
    for(let i = 0; i < this.x; i ++){
      temp2.push(cp(temp1));
    }
    for(let i = 0; i < this.y; i ++){
      this.contents.push(cp(temp2));
    }
  }

  edit(x, y, z, id){
    //Self explanatory.
    if(isNaN(id)){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    id *= 1;//convert to number
    try {
      this.contents[y][x][z] = id;
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
    //So glad this worked ^^

    //This code is a bit messy, it generates the html for the reactor layer editor.
    for(let i = 0; i < this.y; i ++){
      let tempElement = document.createElement("div");
      tempElement.className = "layer";
      tempElement.attributes.y = i;
      let layerInnerHTML = `<div class="layerinner">`;
      for(let j = 0; j < this.x*this.z; j ++){
        layerInnerHTML +=
        `<div
          class="cell" ` +
          /*cellX="${Math.floor(j/this.x)}" cellZ="${j % this.x}" + */ //In case I need it
          `onclick="
            defaultReactor.edit(${j % this.x}, ${i}, ${Math.floor(j/this.x)}, document.getElementById('idpicker').value);
            defaultReactor.updateDOM(reactorLayers);
          "
        >
          ${this.contents[i][j % this.x][Math.floor(j/this.x)]}
        </div>`;
        //Todo: optimize the crap out of this as its being run several hundred times.
      }
      layerInnerHTML += "</div>";
      tempElement.innerHTML = layerInnerHTML;
      reactorLayers.appendChild(tempElement);
    }
    document.getElementById("reactorName").value = this.name;
  }

  export(){
    //Generates and then saves the JSON for the reactor. Format can just be read off the code.
    download(
      document.getElementById("reactorName").value./*TODO: NEEDS BETTER SANITIZING*/replaceAll("/", "").replaceAll(".", "") + ".json",
      `{
        "readme":"Hello! You appear to have tried to open this JSON file with a text editor. You shouldn't be doing that as it's raw JSON which makes no sense. Please open this using the website at https://balam314.github.io/Einsteinium/index.html",
        "READMEALSO":"This is the data storage file for a NuclearCraft fission reactor generated with Einsteinium.",
        "content": ` + JSON.stringify(this.contents) + `,
        "metadata":{
          "version":"${VERSION}",
          "dimensions":[${this.x},${this.y},${this.z}],
          "name": "${this.name}",
          "validationCode": "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf."
        }
      }`
    );
  }
  exportToBG(){
    //Dire, what have you done?! BG strings are a **mess**.
    let exportString = `
    {
      stateIntArray:[I;1,2,2,1,2,1,1,2],
      dim:0,
      posIntArray:[I;256,65792,257,65793,0,65536,1,65537],
      startPos:{X:0,Y:0,Z:0},
      mapIntState: [
        {mapSlot:1s,mapState:{Name:"nuclearcraft:cell_block"}},
        {mapSlot:2s,mapState:{Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"}},
        {mapSlot:2s,mapState:{Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"}},
        {mapSlot:1s,mapState:{Name:"nuclearcraft:cell_block"}},
        {mapSlot:2s,mapState:{Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"}},
        {mapSlot:1s,mapState:{Name:"nuclearcraft:cell_block"}},
        {mapSlot:1s,mapState:{Name:"nuclearcraft:cell_block"}},
        {mapSlot:2s,mapState:{Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"}}
      ],
      endPos:{X:1,Y:1,Z:1}
    }
    `;
    console.error("Not yet implemented.");
    return exportString;
  }

  getAdjacentCells(x, y, z){
    //Does what it says.
    let adjacentCells = 0;
    adjacentCells += (gna(this.contents, y + 1, x, z) == 1);
    adjacentCells += (gna(this.contents, y, x + 1, z) == 1);
    adjacentCells += (gna(this.contents, y, x, z + 1) == 1);
    adjacentCells += (gna(this.contents, y - 1, x, z) == 1);
    adjacentCells += (gna(this.contents, y, x - 1, z) == 1);
    adjacentCells += (gna(this.contents, y, x, z - 1) == 1);
    return adjacentCells;
  }

  getAdjacentModerators(x, y, z){
    //Also does what it says.
    let adjacentModerators = 0;
    adjacentModerators += (gna(this.contents, y + 1, x, z) == 17);
    adjacentModerators += (gna(this.contents, y, x + 1, z) == 17);
    adjacentModerators += (gna(this.contents, y, x, z + 1) == 17);
    adjacentModerators += (gna(this.contents, y - 1, x, z) == 17);
    adjacentModerators += (gna(this.contents, y, x - 1, z) == 17);
    adjacentModerators += (gna(this.contents, y, x, z - 1) == 17);
    return adjacentModerators;
  }

  getDistantAdjacentCells(x, y, z){
    /*Nuclearcraft, why. I get the need for realism but this makes it so much more complicated!!.
    Basically, any cells that are separated from a cell by only 4 or less moderator blocks are treated as adjacent.
    This is because IRL this causes neutron flux to be shared.
    It makes the logic far more complicated.
    */
    let adjacentCells = 0;
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y + i, x, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++; break;
      } else if(currentCell == 17){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x + i, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++; break;
      } else if(currentCell == 17){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x, z + i);
      if(currentCell == 1){
        adjacentCells ++; break;
      } else if(currentCell == 17){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y - i, x, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++; break;
      } else if(currentCell == 17){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x - i, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++; break;
      } else if(currentCell == 17){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x, z - i);
      if(currentCell == 1 && i > 1){
        adjacentCells ++; break;
      } else if(currentCell == 17){
        continue;
      } else {
        break;
      }
    }
    return adjacentCells;
  }

  calculateStats(){
    let totalHeat = 0;
    let totalCooling = 0;
    for(var y in this.contents){
      for(var x in this.contents[y]){
        for(var z in this.contents[y][x]){
          const ccell = this.contents[y][x][z];
          var cellsCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          cellsCount[ccell] ++;
          if(ccell == 1){
            let adjacentCells = this.getAdjacentCells(parseInt(x), parseInt(y), parseInt(z));
            adjacentCells += this.getDistantAdjacentCells(parseInt(x), parseInt(y), parseInt(z));
            let adjacentModerators = this.getAdjacentModerators(parseInt(x), parseInt(y), parseInt(z));
            let heatMultiplier = (adjacentCells + 1) * (adjacentCells + 2) / 2;
            heatMultiplier += adjacentModerators * (settings.moderatorExtraHeat/6) * (adjacentCells + 1);//also weird neutron flux thing
            totalHeat += baseHeat * heatMultiplier;
            console.log(adjacentCells, adjacentModerators, heatMultiplier);
          } else if(ccell > 1 && ccell < 17){
            totalCooling -= settings.coolers[ccell];
          }
        }
      }
    }
    return {"heatgen":totalHeat, "cooling":totalCooling, "cellcount": cellsCount};
  }
}

function download(filename, text) {
  //Self explanatory.
  var temp2 = document.createElement('a');
  temp2.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  temp2.setAttribute('download', filename);
  temp2.style.display = 'none';
  document.body.appendChild(temp2);
  temp2.click();
  document.body.removeChild(temp2);
}

var baseHeat = 18;

var uploadButton = document.getElementById('uploadButton');
uploadButton.type = 'file';
uploadButton.onchange = function(e){
   var file = e.target.files[0];
   var reader = new FileReader();
   reader.readAsText(file);
   reader.onload = function(readerEvent){
      var content = readerEvent.target.result;
      console.log(content);
      loadReactor(content);
   }
}

function loadReactor(data){
  try {
    var x = JSON.parse(data);
    // First some validation to make sure the data is valid.
    console.assert(x.metadata.version.match(/[1-9].[0.9].[0-9]/gi));
    //hehe VV
    console.assert(x.metadata.version == "1.0.2" || x.metadata.version == "1.0.1" || x.metadata.version == "1.0.0" || x.metadata.validationCode == "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.");
    if(x.metadata.version != VERSION){
      console.warn("Loading JSON file with a different data version.");
    }

    //The data's valid, load it now..
    defaultReactor = new Reactor(x.metadata.dimensions[0], x.metadata.dimensions[1], x.metadata.dimensions[2]);
    defaultReactor.contents = x.content;
    defaultReactor.name = x.metadata.name;
    console.assert(defaultReactor.validate());//TODO: if this fails reload a reactor.
    document.getElementById("x_input").value = x.metadata.dimensions[0];
    document.getElementById("y_input").value = x.metadata.dimensions[1];
    document.getElementById("z_input").value = x.metadata.dimensions[2];
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


document.getElementById("title").innerHTML = "<strong>Einsteinium</strong> alpha v"+VERSION+": editing ";
console.log("%cWelcome to Einsteinium!", "font-size: 50px; color: blue");
console.log("Version Alpha v" + VERSION);
console.log("Einsteinium is a tool to help you build NuclearCraft fission reactors.");
console.warn("Warning: Einsteinium is currently in Alpha! This means most features aren't implemented, it may or may not be usable, and you are expected to read the code to get full use out of it.");
console.warn("There will also be bugs everywhere.");
