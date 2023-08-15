
const reactorName = getElement("reactor-name", HTMLInputElement);
const uploadButton = getElement("upload-button", HTMLInputElement);
const hotbarCells = [...document.querySelectorAll(".hotbarcell")] as HTMLDivElement[];
const x_input = getElement("x-input", HTMLInputElement);
const y_input = getElement("y-input", HTMLInputElement);
const z_input = getElement("z-input", HTMLInputElement);
const reactorLayers = getElement("reactor-layers", HTMLDivElement);
const statsPanel = getElement("stats-panel", HTMLDivElement);
const titleText = getElement("title", HTMLSpanElement);

type BlockID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

const VERSION = "2.0.0";

type PreprocessedCellData = PreprocessedBasicCellData & (PreprocessedMiscCellData | PreprocessedCoolerCellData | PreprocessedModeratorCellData);
type RangeSpecifier = number | [min:number, max:number];
type CellValidCheckObject = {
  [_ in BlockID | "moderator" | "casing"]?: RangeSpecifier;
};
type CellValidCheck = CellValidCheckObject | ((reactor:Reactor, cell:[x:number, y:number, z:number]) => boolean);
interface PreprocessedBasicCellData {
  displayedName: string;
  description: string;
  blockData?: string;
  ncrpName?: string;
}
interface PreprocessedMiscCellData {
  type: "misc";
}
interface PreprocessedCoolerCellData {
  coolAmount: number;
  type: "cooler";
  valid: CellValidCheck;
}
interface PreprocessedModeratorCellData {
  type: "moderator";
  valid: CellValidCheck;
}
type CellData = PreprocessedCellData & {
  imagePath: string;
  id: number;
};

