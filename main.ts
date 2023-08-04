
const reactorName = getElement("reactorName", HTMLInputElement);
const uploadButton = getElement("uploadButton", HTMLInputElement);
const hotbarCells = [...document.querySelectorAll(".hotbarcell")] as HTMLDivElement[];
const x_input = getElement("x_input", HTMLInputElement);
const y_input = getElement("y_input", HTMLInputElement);
const z_input = getElement("z_input", HTMLInputElement);
const reactorLayers = getElement("reactorLayers", HTMLDivElement);
const statsPanel = getElement("statsPanel", HTMLDivElement);
const titleText = getElement("title", HTMLDivElement);

type CellID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18

const VERSION = "2.0.0";

const idmappings:Record<CellID, string> = {
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
  17: "Graphite Moderator",
  18: "Beryllium Moderator"
}

const tooltipmappings:Record<CellID, string> = {
  0: "Air",
  1: "Fuel Cell",
  2: "Water Cooler\nRequires at least one fuel cell or active moderator",
  3: "Redstone Cooler\nRequires at least one fuel cell",
  4: "Quartz Cooler\nRequires at least one active moderator",
  5: "Gold Cooler\nRequires at least one redstone cooler and water cooler",
  6: "Glowstone Cooler\nRequires at least two moderators",
  7: "Lapis Cooler\nRequires at least one fuel cell and casing",
  8: "Diamond Cooler\nRequires at least one water cooler and quartz cooler",
  9: "Helium Cooler\nRequires exactly one redstone cooler and one reactor casing",
  10: "Enderium Cooler\nMust be placed in a corner",
  11: "Cryotheum Cooler\nRequires at least two fuel cells",
  12: "Iron Cooler\nRequires at least one gold cooler",
  13: "Emerald Cooler\nRequires at least one moderator and fuel cell",
  14: "Copper Cooler\nRequires at least one glowstone cooler",
  15: "Tin Cooler\nRequires two lapis coolers on opposite sides",
  16: "Magnesium Cooler\nRequires at least one casing and moderator",
  17: "Graphite Moderator",
  18: "Beryllium Moderator"
}

const blockIDMappings:Record<CellID, string> = {
  0: 'Properties:{type:"casing"},Name:"nuclearcraft:fission_block"',
  1: 'Name:"nuclearcraft:cell_block"',
  2: 'Properties:{type:"water"},Name:"nuclearcraft:cooler"',
  3: 'Properties:{type:"redstone"},Name:"nuclearcraft:cooler"',
  4: 'Properties:{type:"quartz"},Name:"nuclearcraft:cooler"',
  5: 'Properties:{type:"gold"},Name:"nuclearcraft:cooler"',
  6: 'Properties:{type:"glowstone"},Name:"nuclearcraft:cooler"',
  7: 'Properties:{type:"lapis"},Name:"nuclearcraft:cooler"',
  8: 'Properties:{type:"diamond"},Name:"nuclearcraft:cooler"',
  9: 'Properties:{type:"helium"},Name:"nuclearcraft:cooler"',
  10: 'Properties:{type:"enderium"},Name:"nuclearcraft:cooler"',
  11: 'Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"',
  12: 'Properties:{type:"iron"},Name:"nuclearcraft:cooler"',
  13: 'Properties:{type:"emerald"},Name:"nuclearcraft:cooler"',
  14: 'Properties:{type:"copper"},Name:"nuclearcraft:cooler"',
  15: 'Properties:{type:"tin"},Name:"nuclearcraft:cooler"',
  16: 'Properties:{type:"magnesium"},Name:"nuclearcraft:cooler"',
  17: 'Properties:{type:"graphite"},Name:"nuclearcraft:ingot_block"',
  18: 'Properties:{type:"beryllium"},Name:"nuclearcraft:ingot_block"'
};

