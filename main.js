




/**
Block IDs:
Air: 0
Fuel Cell: 1
Water Cooler: 2

Cryotheum Cooler: 11

Beryllium Moderator: 18

*/
const VERSION = "1.1.1";

var idmappings = {
  0: "Air",
  1: "Fuel Cell",
  2: "Water Cooler",
  3: "Redstone Cooler",
  4: "Quartz Cooler",
  5: "Gold Cooler",
  6: "Glowstone Cooler",
  7: "Lapis Cooler",
  8: "Diamond Cooler",
  9: "Helium Cooler",
  10: "Enderium Cooler",
  11: "Cryotheum Cooler",
  12: "Iron Cooler",
  13: "Emerald Cooler",
  14: "Copper Cooler",
  15: "Tin Cooler",
  16: "Magnesium Cooler",
  17: "Graphite Moderator"
}

var settings = {
  "heatMult": 1.0,
  "neutronRadiationReach": 4,
  "maxReactorSize": 10,
  "moderatorExtraHeat": 2,
  "moderatorExtraPower": 1,
  "coolers": [0, 0, 60, 90, 90, 120, 130, 120, 150, 140, 120, 160, 80, 160, 80, 120, 110]
};

var hardSettings = {
  "defaultName": "Unnamed Reactor"
};