const cellTypes = ((d:PreprocessedCellData[]):CellData[] => d.map((t, i) => ({
  ...t,
  id: i,
  imagePath: `assets/${i}.png`
})))([
  {
    displayedName: "Air",
    type: "misc",
    description: "",
  },{
    displayedName: "Fuel Cell",
    type: "misc",
    description: "",
    blockData: `Name:"nuclearcraft:cell_block"`,
    ncrpName: "FuelCell",
  },{
    displayedName: "Water Cooler",
    type: "cooler",
    description: "Requires at least one fuel cell or active moderator.",
    blockData: `Properties:{type:"water"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Water",
    coolAmount: 60,
    valid(reactor, [x, y, z]){
      return reactor.getAdjacentFuelCells(x, y, z) >= 1 || reactor.getAdjacentModerators(x, y, z) >= 1;
    },
  },{
    displayedName: "Redstone Cooler",
    type: "cooler",
    description: "Requires at least one fuel cell.",
    blockData: `Properties:{type:"redstone"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Redstone",
    coolAmount: 90,
    valid: {
      1: 1
    }
  },{
    displayedName: "Quartz Cooler",
    type: "cooler",
    description: "Requires at least one active moderator.",
    blockData: `Properties:{type:"redstone"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Quartz",
    coolAmount: 90,
    valid: {
      moderator: 1
    }
  },{
    displayedName: "Gold Cooler",
    type: "cooler",
    description: "Requires at least one redstone cooler and water cooler.",
    blockData: `Properties:{type:"gold"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Gold",
    coolAmount: 120,
    valid: {
      2: 1, 3: 1
    }
  },{
    displayedName: "Glowstone Cooler",
    type: "cooler",
    description: "Requires at least two active moderators.",
    blockData: `Properties:{type:"glowstone"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Glowstone",
    coolAmount: 130,
    valid: {
      moderator: 2
    }
  },{
    displayedName: "Lapis Cooler",
    type: "cooler",
    description: "Requires at least one fuel cell and casing.",
    blockData: `Properties:{type:"lapis"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Lapis",
    coolAmount: 120,
    valid: {
      1: 1,
      casing: 1
    }
  },{
    displayedName: "Diamond Cooler",
    type: "cooler",
    description: "Requires at least one water cooler and quartz cooler",
    blockData: `Properties:{type:"diamond"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Diamond",
    coolAmount: 150,
    valid: {
      2: 1,
      4: 1,
    }
  },{
    displayedName: "Helium Cooler",
    type: "cooler",
    description: "Requires exactly one redstone cooler and at least one reactor casing.",
    blockData: `Properties:{type:"helium"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Helium",
    coolAmount: 140,
    valid: {
      3: [1, 1],
      casing: 1,
    }
  },{
    displayedName: "Enderium Cooler",
    type: "cooler",
    description: "Must be placed in a corner.",
    blockData: `Properties:{type:"enderium"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Enderium",
    coolAmount: 120,
    valid(reactor, [x, y, z]){
      return (
        (x == 0 || x == reactor.x - 1) &&
        (y == 0 || x == reactor.y - 1) &&
        (z == 0 || x == reactor.z - 1)
      );
    },
  },{
    displayedName: "Cryotheum Cooler",
    type: "cooler",
    description: "Requires at least two fuel cells.",
    blockData: `Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Cryotheum",
    coolAmount: 160,
    valid: {
      1: 2,
    }
  },{
    displayedName: "Iron Cooler",
    type: "cooler",
    description: "Requires at least one gold cooler.",
    blockData: `Properties:{type:"iron"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Iron",
    coolAmount: 80,
    valid: {
      5: 1,
    }
  },{
    displayedName: "Emerald Cooler",
    type: "cooler",
    description: "Requires at least one moderator and fuel cell.",
    blockData: `Properties:{type:"emerald"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Emerald",
    coolAmount: 160,
    valid: {
      moderator: 1,
      1: 1,
    }
  },{
    displayedName: "Copper Cooler",
    type: "cooler",
    description: "Requires at least one glowstone cooler.",
    blockData: `Properties:{type:"copper"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Copper",
    coolAmount: 80,
    valid: {
      6: 1,
    }
  },{
    displayedName: "Tin Cooler",
    type: "cooler",
    description: "Requires two lapis coolers on opposite sides.",
    blockData: `Properties:{type:"tin"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Tin",
    coolAmount: 120,
    valid(reactor, [x, y, z]){
      return (
        gna(reactor.contents, y + 1, x, z) == 7 && gna(reactor.contents, y - 1, x, z) == 7 ||
        gna(reactor.contents, y, x + 1, z) == 7 && gna(reactor.contents, y, x - 1, z) == 7 ||
        gna(reactor.contents, y, x, z + 1) == 7 && gna(reactor.contents, y, x, z - 1) == 7
      );
    }
  },{
    displayedName: "Magnesium Cooler",
    type: "cooler",
    description: "Requires at least one casing and moderator.",
    blockData: `Properties:{type:"magnesium"},Name:"nuclearcraft:cooler"`,
    ncrpName: "Magnesium",
    coolAmount: 110,
    valid: {
      casing: 1,
      moderator: 1,
    }
  },{
    displayedName: "Graphite Moderator",
    type: "moderator",
    description: "Boosts the fission reaction in adjacent cells, increasing power but also heat.",
    blockData: `Properties:{type:"graphite"},Name:"nuclearcraft:ingot_block"`,
    ncrpName: "Graphite",
    valid: {
      1: 1,
    }
  },{
    displayedName: "Beryllium Moderator",
    type: "moderator",
    description: "Boosts the fission reaction in adjacent cells, increasing power but also heat.",
    blockData: `Properties:{type:"beryllium"},Name:"nuclearcraft:ingot_block"`,
    ncrpName: "Beryllium",
    valid: {
      1: 1,
    }
  },{
    displayedName: "Casing",
    description: "",
    type: "misc",
    blockData: `Properties:{type:"casing"},Name:"nuclearcraft:fission_block"`,
  }
]);

const ncrpMappings = Object.fromEntries(
  cellTypes.map((t, i) => [t.ncrpName, i as BlockID] as const).filter((x):x is [string, BlockID] => x[0] != undefined)
) satisfies Record<string, BlockID>;
const moderatorIds = cellTypes.map((t, i) => [t, i] as const).filter(([t, i]) => t.type == "moderator").map(([t, i]) => i);

let settings = {
  "heatMult": 1.0,
  "neutronRadiationReach": 4,
  "maxReactorSize": 10,
  "moderatorExtraHeat": 2,
  "moderatorExtraPower": 1,
  "coolers": [0, 0, 60, 90, 90, 120, 130, 120, 150, 140, 120, 160, 80, 160, 80, 120, 110]
};

const consts = {
  defaultName: "Unnamed Reactor"
};

//Util functions
function getElement<T extends typeof HTMLElement>(id:string, type:T){
	const element = <unknown>document.getElementById(id);
	if(element instanceof type) return element as T["prototype"];
	else if(element instanceof HTMLElement) throw new Error(`Element with id ${id} was fetched as type ${type.name}, but was of type ${element.constructor.name}`);
	else throw new Error(`Element with id ${id} does not exist`);
}
function sum(arr:number[]){
  let sum = 0;
  for(let x of arr){
    sum += x;
  }
  return sum;
}
function assert(val:boolean, message = "Assertion failed, no further information"){
  if(!val) throw new Error(message);
}
function inRange(value:number, range:RangeSpecifier){
  if(typeof range == "number") return value >= range;
  else return value >= range[0] && value <= range[1];
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
  contents: BlockID[][][];
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

    this.name = consts.defaultName;

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

  edit(x:number, y:number, z:number, id:BlockID){
    //Self explanatory.
    if(isNaN(id) || !(id in cellTypes)){
      console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
      return false;
    }
    this.contents[y][x][z] = id;
    this.valids[y][x][z] = (cellTypes[id].type == "misc");
    this.update();
    return true;
  }

  update(){
    //necessary because: on first update moderators will become valid, then on the next update redstone coolers, then on the next update gold coolers, then on the fourth update tin coolers
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateCellsValidity();
    this.updateDOM(reactorLayers);
    this.updateStats(statsPanel);
  }

  validate(){
    try {
      assert(this.contents.length == this.y, "Incorrect dimensions");
      for(let x of this.contents){
        assert(x.length == this.x, "Incorrect dimensions");
        for(let y of x){
          assert(y.length == this.z, "Incorrect dimensions");
          for(let cell of y){
            assert(typeof cell == "number", "Invalid cell");
            assert(cell in cellTypes, "Invalid cell");
          }
        }
      }
      return true;
    } catch(err){
      return false;
    }
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
      const layerInner = document.createElement("div");
      layerInner.classList.add("layerinner");
      for(let j = 0; j < this.x*this.z; j ++){
        //TODO fix bad loop, unnecessary floor
        let cX = j % this.x;
        let cZ = Math.floor(j/this.x);
        const cell = document.createElement("div");
        cell.classList.add("cell");
        if(!this.valids[i][cX][cZ]) cell.classList.add("invalid");
        //TODO way too many duped functions
        cell.addEventListener("click", e => {
          defaultReactor.edit(cX, i, cZ, getSelectedId());
        });
        cell.addEventListener("contextmenu", e => {
          if(!e.shiftKey){
            defaultReactor.edit(cX, i, cZ, 0);
            e.preventDefault();
          }
        });
        cell.style.setProperty("grid-row", (cZ + 1).toString());
        cell.style.setProperty("grid-column", (cX + 1).toString());
        const type = cellTypes[this.contents[i][cX][cZ]];
        cell.title = `${type.displayedName}\n${type.description}`;
        const img = document.createElement("img");
        img.src = type.imagePath;
        img.alt = type.displayedName;
        img.style.width = "100%";
        cell.appendChild(img);
        layerInner.appendChild(cell);
      }
      tempElement.appendChild(layerInner);
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
            if(cell != 0){cells.push(cell);}
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
            if(cellTypes[that.contents[y][x][z]].blockData){
              states.push(`{mapSlot:${that.contents[y][x][z]}s,mapState:{${cellTypes[that.contents[y][x][z]].blockData!}}}`);
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

  getAdjacentFuelCells(x:number, y:number, z:number){
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
    //TODO generic-ify and clean up this DRY abomination
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
    //TODO aaaaaaaaaa, commit [x, y, z] and generic-ify
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
            let adjacentCells = this.getAdjacentFuelCells(pos.x, pos.y, pos.z);
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

  checkValidation(check:CellValidCheck, [x, y, z]:[x:number, y:number, z:number]){
    if(typeof check == "object"){
      for(const [key, value] of Object.entries(check) as [keyof CellValidCheckObject, RangeSpecifier][]){
        const checkPassed =
          key == "moderator" ? inRange(this.getAdjacentModerators(x, y, z), value) :
          key == "casing" ? inRange(this.getAdjacentCell(x, y, z, null), value) :
          inRange(this.getAdjacentCell(x, y, z, key), value);
        if(!checkPassed) return false;
      }
      return true;
    } else {
      return check(this, [x, y, z]);
    }
  }

  updateCellsValidity(){
    for(let y in this.contents){
      for(let x in this.contents[y]){
        for(let z in this.contents[y][x]){
          const cellType = cellTypes[this.contents[y][x][z]];
          const pos = {x: parseInt(x), y: parseInt(y), z: parseInt(z)};
          if(cellType.type == "misc"){
            this.valids[pos.y][pos.x][pos.z] = true;
          } else {
            this.valids[pos.y][pos.x][pos.z] = this.checkValidation(cellType.valid, [pos.x, pos.y, pos.z]);
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
    ${cellTypes.map((t, i) => [i, t] as const).filter(([i, t]) => t.type == "cooler" && stats.cellcount[i] > 0).map(([i, t]) =>
      `${t.displayedName}: ${stats.cellcount[i]}<br>`
    ).join("\n")}
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
  return navigator.clipboard.writeText(str);
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

function getSelectedId():BlockID {
  try {
    let calcedId = +(document.getElementsByClassName("hotbarcellselected")[0].childNodes[1] as HTMLImageElement).src.split("/").pop()!.split(".")[0];
    //who said the code had to be readable
    if(calcedId in cellTypes){
      return calcedId as BlockID;
    }
  } catch(err){

  }
  return 0;
}

function loadReactor(data:string){
  try {
    //Check for security reasons(why not) //TODO awful
    assert(data.match(/[<>\\;^]|(script)/gi) == null, "Security check failed");

    const parsed = JSON.parse(data);
    // First some validation to make sure the data is valid.
    assert(parsed.metadata.version.match(/[1-9].[0.9].[0-9]/gi), "Invalid version");
    //hehe VV
    assert(parsed.metadata.validationCode == "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.", "Incorrect validation code");
    if(parsed.metadata.version != VERSION){
      console.warn("Loading JSON file with a different data version.");
    }

    assert(parsed.metadata.dimensions.length == 3, "Invalid dimenions");
    assert(typeof parsed.metadata.dimensions[0] == "number", "Invalid dimenions");
    assert(typeof parsed.metadata.dimensions[1] == "number", "Invalid dimenions");
    assert(typeof parsed.metadata.dimensions[2] == "number", "Invalid dimenions");

    //The data's probably valid, try load it now..
    let tempReactor = new Reactor(parsed.metadata.dimensions[0], parsed.metadata.dimensions[1], parsed.metadata.dimensions[2]);
    tempReactor.contents = parsed.content;
    tempReactor.name = parsed.metadata.name;
    assert(tempReactor.validate(), "Invalid data");

    //Validation passed, its good.
    defaultReactor = tempReactor;
    x_input.value = parsed.metadata.dimensions[0];
    y_input.value = parsed.metadata.dimensions[1];
    z_input.value = parsed.metadata.dimensions[2];
    defaultReactor.update();
  } catch(err){
    loadNCReactorPlanner(data, "Imported Reactor");
  }
}

function loadNCReactorPlanner(rawData:string, filename:string){
  
  try {
    //TODO awful
    assert(rawData.match(/[<>\\;^]|(script)/gi) == null);
    let data = JSON.parse(rawData);
    assert(typeof data.SaveVersion.Build == "number");
    assert(data.CompressedReactor);


    let tempReactor = new Reactor(data.InteriorDimensions.X, data.InteriorDimensions.Y, data.InteriorDimensions.Z)
    for(const name of Object.keys(ncrpMappings)){
      if(data.CompressedReactor[name] instanceof Array){
        for(const pos of data.CompressedReactor[name]){
          tempReactor.contents[pos.Y - 1][pos.X - 1][pos.Z - 1] = ncrpMappings[name];
        }
      }
    }
    tempReactor.name = filename;
    assert(tempReactor.validate());

    defaultReactor = tempReactor;
    x_input.value = data.InteriorDimensions.X;
    y_input.value = data.InteriorDimensions.Y;
    z_input.value = data.InteriorDimensions.Z;
    defaultReactor.update();
  } catch(err){
    console.error("Invalid JSON!", err);
  }
}


let defaultReactor:Reactor;
function regenReactor(){
  defaultReactor = new Reactor(
    +x_input.value,
    +y_input.value,
    +z_input.value
  );
  defaultReactor.update();
}
regenReactor();


titleText.innerHTML = `<strong>Einsteinium</strong> beta v${VERSION}: editing `;
console.log("%cWelcome to Einsteinium!", "font-size: 50px; color: blue");
console.log("Version Beta v" + VERSION);
console.log("Einsteinium is a tool to help you build NuclearCraft fission reactors.");
console.warn("Einsteinium is currently in beta. This means there will probably be a few bugs, and features will be added regularly. If you find a bug please report it on this project's GitHub.");