let settings = {
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
function getElement<T extends typeof HTMLElement>(id:string, type:T){
	const element = <unknown>document.getElementById(id);
	if(element instanceof type) return element as T["prototype"];
	else if(element instanceof HTMLElement) throw new Error(`Element with id was fetched as type ${type}, but was of type ${element.constructor.name}`);
	else throw new Error(`Element with id ${id} does not exist`);
}
function cp<T>(data:T){
  return JSON.parse(JSON.stringify(data));
}
function gna<T>(arr:T[][][], x:number, y:number, z:number){//Safely get a value from nested arrays, have to use this until we get the .? operator in browsers :(
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
function constrain(val:number, min:number, max:number){
  if(isNaN(val)) return 0;
  if(val < min){
    return min;
  } else if (val > max){
    return max;
  } else {
    return val;
  }
}
function checkNaN(value:number, deefalt:number){
  return isNaN(value) ? deefalt : value;
}

class Reactor {
  contents: number[][][];
  valids: boolean[][][];
  x:number; y:number; z:number;
  name:string;
  constructor(x:number, y:number, z:number){
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

    this.contents = Array.from({length: y}, () =>
      Array.from({length: x}, () => 
        Array.from({length: z}, () => 0)
      )
    );
    this.valids = Array.from({length: y}, () =>
      Array.from({length: x}, () => 
        Array.from({length: z}, () => false)
      )
    );
  }

  edit(x:number, y:number, z:number, id:number){
    //Self explanatory.
    if(isNaN(id)){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    try {
    //TODO bad
      this.contents[y][x][z] = id;
      this.valids[y][x][z] = (id == 1);
    } catch(err){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    this.update();
    return true;
  }

  update(){
    //TODO wtf
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateCellsValidity();
    //sure why not
    this.updateDOM(reactorLayers);
    this.updateStats(statsPanel);
  }

  validate(){
    try {
      console.assert(this.contents.length == this.y);
      for(let x of this.contents){
        console.assert(x.length == this.x);
        for(let y of x){
          console.assert(y.length == this.z);
          for(let cell of y){
            console.assert(typeof cell == "number");
            console.assert(cell >= 0 && cell <= 18);
          }
        }
      }
      return true;
    } catch(err){}
    return false;
  }

  getDOMCell(reactorLayers:HTMLDivElement, x:number, y:number, z:number){
    return reactorLayers.childNodes[y].firstChild!.childNodes[(z*this.x) + x] as HTMLDivElement;
  }

  updateDOM(reactorLayers:HTMLDivElement){
    reactorLayers.innerHTML = "";
    reactorLayers.style.setProperty("--cells-z", this.z.toString());
    reactorLayers.style.setProperty("--cells-x", this.x.toString());
    //So glad this worked ^^

    //This code is a bit messy, it generates the html for the reactor layer editor.
    for(let i = 0; i < this.y; i ++){
      let tempElement = document.createElement("div");
      tempElement.className = "layer";
      tempElement.setAttribute("y", i.toString()); //TODO what is this for?
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
          title="${tooltipmappings[this.contents[i][cX][cZ] as keyof typeof tooltipmappings]}"
        >
          <img src="assets/${this.contents[i][cX][cZ]}.png" alt="${this.contents[i][cX][cZ]}" width=100%>
        </div>`;
      }
      layerInnerHTML += "</div>";
      tempElement.innerHTML = layerInnerHTML;
      reactorLayers.appendChild(tempElement);
    }
    reactorName.value = this.name;
    squarifyCells(reactorLayers);
  }

  export(){
    //Generates and then saves the JSON for the reactor. Format can just be read off the code.
    download(
      this.name.replace(/[./\\;"?]/, "_") + ".json",
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

  exportToBG(includeCasings:boolean){
    //Dire, what have you done?! BG strings are a **mess**.
    if(includeCasings){
      console.warn("includeCasings is not yet implemented.");//TODO
    }
    //TODO cleanup
    function getStateIntArray(that:Reactor){
      let cells:number[] = [];
      for(let layer of that.contents){
        for(let column of layer){
          for(let cell of column){
            if(cell){cells.push(cell);}
          }
        }
      }
      return cells;
    }
    function getPosIntArray(that:Reactor){
      let poss:number[] = [];
      for(let y in that.contents){
        for(let x in that.contents[y]){
          for(let z in that.contents[y][x]){
            if(that.contents[y][x][z] != 0){
              poss.push(65536*(+x) + 256*(+y) + 1*(+z));
            }
          }
        }
      }
      return poss;
    }
    function getMapIntState(that:Reactor){
      let states:string[] = [];
      for(let y in that.contents){
        for(let x in that.contents[y]){
          for(let z in that.contents[y][x]){
            if(that.contents[y][x][z] != 0){
              states.push(`{mapSlot:${that.contents[y][x][z]}s,mapState:{${blockIDMappings[that.contents[y][x][z] as keyof typeof blockIDMappings]}}}`);
            }
          }
        }
      }
      return states;
    }

    let exportString = `{stateIntArray:[I;${getStateIntArray(this).join(",")}],dim:0,posIntArray:[I;${getPosIntArray(this).join(",")}],startPos:{X:0,Y:0,Z:0},mapIntState:[${getMapIntState(this).join(",")}],endPos:{X:${this.x - 1},Y:${this.y - 1},Z:${this.z - 1}}}`;
    //It just works.
    return exportString;
  }

  getAdjacentCells(x:number, y:number, z:number){
    //Does what it says.
    let adjacentCells = 0;
    adjacentCells += +(gna(this.contents, y + 1, x, z) == 1);
    adjacentCells += +(gna(this.contents, y, x + 1, z) == 1);
    adjacentCells += +(gna(this.contents, y, x, z + 1) == 1);
    adjacentCells += +(gna(this.contents, y - 1, x, z) == 1);
    adjacentCells += +(gna(this.contents, y, x - 1, z) == 1);
    adjacentCells += +(gna(this.contents, y, x, z - 1) == 1);
    return adjacentCells;
  }

  getAdjacentModerators(x:number, y:number, z:number){
    //Also does what it says.
    let adjacentModerators = 0;
    adjacentModerators += +((gna(this.contents, y + 1, x, z) == 17 || gna(this.contents, y + 1, x, z) == 18) && (gna(this.valids, y + 1, x, z) != false));
    adjacentModerators += +((gna(this.contents, y, x + 1, z) == 17 || gna(this.contents, y, x + 1, z) == 18) && (gna(this.valids, y, x + 1, z) != false));
    adjacentModerators += +((gna(this.contents, y, x, z + 1) == 17 || gna(this.contents, y, x, z + 1) == 18) && (gna(this.valids, y, x, z + 1) != false));
    adjacentModerators += +((gna(this.contents, y - 1, x, z) == 17 || gna(this.contents, y - 1, x, z) == 18) && (gna(this.valids, y - 1, x, z) != false));
    adjacentModerators += +((gna(this.contents, y, x - 1, z) == 17 || gna(this.contents, y, x - 1, z) == 18) && (gna(this.valids, y, x - 1, z) != false));
    adjacentModerators += +((gna(this.contents, y, x, z - 1) == 17 || gna(this.contents, y, x, z - 1) == 18) && (gna(this.valids, y, x, z - 1) != false));
    return adjacentModerators;
  }

  getDistantAdjacentCells(x:number, y:number, z:number){
    /*Nuclearcraft, why. I get the need for realism but this makes it so much more complicated!!.
    Basically, any cells that are separated from a cell by only 4 or less moderator blocks are treated as adjacent.
    This is because IRL this causes neutron flux to be shared.
    It makes the logic far more complicated.
    */
    //TODO aaaaaaaaaa, commit [x, y, z]
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

  getAdjacentCell(x:number, y:number, z:number, id:number | null){
    //Gets the number of a specified adjacent cell.
    let adjacentCells = 0;
    adjacentCells += +(gna(this.contents, y + 1, x, z) == id && (gna(this.valids, y + 1, x, z) != false));
    adjacentCells += +(gna(this.contents, y, x + 1, z) == id && (gna(this.valids, y, x + 1, z) != false));
    adjacentCells += +(gna(this.contents, y, x, z + 1) == id && (gna(this.valids, y, x, z + 1) != false));
    adjacentCells += +(gna(this.contents, y - 1, x, z) == id && (gna(this.valids, y - 1, x, z) != false));
    adjacentCells += +(gna(this.contents, y, x - 1, z) == id && (gna(this.valids, y, x - 1, z) != false));
    adjacentCells += +(gna(this.contents, y, x, z - 1) == id && (gna(this.valids, y, x, z - 1) != false));
    return adjacentCells;
  }

  tinCoolerValid(x:number, y:number, z:number){
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
    let cellsCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(let y in this.contents){
      for(let x in this.contents[y]){
        for(let z in this.contents[y][x]){
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
    for(let y in this.contents){
      for(let x in this.contents[y]){
        for(let z in this.contents[y][x]){
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

  updateStats(DOMnode:HTMLDivElement){
    let stats = this.calculateStats();
    let netHeat = stats.heatgen + stats.cooling;
    let spaceEfficiency = 1-(stats.cellcount[0]/(this.x*this.y*this.z));
    let numCasings = 2*this.x*this.y + 2*this.x*this.z + 2*this.y*this.z;

    function sum(arr:number[]){
      let sum = 0;
      for(let x of arr){
        sum += x;
      }
      return sum;
    }
    DOMnode.innerHTML = `
    <h1>Reactor Stats</h1>
    <br>
    <h2>Heat and Power</h2>
    Total heat: ${Math.round(10*stats.heatgen)/10} HU/t<br>
    Total cooling: ${Math.round(10*stats.cooling)/10} HU/t<br>
    Net heat gen: <${(netHeat <= 0) ? "span" : "strong"} style="color: ${(netHeat <= 0) ? "#00FF00" : "#FF0000"}">${Math.round(10*netHeat)/10} HU/t</${(netHeat <= 0) ? "span" : "strong"}><br>
    ${(netHeat > 0) ? `Meltdown time: ${Math.floor((25000*this.x*this.y*this.z)*0.05/netHeat)} s<br>` : ""}
    Max base heat: ${checkNaN(Math.floor(-stats.cooling/(stats.heatgen/baseHeat)), 0)}<br>
    Efficiency: ${checkNaN(Math.round(1000*stats.power/(stats.cellcount[1]*basePower))/10, 100)}%<br>
    Total Power: ${stats.power} RF/t<br>
    Fuel Pellet Duration: ${Math.round(fuelTime/stats.cellcount[1])/20} s<br>
    Energy Per Pellet: ${checkNaN(stats.power * (fuelTime/stats.cellcount[1]), 0)} RF<br>
    <h2>Materials</h2>
    Casings: ${numCasings}<br>
    Fuel cells: ${stats.cellcount[1]}<br>
    Moderators: ${stats.cellcount[17] + stats.cellcount[18]}<br>
    Total coolers: ${sum(stats.cellcount.slice(2, 17))}<br>
    Space Efficiency: ${spaceEfficiency}%
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
    `;
  }

}

function squarifyCells(reactorLayers:HTMLDivElement){
  const z = parseInt(reactorLayers.style.getPropertyValue("--cells-z"));
  const x = parseInt(reactorLayers.style.getPropertyValue("--cells-x"));
  const cellWidth = (reactorLayers.childNodes[0].firstChild as HTMLDivElement).offsetWidth/x;
  const cellHeight = (reactorLayers.childNodes[0].firstChild as HTMLDivElement).offsetHeight/z;
  for(let reactorLayerOuter of reactorLayers.childNodes){
    let reactorLayer = reactorLayerOuter.firstChild!;
    for(let cell of reactorLayer.childNodes as NodeListOf<HTMLDivElement>){
      cell.style.setProperty("width", cellWidth + "px");
      cell.style.setProperty("height", cellHeight + "px");
    }
  }
}

function download(filename:string, text:string){
  //Self explanatory.
  let temp2 = document.createElement('a');
  temp2.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  temp2.setAttribute('download', filename);
  temp2.style.display = 'none';
  document.body.appendChild(temp2);
  temp2.click();
  document.body.removeChild(temp2);
}

function copyToClipboard(str:string){
    //TODO navigator.clipboard.writeText
   let el = document.createElement('textarea');
   el.value = str;
   el.setAttribute('readonly', '');
   el.style.visibility = "hidden";
   document.body.appendChild(el);
   el.select();
   document.execCommand('copy');
   document.body.removeChild(el);
}

let baseHeat = 18;
let basePower = 60;
let fuelTime = 144000;

uploadButton.onchange = function(e:Event){
   let file = (e.target as HTMLInputElement).files![0];
   let reader = new FileReader();
   reader.readAsText(file);
   reader.onload = function(readerEvent){
      let content = readerEvent.target!.result;
      console.log(content);
      loadReactor(content as string);
   }
}

document.body.onkeydown = e => {
  //TODO kill the switch
  switch(e.key){
    case "0":
      selectCell(hotbarCells[18]); break;
    case "1":
      selectCell(hotbarCells[0]); break;
    case "2":
      selectCell(hotbarCells[1]); break;
    case "3":
      selectCell(hotbarCells[2]); break;
    case "4":
      selectCell(hotbarCells[3]); break;
    case "5":
      selectCell(hotbarCells[4]); break;
    case "6":
      selectCell(hotbarCells[5]); break;
    case "7":
      selectCell(hotbarCells[6]); break;
    case "8":
      selectCell(hotbarCells[7]); break;
    case "9":
      selectCell(hotbarCells[8]); break;
    case "q":
      selectCell(hotbarCells[9]); break;
    case "w":
      selectCell(hotbarCells[10]); break;
    case "e":
      selectCell(hotbarCells[11]); break;
    case "r":
      selectCell(hotbarCells[12]); break;
    case "t":
      selectCell(hotbarCells[13]); break;
    case "y":
      selectCell(hotbarCells[14]); break;
    case "u":
      selectCell(hotbarCells[15]); break;
    case "i":
      selectCell(hotbarCells[16]); break;
    case "o":
      selectCell(hotbarCells[17]); break;
  }
}

function selectCell(target:HTMLDivElement){
  for(const cell of hotbarCells){
    cell.classList.remove("hotbarcellselected");
  }
  target.classList.add("hotbarcellselected");
}

function getSelectedId(){
  try {
    let calcedId = (document.getElementsByClassName("hotbarcellselected")[0].childNodes[1] as HTMLImageElement).src.split("/").pop()!.split(".")[0];
    //who said the code had to be readable
    if(typeof calcedId == "number" || !isNaN(parseInt(calcedId))){
      return calcedId;
    }
  } catch(err){

  }
  return 0;
}

function loadReactor(data:string){
  try {
    //Check for security reasons(why not) //TODO awful
    console.assert(data.match(/[<>\\;^]|(script)/gi) == null);

    var x = JSON.parse(data);
    // First some validation to make sure the data is valid.
    console.assert(x.metadata.version.match(/[1-9].[0.9].[0-9]/gi));
    //hehe VV
    console.assert(x.metadata.version == "1.0.2" || x.metadata.version == "1.0.1" || x.metadata.version == "1.0.0" || x.metadata.validationCode == "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.");
    if(x.metadata.version != VERSION){
      console.warn("Loading JSON file with a different data version.");
    }

    console.assert(x.metadata.dimensions.length == 3);
    console.assert(typeof x.metadata.dimensions[0] == "number");
    console.assert(typeof x.metadata.dimensions[1] == "number");
    console.assert(typeof x.metadata.dimensions[2] == "number");

    //The data's probably valid, load it now..
    let tempReactor = new Reactor(x.metadata.dimensions[0], x.metadata.dimensions[1], x.metadata.dimensions[2]);
    tempReactor.contents = x.content;
    tempReactor.name = x.metadata.name;
    console.assert(tempReactor.validate());

    //Validation passed, its good.
    defaultReactor = tempReactor;
    x_input.value = x.metadata.dimensions[0];
    y_input.value = x.metadata.dimensions[1];
    z_input.value = x.metadata.dimensions[2];
    defaultReactor.update();
  } catch(err){
    loadNCReactorPlanner(data, "Imported Reactor");
  }
}

function loadNCReactorPlanner(rawData:string, filename:string){
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
    //TODO awful
    console.assert(rawData.match(/[<>\\;^]|(script)/gi) == null);
    let data = JSON.parse(rawData);
    console.assert(typeof data.SaveVersion.Build == "number");
    console.assert(data.CompressedReactor);


    let tempReactor = new Reactor(data.InteriorDimensions.X, data.InteriorDimensions.Y, data.InteriorDimensions.Z)
    for(var x of ["Redstone","Glowstone","Helium","Iron","Tin","Beryllium","FuelCell","Quartz","Lapis","Enderium","Emerald","Magnesium","Water","Gold","Diamond","Cryotheum","Copper","Graphite"] as const){
        if(data.CompressedReactor[x] instanceof Array){
          for(var pos of data.CompressedReactor[x]){
            tempReactor.contents[pos.Y - 1][pos.X - 1][pos.Z - 1] = ncmappings[x];
          }
        }
    }
    tempReactor.name = filename;
    console.assert(tempReactor.validate());

    defaultReactor = tempReactor;
    x_input.value = data.InteriorDimensions.X;
    y_input.value = data.InteriorDimensions.Y;
    z_input.value = data.InteriorDimensions.Z;
    defaultReactor.update();
  } catch(err){
    console.error("Invalid JSON!", err);
  }
}


var defaultReactor;
function regenReactor(){
  defaultReactor = new Reactor(
    +x_input.value,
    +y_input.value,
    +z_input.value
  );
  defaultReactor.update();
}
regenReactor();


titleText.innerHTML = "<strong>Einsteinium</strong> beta v"+VERSION+": editing ";
console.log("%cWelcome to Einsteinium!", "font-size: 50px; color: blue");
console.log("Version Beta v" + VERSION);
console.log("Einsteinium is a tool to help you build NuclearCraft fission reactors.");
console.warn("Einsteinium is currently in beta. This means there will probably be a few bugs, and features will be added regularly. If you find a bug please report it on this project's GitHub.");