//Util functions
function cp(data){
  return JSON.parse(JSON.stringify(data));
}
function gna(arr, x, y, z){//Safely get a value from nested arrays, have to use this until we get the .? operator in browsers :(
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
function constrain(a, n, x){
  if(isNaN(a)){
    return 0;
  } else {
    a *= 1;
    n *= 1;
    x *= 1;
  }
  if(a < n){
    return n;
  } else if (a > x){
    return x;
  } else {
    return a;
  }
}
function checkNaN(value, deefalt){
  return isNaN(value) ? deefalt : value;
}

class Reactor {
  constructor(x, y, z){
    this.contents = [];
    this.valids = [];
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
    let temp11 = [];
    let temp2 = [];
    let temp22 = [];
    for(let i = 0; i < this.z; i ++){
      temp1.push(0);
      temp11.push(false);
    }
    for(let i = 0; i < this.x; i ++){
      temp2.push(cp(temp1));
      temp22.push(cp(temp11));
    }
    for(let i = 0; i < this.y; i ++){
      this.contents.push(cp(temp2));
      this.valids.push(cp(temp22));
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
      this.valids[y][x][z] = (id == 1);
    } catch(err){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    this.update();
  }

  update(){
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateCellsValidity();
    //sure why not
    this.updateDOM(reactorLayers);
    this.updateStats(statspanel);
  }

  validate(){
    try {
      console.assert(this.contents.length == this.y);
      for(var x of this.contents){
        console.assert(x.length == this.x);
        for(var y of x){
          console.assert(y.length == this.z);
          for(var cell of y){
            console.assert(typeof cell == "number");
            console.assert(cell >= 0 && cell <= 18);
          }
        }
      }
      return true;
    } catch(err){}
    return false;
  }

  getDOMCell(reactorLayers, x, y, z){
    return reactorLayers.childNodes[y].firstChild.childNodes[(z*this.x) + x];
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
      let layerInnerHTML = `<div class="layerinner" onload="squarifyCells(this);">`;
      for(let j = 0; j < this.x*this.z; j ++){
        let cX = j % this.x;
        let cZ = Math.floor(j/this.x);
        layerInnerHTML +=
        `<div
          class="cell${this.valids[i][cX][cZ] ? "" : " invalid"}"
          ` + /*cellX="${Math.floor(j/this.x)}" cellZ="${j % this.x}" + */ `
          onclick="defaultReactor.edit(${cX}, ${i}, ${cZ}, getSelectedId());"
          oncontextmenu="defaultReactor.edit(${cX}, ${i}, ${cZ}, 0);return false;"
          style="grid-row:${cZ + 1}; grid-column:${cX + 1};"
          title="${idmappings[this.contents[i][cX][cZ]]}"
        >
          <img src="assets/${this.contents[i][cX][cZ]}.png" alt="${this.contents[i][cX][cZ]}" width=100%>
        </div>`;
      }
      layerInnerHTML += "</div>";
      tempElement.innerHTML = layerInnerHTML;
      reactorLayers.appendChild(tempElement);
    }
    document.getElementById("reactorName").value = this.name;
    squarifyCells(reactorLayers);
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
    adjacentModerators += ((gna(this.contents, y + 1, x, z) == 17 || gna(this.contents, y + 1, x, z) == 18) && (gna(this.valids, y + 1, x, z) != false));
    adjacentModerators += ((gna(this.contents, y, x + 1, z) == 17 || gna(this.contents, y, x + 1, z) == 18) && (gna(this.valids, y, x + 1, z) != false));
    adjacentModerators += ((gna(this.contents, y, x, z + 1) == 17 || gna(this.contents, y, x, z + 1) == 18) && (gna(this.valids, y, x, z + 1) != false));
    adjacentModerators += ((gna(this.contents, y - 1, x, z) == 17 || gna(this.contents, y - 1, x, z) == 18) && (gna(this.valids, y - 1, x, z) != false));
    adjacentModerators += ((gna(this.contents, y, x - 1, z) == 17 || gna(this.contents, y, x - 1, z) == 18) && (gna(this.valids, y, x - 1, z) != false));
    adjacentModerators += ((gna(this.contents, y, x, z - 1) == 17 || gna(this.contents, y, x, z - 1) == 18) && (gna(this.valids, y, x, z - 1) != false));
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
        adjacentCells ++;
        break;
      } else if(currentCell == 17 || currentCell == 18){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x + i, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++;
        break;
      } else if(currentCell == 17 || currentCell == 18){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x, z + i);
      if(currentCell == 1 && i > 1){
        adjacentCells ++;
        break;
      } else if(currentCell == 17 || currentCell == 18){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y - i, x, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++;
        break;
      } else if(currentCell == 17 || currentCell == 18){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x - i, z);
      if(currentCell == 1 && i > 1){
        adjacentCells ++;
        break;
      } else if(currentCell == 17 || currentCell == 18){
        continue;
      } else {
        break;
      }
    }
    for(let i = 1; i <= settings.neutronRadiationReach; i ++){
      let currentCell = gna(this.contents, y, x, z - i);
      if(currentCell == 1 && i > 1){
        adjacentCells ++;
        break;
      } else if(currentCell == 17 || currentCell == 18){
        continue;
      } else {
        break;
      }
    }
    return adjacentCells;
  }

  getAdjacentCell(x, y, z, id){
    //Gets the number of a specified adjacent cell.
    let adjacentCells = 0;
    adjacentCells += (gna(this.contents, y + 1, x, z) == id && (gna(this.valids, y + 1, x, z) != false));
    adjacentCells += (gna(this.contents, y, x + 1, z) == id && (gna(this.valids, y, x + 1, z) != false));
    adjacentCells += (gna(this.contents, y, x, z + 1) == id && (gna(this.valids, y, x, z + 1) != false));
    adjacentCells += (gna(this.contents, y - 1, x, z) == id && (gna(this.valids, y - 1, x, z) != false));
    adjacentCells += (gna(this.contents, y, x - 1, z) == id && (gna(this.valids, y, x - 1, z) != false));
    adjacentCells += (gna(this.contents, y, x, z - 1) == id && (gna(this.valids, y, x, z - 1) != false));
    return adjacentCells;
  }

  tinCoolerValid(x, y, z){
    //becuase the Tin Cooler wanted to be sPeCiAl.
    return (gna(this.contents, y + 1, x, z) == 7)&&
    (gna(this.contents, y - 1, x, z) == 7)||
    (gna(this.contents, y, x + 1, z) == 7)&&
    (gna(this.contents, y, x - 1, z) == 7)||
    (gna(this.contents, y, x, z + 1) == 7)&&
    (gna(this.contents, y, x, z - 1) == 7);
  }

  calculateStats(){
    let totalHeat = 0;
    let totalCooling = 0;
    let totalEnergyPerTick = 0;
    var cellsCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(var y in this.contents){
      for(var x in this.contents[y]){
        for(var z in this.contents[y][x]){
          const ccell = this.contents[y][x][z];
          const pos = {x: parseInt(x), y: parseInt(y), z: parseInt(z)};
          cellsCount[ccell] ++;
          if(ccell == 1){
            let adjacentCells = this.getAdjacentCells(pos.x, pos.y, pos.z);
            let distantAdjacentCells = this.getDistantAdjacentCells(pos.x, pos.y, pos.z);
            let adjacentModerators = this.getAdjacentModerators(pos.x, pos.y, pos.z);
            let heatMultiplier = (adjacentCells + distantAdjacentCells + 1) * (adjacentCells + distantAdjacentCells + 2) / 2;
            let energyMultiplier = adjacentCells + distantAdjacentCells + 1;
            energyMultiplier += adjacentModerators * (settings.moderatorExtraPower/6) * (adjacentCells + distantAdjacentCells + 1);
            heatMultiplier += adjacentModerators * (settings.moderatorExtraHeat/6) * (adjacentCells + distantAdjacentCells + 1);//also weird neutron flux thing
            totalHeat += baseHeat * heatMultiplier;
            totalEnergyPerTick += basePower * energyMultiplier;
            this.getDOMCell(reactorLayers, pos.x, pos.y, pos.z).title += `
Adjacent Cells: ${adjacentCells}
${distantAdjacentCells ? ("Distant \"adjacent\" cells: " + distantAdjacentCells + "\n") : ""}\
Adjacent Moderators: ${adjacentModerators}
Heat Multiplier: ${heatMultiplier * 100}%
Energy Multiplier: ${energyMultiplier * 100}%`;
            console.log(this.getDOMCell(reactorLayers, pos.x, pos.y, pos.z));
          } else if(ccell > 1 && ccell < 17){
            if(this.valids[pos.y][pos.x][pos.z]){
              totalCooling -= settings.coolers[ccell];
            }
          }
        }
      }
    }
    return {"heatgen":totalHeat, "cooling":totalCooling, "power": totalEnergyPerTick, "cellcount": cellsCount};
  }

  updateCellsValidity(){
    for(var y in this.contents){
      for(var x in this.contents[y]){
        for(var z in this.contents[y][x]){
          const ccell = this.contents[y][x][z];
          const pos = {x: parseInt(x), y: parseInt(y), z: parseInt(z)};
          switch(ccell){
            case 1:
            this.valids[pos.y][pos.x][pos.z] = true;
            break;
            case 2:
            if(this.getAdjacentCells(pos.x, pos.y, pos.z) >= 1 || this.getAdjacentModerators(pos.x, pos.y, pos.z) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 3:
            if(this.getAdjacentCells(pos.x, pos.y, pos.z) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 4:
            if(this.getAdjacentModerators(pos.x, pos.y, pos.z) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 5:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, 2) >= 1 && this.getAdjacentCell(pos.x, pos.y, pos.z, 2) >= 3){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 6:
            if(this.getAdjacentModerators(pos.x, pos.y, pos.z) >= 2){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 7:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, null) >= 1 && this.getAdjacentCells(pos.x, pos.y, pos.z) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 8:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, 2) >= 1 && this.getAdjacentCell(pos.x, pos.y, pos.z, 4) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 9:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, 3) == 1 && this.getAdjacentCell(pos.x, pos.y, pos.z, null) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 10:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, null) >= 3){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 11:
              if(this.getAdjacentCells(pos.x, pos.y, pos.z) >= 2){
                this.valids[pos.y][pos.x][pos.z] = true;
              } else {
                this.valids[pos.y][pos.x][pos.z] = false;
              }
              break;
            case 12:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, 5) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 13:
            if(this.getAdjacentCells(pos.x, pos.y, pos.z) >= 1 && this.getAdjacentModerators(pos.x, pos.y, pos.z) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 14:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, 6) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 15:
            if(this.tinCoolerValid(pos.x, pos.y, pos.z)){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 16:
            if(this.getAdjacentCell(pos.x, pos.y, pos.z, null) >= 1 && this.getAdjacentModerators(pos.x, pos.y, pos.z) >= 1){
              this.valids[pos.y][pos.x][pos.z] = true;
            } else {
              this.valids[pos.y][pos.x][pos.z] = false;
            }
            break;
            case 17:case 18:
            this.valids[y][x][z] = !!(this.getAdjacentCells(pos.x, pos.y, pos.z));
            break;
            case 0:
            this.valids[pos.y][pos.x][pos.z] = true;
            break;
          }
        }
      }
    }
  }

  updateStats(DOMnode){
    let stats = this.calculateStats();
    let netHeat = stats.heatgen + stats.cooling;
    let spaceEfficiency = 1-(stats.cellcount[0] / this.x*this.y*this.z);
    let numCasings = 2*this.x*this.y + 2*this.x*this.z + 2*this.y*this.z;

    DOMnode.innerHTML = `
    <h1>Reactor Stats</h1>
    <br>
    <h2>Heat and Power</h2>
    Total heat: ${Math.round(10*stats.heatgen)/10} HU/t<br>
    Total cooling: ${Math.round(10*stats.cooling)/10} HU/t<br>
    Net heat gen: <span style="color: ${(netHeat <= 0) ? "#00FF00" : "#FF0000"}">${Math.round(10*netHeat)/10} HU/t</span><br>
    ${(netHeat > 0) ? `Meltdown time: ${Math.floor((25000*this.x*this.y*this.z)*0.05/netHeat)} s<br>` : ""}
    Max base heat: ${checkNaN(Math.floor(-stats.cooling/(stats.heatgen/baseHeat)), "0")}<br>
    Efficiency: ${checkNaN(Math.round(1000*stats.power/(stats.cellcount[1]*basePower))/10, 100)}%<br>
    Total Power: ${stats.power} RF/t<br>
    Fuel Pellet Duration: ${Math.round(fuelTime/stats.cellcount[1])/20} s<br>
    Energy Per Pellet: ${checkNaN(stats.power * (fuelTime/stats.cellcount[1]), "No")} RF<br>
    <h2>Materials</h2>
    Casings: ${numCasings}<br>
    Fuel cells: ${stats.cellcount[1]}
    <h3>Coolers</h3>
    ${(stats.cellcount[2]) ? idmappings[2] + ": " + stats.cellcount[2] + "<br>" : ""}
    ${(stats.cellcount[3]) ? idmappings[3] + ": " + stats.cellcount[3] + "<br>" : ""}
    ${(stats.cellcount[4]) ? idmappings[4] + ": " + stats.cellcount[4] + "<br>" : ""}
    ${(stats.cellcount[5]) ? idmappings[5] + ": " + stats.cellcount[5] + "<br>" : ""}
    ${(stats.cellcount[6]) ? idmappings[6] + ": " + stats.cellcount[6] + "<br>" : ""}
    ${(stats.cellcount[7]) ? idmappings[7] + ": " + stats.cellcount[7] + "<br>" : ""}
    ${(stats.cellcount[8]) ? idmappings[8] + ": " + stats.cellcount[8] + "<br>" : ""}
    ${(stats.cellcount[9]) ? idmappings[9] + ": " + stats.cellcount[9] + "<br>" : ""}
    ${(stats.cellcount[10]) ? idmappings[10] + ": " + stats.cellcount[10] + "<br>" : ""}
    ${(stats.cellcount[11]) ? idmappings[11] + ": " + stats.cellcount[11] + "<br>" : ""}
    ${(stats.cellcount[12]) ? idmappings[12] + ": " + stats.cellcount[12] + "<br>" : ""}
    ${(stats.cellcount[13]) ? idmappings[13] + ": " + stats.cellcount[13] + "<br>" : ""}
    ${(stats.cellcount[14]) ? idmappings[14] + ": " + stats.cellcount[14] + "<br>" : ""}
    ${(stats.cellcount[15]) ? idmappings[15] + ": " + stats.cellcount[15] + "<br>" : ""}
    ${(stats.cellcount[16]) ? idmappings[16] + ": " + stats.cellcount[16] + "<br>" : ""}
    Moderators: ${stats.cellcount[17] + stats.cellcount[18]}
    `;
  }

}

function squarifyCells(reactorLayers){
  const z = parseInt(reactorLayers.style.getPropertyValue("--cells-z"));
  const x = parseInt(reactorLayers.style.getPropertyValue("--cells-x"));
  const cellWidth = reactorLayers.childNodes[0].firstChild.offsetWidth/x;
  const cellHeight = reactorLayers.childNodes[0].firstChild.offsetHeight/z;
  for(var reactorLayerOuter of reactorLayers.childNodes){
    let reactorLayer = reactorLayerOuter.firstChild;
    for(var cell of reactorLayer.childNodes){
      cell.style.setProperty("width", cellWidth + "px");
      cell.style.setProperty("height", cellHeight + "px");
    }
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
var basePower = 60;
var fuelTime = 144000;

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

document.body.onkeypress = e => {
  switch(e.key){
    case "0":
      selectCell(document.getElementsByClassName("hotbarcell")[18]);break;
    case "1":
      selectCell(document.getElementsByClassName("hotbarcell")[0]);break;
    case "2":
      selectCell(document.getElementsByClassName("hotbarcell")[1]);break;
    case "3":
      selectCell(document.getElementsByClassName("hotbarcell")[2]);break;
    case "4":
      selectCell(document.getElementsByClassName("hotbarcell")[3]);break;
    case "5":
      selectCell(document.getElementsByClassName("hotbarcell")[4]);break;
    case "6":
      selectCell(document.getElementsByClassName("hotbarcell")[5]);break;
    case "7":
      selectCell(document.getElementsByClassName("hotbarcell")[6]);break;
    case "8":
      selectCell(document.getElementsByClassName("hotbarcell")[7]);break;
    case "9":
      selectCell(document.getElementsByClassName("hotbarcell")[8]);break;
    case "q":
      selectCell(document.getElementsByClassName("hotbarcell")[9]);break;
    case "w":
      selectCell(document.getElementsByClassName("hotbarcell")[10]);break;
    case "e":
      selectCell(document.getElementsByClassName("hotbarcell")[11]);break;
    case "r":
      selectCell(document.getElementsByClassName("hotbarcell")[12]);break;
    case "t":
      selectCell(document.getElementsByClassName("hotbarcell")[13]);break;
    case "y":
      selectCell(document.getElementsByClassName("hotbarcell")[14]);break;
    case "u":
      selectCell(document.getElementsByClassName("hotbarcell")[15]);break;
    case "i":
      selectCell(document.getElementsByClassName("hotbarcell")[16]);break;
    case "o":
      selectCell(document.getElementsByClassName("hotbarcell")[17]);break;
  }
}

function selectCell(cell){
  for(var x of document.getElementsByClassName("hotbarcell")){
    x.classList.remove("hotbarcellselected");
  }
  cell.classList.add("hotbarcellselected");
}

function getSelectedId(){
  try {
    let calcedId = document.getElementsByClassName("hotbarcellselected")[0].childNodes[1].src.split("/").pop().split(".")[0];
    //who said the code had to be readable
    if(typeof calcedId == "number" || !isNaN(parseInt(calcedId))){
      return calcedId;
    }
  } catch(err){

  }
  return 0;
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

    //The data's probably valid, load it now..
    let tempReactor = new Reactor(x.metadata.dimensions[0], x.metadata.dimensions[1], x.metadata.dimensions[2]);
    tempReactor.contents = x.content;
    tempReactor.name = x.metadata.name;
    console.assert(tempReactor.validate());

    //Validation passed, its good.
    defaultReactor = tempReactor;
    document.getElementById("x_input").value = x.metadata.dimensions[0];
    document.getElementById("y_input").value = x.metadata.dimensions[1];
    document.getElementById("z_input").value = x.metadata.dimensions[2];
    defaultReactor.update();
  } catch(err){
    loadNCReactorPlanner(data, "Imported Reactor");
  }
}

function loadNCReactorPlanner(rawData, filename){

  let ncmappings = {
    "Redstone": 3,
    "Glowstone": 6,
    "Helium": 9,
    "Iron": 12,
    "Tin": 15,
    "Beryllium": 18,
    "FuelCell": 1,
    "Quartz": 4,
    "Lapis": 7,
    "Enderium": 10,
    "Emerald": 13,
    "Magnesium": 16,
    "Water": 2,
    "Gold": 5,
    "Diamond": 8,
    "Cryotheum": 11,
    "Copper": 14,
    "Graphite": 17,
  };
  try {
    let data = JSON.parse(rawData);
    console.assert(typeof data.SaveVersion.Build == "number");
    console.assert(data.CompressedReactor);


    let tempReactor = new Reactor(data.InteriorDimensions.X, data.InteriorDimensions.Y, data.InteriorDimensions.Z)
    for(var x of ["Redstone","Glowstone","Helium","Iron","Tin","Beryllium","FuelCell","Quartz","Lapis","Enderium","Emerald","Magnesium","Water","Gold","Diamond","Cryotheum","Copper","Graphite"]){
        if(data.CompressedReactor[x] instanceof Array){
          for(var pos of data.CompressedReactor[x]){
            tempReactor.contents[pos.Y - 1][pos.X - 1][pos.Z - 1] = ncmappings[x];
          }
        }
    }
    tempReactor.name = filename;
    console.assert(tempReactor.validate());

    defaultReactor = tempReactor;
    document.getElementById("x_input").value = data.InteriorDimensions.X;
    document.getElementById("y_input").value = data.InteriorDimensions.X;
    document.getElementById("z_input").value = data.InteriorDimensions.X;
    defaultReactor.update();
  } catch(err){
    console.error("Invalid JSON!", err);
  }
}

var reactorLayers = document.getElementById("reactorlayers");
var statspanel = document.getElementById('statspanel');

var defaultReactor;
function regenReactor(){
  defaultReactor = new Reactor(
    document.getElementById("x_input").value,
    document.getElementById("y_input").value,
    document.getElementById("z_input").value);

  defaultReactor.update();
}
regenReactor();


document.getElementById("title").innerHTML = "<strong>Einsteinium</strong> alpha v"+VERSION+": editing ";
console.log("%cWelcome to Einsteinium!", "font-size: 50px; color: blue");
console.log("Version Alpha v" + VERSION);
console.log("Einsteinium is a tool to help you build NuclearCraft fission reactors.");
console.warn("Warning: Einsteinium is currently in Alpha! This means most features aren't implemented, it may or may not be usable, and you are expected to read the code to get full use out of it.");
console.warn("There will also be bugs everywhere.");
