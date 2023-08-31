
const reactorName = getElement("reactor-name", HTMLInputElement);
const bgExportButton = getElement("bg-export", HTMLButtonElement);
const x_input = getElement("x-input", HTMLInputElement);
const y_input = getElement("y-input", HTMLInputElement);
const z_input = getElement("z-input", HTMLInputElement);
const regenerateButton = getElement("regen-reactor", HTMLButtonElement);
const downloadButton = getElement("download-reactor", HTMLButtonElement);
const uploadButton = getElement("upload-button", HTMLInputElement);
const heatInput = getElement("heat-input", HTMLInputElement);
const powerInput = getElement("power-input", HTMLInputElement);
const activeInput = getElement("active-input", HTMLInputElement);
const reactorLayers = getElement("reactor-layers", HTMLDivElement);
const statsPanel = getElement("stats-panel", HTMLDivElement);
const titleText = getElement("title", HTMLSpanElement);
const hotbar = getElement("hotbar", HTMLDivElement);
let hotbarCells:HTMLDivElement[] = [];

//TODO "are you sure you want to leave this page?"

const VERSION = "2.1.0";
/** do not modify */
const validationCode = "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.";

/** Maps a key to the element to click. */
const hotbarKeybindMapping:Record<string, HTMLElement> = {
	"0": hotbarCells[18],
	"1": hotbarCells[0],
	"2": hotbarCells[1],
	"3": hotbarCells[2],
	"4": hotbarCells[3],
	"5": hotbarCells[4],
	"6": hotbarCells[5],
	"7": hotbarCells[6],
	"8": hotbarCells[7],
	"9": hotbarCells[8],
	"q": hotbarCells[9],
	"w": hotbarCells[10],
	"e": hotbarCells[11],
	"r": hotbarCells[12],
	"t": hotbarCells[13],
	"y": hotbarCells[14],
	"u": hotbarCells[15],
	"i": hotbarCells[16],
	"o": hotbarCells[17],
	"p": hotbarCells[18],
};


let settings = {
	"heatMult": 1.0,
	"powerMult": 1.0,
	"burnRateMult": 1.0,
	"neutronRadiationReach": 4,
	"maxReactorSize": 10,
	"moderatorExtraHeat": 2,
	"moderatorExtraPower": 1,
	"coolers": [0, 0, 60, 90, 90, 120, 130, 120, 150, 140, 120, 160, 80, 160, 80, 120, 110],
	"activeCoolers": [0, 0, 150, 3200, 3000, 4800, 4000, 2800, 7000, 6600, 5400, 6400, 2400, 3600, 2600, 3000, 3600],
	"fuelTime": 144000,
	"heatCapacityPerBlock": 25000,
	"ticksPerSecond": 20,
};
const consts = {
	defaultName: "Unnamed Reactor"
};
type CellStats = BasicCellStats | FuelCellStats;
interface BasicCellStats {
	id: number;
	type: CellData;
}
interface FuelCellStats extends BasicCellStats {
	adjacentCells: number;
	distantAdjacentCells: number;
	adjacentModerators: number;
	heatMultiplier: number;
	energyMultiplier: number;
}

interface FuelInfo {
	heat: number;
	power: number;
}

class Reactor {
	/**
	 * A 3-dimensional array storing the id of each block(as a number).
	 * It is stored in the format Reactor.contents[y][x][z].
	 */
	contents: BlockID[][][];
	valids: boolean[][][];
	x:number; y:number; z:number;
	name:string;
	constructor(x:number, y:number, z:number){
		this.contents = [];
		this.valids = [];
		this.y = constrain(y, 1, settings.maxReactorSize);
		this.x = constrain(x, 1, settings.maxReactorSize);
		this.z = constrain(z, 1, settings.maxReactorSize);

		this.name = consts.defaultName;

		this.contents = array3D(y, x, z, 0);
		this.valids = array3D(y, x, z, false);
	}
	get([x, y, z]:Pos):BlockID | null {
		if(
			(x >= 0 && x < this.x) &&
			(y >= 0 && y < this.y) &&
			(z >= 0 && z < this.z)
		) return this.contents[y][x][z];
		else return null;
	}
	/** Returns true if the cell is outside the reactor. */
	cellValid([x, y, z]:Pos):boolean {
		if(
			(x >= 0 && x < this.x) &&
			(y >= 0 && y < this.y) &&
			(z >= 0 && z < this.z)
		) return this.valids[y][x][z];
		else return true;
	}
	isIDAndValid([x, y, z]:Pos, id:BlockID):boolean {
		if(
			(x >= 0 && x < this.x) &&
			(y >= 0 && y < this.y) &&
			(z >= 0 && z < this.z)
		) return this.contents[y][x][z] == id && this.valids[y][x][z];
		else return false;
	}
	getData([x, y, z]:Pos):CellData | null {
		const xInRange = x >= 0 && x < this.x;
		const yInRange = y >= 0 && y < this.y;
		const zInRange = z >= 0 && z < this.z;
		if(xInRange && yInRange && zInRange) return cellTypes[this.contents[y][x][z]];
		else if(
			((x == -1 || x == this.x) && yInRange && zInRange) ||
			((y == -1 || y == this.y) && xInRange && zInRange) ||
			((z == -1 || z == this.z) && xInRange && yInRange)
		) return cellTypes[19];
		else return null;
	}
	edit([x, y, z]:Pos, id:BlockID){
		//Self explanatory.
		if(isNaN(id) || !(id in cellTypes)){
			console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
			return false;
		}
		this.contents[y][x][z] = id;
		this.update();
		return true;
	}

	update(){
		const fuel = {
			heat: getHeat(), power: getPower()
		}
		//necessary because: on first update moderators will become valid, then on the next update redstone coolers, then on the next update gold coolers, then on the fourth update tin coolers
		this.updateCellsValidity();
		this.updateCellsValidity();
		this.updateCellsValidity();
		this.updateCellsValidity();
		const stats = this.calculateStats(fuel);
		this.updateStats(statsPanel, stats);
		this.updateDOM(reactorLayers, stats);
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

	getDOMCell(reactorLayers:HTMLDivElement, [x, y, z]:Pos){
		return reactorLayers.childNodes[y].childNodes[(z*this.x) + x] as HTMLDivElement;
	}

	updateDOM(reactorLayers:HTMLDivElement, {cellInfo}:ReturnType<(typeof Reactor)["prototype"]["calculateStats"]>){
		reactorLayers.innerHTML = "";
		reactorLayers.style.setProperty("--cells-z", this.z.toString());
		reactorLayers.style.setProperty("--cells-x", this.x.toString());
		//So glad this worked ^^

		function cellClicked(this:HTMLDivElement, e:MouseEvent){
			//this is pretty cursed but it works
			const y = +this.parentElement!.getAttribute("y")!;
			const [z, x] = this.style.gridArea.split(" / ").map(a => +a - 1); //TODO b o d g e
			const pos:Pos = [x, y, z];
			if(e.buttons & 2 && e.shiftKey){ //Shift right click
				return;
			} else if(e.buttons & 2 && !e.shiftKey){ //Right click
				defaultReactor.edit(pos, 0);
			} else if(e.buttons & 4){ //Middle click
				const id = defaultReactor.get(pos);
				if(id != null){
					selectCell.call(hotbarCells.at(id - 1)!);
					//Nice trick: if id is zero, it will use the last icon, which is the "X" icon
				}
			} else { //Left click
				defaultReactor.edit(pos, getSelectedId(e.shiftKey));
			}
			//Calling any function on the event here does nothing to stop the menu from being fired
		}
		function cellContextMenued(this:HTMLDivElement, e:MouseEvent){
			//no menu
			if(e.buttons & 2 && e.shiftKey){
				//unless shift right click
			} else {
				e.preventDefault();
			}
		}

		for(let y = 0; y < this.y; y ++){
			const layer = document.createElement("div");
			layer.classList.add("layer");
			layer.setAttribute("y", y.toString());
			for(let z = 0; z < this.z; z ++){ for(let x = 0; x < this.x; x ++){
				const pos:Pos = [x, y, z];
				const cell = document.createElement("div");
				const stat = cellInfo[y][x][z];
				const type = this.getData(pos)!;
				const extraTooltip = ("adjacentCells" in stat) ?
`\nAdjacent Cells: ${stat.adjacentCells}
${stat.distantAdjacentCells ? ("Distant \"adjacent\" cells: " + stat.distantAdjacentCells + "\n") : ""}\
Adjacent Moderators: ${stat.adjacentModerators}
Heat Multiplier: ${stat.heatMultiplier * 100}%
Energy Multiplier: ${stat.energyMultiplier * 100}%`
				: "";
				const activeTooltip = type.activeCooler ? `\nFuel consumption: ${"🤷‍♀️"} mb/t (${"🤷‍♂️"} items/hour)` : "";//TODO get the data from JEI
				cell.classList.add("cell");
				if(!this.cellValid(pos)) cell.classList.add("invalid");
				if(type.activeCooler) cell.classList.add("active-cooler");
				cell.addEventListener("mousedown", cellClicked);
				cell.addEventListener("contextmenu", cellContextMenued);
				cell.style.setProperty("grid-row", (z + 1).toString());
				cell.style.setProperty("grid-column", (x + 1).toString());
				cell.title = type.tooltipText + extraTooltip + activeTooltip;
				cell.style.backgroundImage = `url(${type.imagePath})`;
				layer.appendChild(cell);
			}}
			reactorLayers.appendChild(layer);
		}
		reactorName.value = this.name;
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
					"validationCode": "${validationCode}"
				}
			}`
		);
	}

	exportToBG(includeCasings:boolean){
		//Dire, what have you done?! BG strings are a **mess**.
		if(includeCasings){
			console.warn("includeCasings is not yet implemented.");//TODO
		}
		const stateIntArray = this.contents.map(l => l.map(
			r => r.filter(c => cellTypes[c].blockData)
		)).flat(2);
		const posIntArray = this.contents.map((l, y) => l.map(
			(r, x) => r.map((c, z) => [c, z] as const).filter(([c]) => cellTypes[c].blockData).map(([, z]) => 65536 * x + 256 * y + z)
		)).flat(2);
		const mapIntState = cellTypes.map((t, i) => [t, i] as const).filter(([t]) => t.blockData != undefined).map(([t, i]) =>
			`{mapSlot:${t.id}s,mapState:{${t.blockData!}}}`
		);
		//TODO all active coolers are duped
		return `{stateIntArray:[I;${stateIntArray.join(",")}],dim:0,posIntArray:[I;${posIntArray.join(",")}],startPos:{X:0,Y:0,Z:0},mapIntState:[${mapIntState.join(",")}],endPos:{X:${this.x - 1},Y:${this.y - 1},Z:${this.z - 1}}}`;
		//It just works.
	}

	getAdjacentFuelCells(pos:Pos){
		return adjacentPositions(pos).reduce((acc, pos) => acc + +(this.get(pos) == 1), 0);
	}

	getAdjacentModerators(pos:Pos){
		return adjacentPositions(pos).reduce((acc, pos) => acc + +(this.getData(pos)?.type == "moderator"), 0)
	}

	getDistantAdjacentCells([x, y, z]:Pos){
		//Any cells that are separated from a cell by 1-4 moderator blocks are treated as adjacent.
	
		return directions.reduce((acc, direction) => {
			let pos:Pos = [x, y, z];
			for(let i = 0; i <= settings.neutronRadiationReach; i ++){
				//Move the search position out by one block, starting at 0 blocks in between and ending at `neutronRadiationReach` blocks in between
				add(pos, direction);
				const cell = this.getData(pos);
				if(cell?.id == 1 && i > 0) return acc + 1; //If the cell is a fuel cell and there is at least one block in between, search success
				else if(cell?.type == "moderator") continue; //If the cell is a moderator, keep looking
				else return acc; //Something else, search failed
			}
			return acc; //Limit reached, search failed
		}, 0);
	}

	/** Gets the number of valid cells of a specific id or type adjacent to a position. */
	getAdjacentValidCells(pos:Pos, id:BlockID | null){
		return adjacentPositions(pos).reduce((acc, pos) => acc + +(this.get(pos) == id && this.cellValid(pos)), 0);
	}

	calculateStats(fuel:FuelInfo){
		let totalHeat = 0;
		let totalCooling = 0;
		let totalEnergyPerTick = 0;
		let cellsCount = Array<number>(cellTypes.length).fill(0);
		let cellInfo:(CellStats | null)[][][] = array3D(this.y, this.x, this.z, null);
		for(let y = 0; y < this.y; y ++){
			for(let x = 0; x < this.x; x ++){
				for(let z = 0; z < this.z; z ++){
					const pos:Pos = [x, y, z];
					const id = this.get(pos)!;
					const type = cellTypes[id];
					cellsCount[id] ++;
					cellInfo[y][x][z] = {
						id, type
					};
					if(id == 1){
						let adjacentCells = this.getAdjacentFuelCells(pos);
						let distantAdjacentCells = this.getDistantAdjacentCells(pos);
						let adjacentModerators = this.getAdjacentModerators(pos);
						let heatMultiplier = (adjacentCells + distantAdjacentCells + 1) * (adjacentCells + distantAdjacentCells + 2) / 2;
						let energyMultiplier = adjacentCells + distantAdjacentCells + 1;
						energyMultiplier += adjacentModerators * (settings.moderatorExtraPower/6) * (adjacentCells + distantAdjacentCells + 1);
						heatMultiplier += adjacentModerators * (settings.moderatorExtraHeat/6) * (adjacentCells + distantAdjacentCells + 1);
						totalHeat += fuel.heat * heatMultiplier;
						totalEnergyPerTick += fuel.power * energyMultiplier;
						cellInfo[y][x][z] = {
							...cellInfo[y][x][z]!,
							adjacentCells, adjacentModerators, distantAdjacentCells,
							energyMultiplier, heatMultiplier
						};
					} else if(type.type == "cooler"){
						if(this.cellValid(pos)){
							totalCooling -=
								id & 32 ? settings.activeCoolers[id & removeActiveBitmask] : settings.coolers[id];
							//TODO fix configurable coolant amount, also this is kinda jank
						}
					}
				}
			}
		}
		assertType<CellStats[][][]>(cellInfo);

		cellsCount[19] = 2 * (this.x*this.y + this.x*this.z + this.y*this.z);
		const netHeat = totalHeat + totalCooling;
		const spaceEfficiency = 1 - cellsCount[0] / (this.x * this.y * this.z);

		return {
			totalHeat,
			totalCooling,
			netHeat,
			totalEnergyPerTick,
			cellsCount,
			spaceEfficiency,
			cellInfo,
			maxBaseHeat: checkNaN(Math.floor(-totalCooling / (totalHeat / fuel.heat)), 0),
			powerEfficiency: checkNaN(totalEnergyPerTick / (cellsCount[1] * fuel.power), 1),
			//TODO clean up code pattern
			//TODO clean up multiplication and division of totalHeat / fuel.heat
		};
	}

	checkValidation(check:CellValidCheck, pos:Pos){
		if(typeof check == "object"){
			for(const [key, value] of Object.entries(check) as [keyof CellValidCheckObject, RangeSpecifier][]){
				const checkPassed =
					key == "moderator" ? inRange(this.getAdjacentModerators(pos), value) :
					key == "casing" ? inRange(this.getAdjacentValidCells(pos, null), value) :
					inRange(this.getAdjacentValidCells(pos, key), value);
				if(!checkPassed) return false;
			}
			return true;
		} else {
			return check(this, pos);
		}
	}

	updateCellsValidity(){
		for(let y = 0; y < this.y; y ++){
			for(let x = 0; x < this.x; x ++){
				for(let z = 0; z < this.z; z ++){
					const pos:Pos = [x, y, z];
					const cellType = this.getData(pos)!;
					if(cellType.type == "misc"){
						this.valids[y][x][z] = true;
					} else {
						this.valids[y][x][z] = this.checkValidation(cellType.valid, pos);
					}
				}
			}
		}
	}

	updateStats(DOMnode:HTMLDivElement, {
		cellInfo, cellsCount, totalCooling, totalEnergyPerTick, totalHeat, netHeat, spaceEfficiency, maxBaseHeat, powerEfficiency
	}:ReturnType<(typeof Reactor)["prototype"]["calculateStats"]>){

		//TODO fix handling of heat settings
		DOMnode.innerHTML = `\
		<h1 style="color: #FF4; border-bottom: 1px dashed white;">Reactor Stats</h1>
		<br>
		<h2>Heat and Power</h2>
		<span style="color: #FAA">Total heat: ${round(totalHeat, 2)} HU/t</span><br>
		<span style="color: #AAF">Total cooling: ${round(totalCooling, 2)} HU/t</span><br>
		Net heat gen: <${(netHeat <= 0) ? "span" : "strong"} style="color: ${(netHeat <= 0) ? "#00FF00" : "#FF0000"}">${round(netHeat, 2)} HU/t</${(netHeat <= 0) ? "span" : "strong"}><br>
		${(netHeat > 0) ? `Meltdown time: ${round((settings.heatCapacityPerBlock * this.x * this.y * this.z) / netHeat / settings.ticksPerSecond, 1)} s<br>` : ""}
		Max base heat: ${maxBaseHeat}<br>
		<span style="color: #AFA">Efficiency: ${percentage(powerEfficiency, 2)}</span><br>
		<span style="color: #FF8">Total Power: ${round(totalEnergyPerTick * settings.powerMult)} RF/t</span><br>
		Fuel Pellet Duration: ${checkNaN(round(settings.fuelTime/cellsCount[1] / 20 / settings.burnRateMult, 1), 0, true)} s<br>
		<span style="color: #FF8">Energy Per Pellet: ${checkNaN(round(totalEnergyPerTick * settings.fuelTime / cellsCount[1] * settings.powerMult / settings.burnRateMult), 0)} RF</span><br>
		Space Efficiency: ${percentage(spaceEfficiency, 2)}
		<h2>Materials</h2>
		Casings: ${cellsCount[19]}<br>
		Fuel cells: ${cellsCount[1]}<br>
		Moderators: ${cellsCount[17] + cellsCount[18]}<br>
		<h3 style="color: #BBF">Coolers</h3>
		${cellTypes.map((t, i) => [i, t] as const).filter(([i, t]) => t.type == "cooler" && cellsCount[i] > 0).map(([i, t]) =>
		`${t.displayedName}: ${cellsCount[i]}<br>`
		).join("\n")}
		Total coolers: ${sum(cellsCount.slice(2, 17))}<br>
		`;

	}

}


/**
 * UI
 */

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

bgExportButton.addEventListener("click", () => {
	copyToClipboard(defaultReactor.exportToBG(false))
		.then(() => alert('Copied to clipboard. Click the Paste button in the Template Manager in-game.'));
});
regenerateButton.addEventListener("click", () => {
	if(confirm("Are you sure you want to clear the reactor? This will remove all placed blocks!"))
		regenReactor();
});
downloadButton.addEventListener("click", () => {
	defaultReactor.export();
});
heatInput.addEventListener("change", () => {
	defaultReactor.update();
});
powerInput.addEventListener("change", () => {
	defaultReactor.update();
});

window.addEventListener("keydown", e => {
	if(e.ctrlKey && e.key == "o"){
		e.preventDefault();
		uploadButton.click();
	} else if((e.ctrlKey && e.shiftKey && e.key == "s") || e.ctrlKey && e.key == "e"){
		e.preventDefault();
		bgExportButton.click();
	} else if(e.ctrlKey && e.key == "s"){
		e.preventDefault();
		downloadButton.click();
	} else if(e.key in hotbarKeybindMapping){
		hotbarKeybindMapping[e.key].click();
	}
});

function selectCell(this:HTMLDivElement){
	for(const cell of hotbarCells){
		cell.classList.remove("hotbarcellselected");
	}
	this.classList.add("hotbarcellselected");
}

function getSelectedId(shift:boolean):BlockID {
	let calcedId = +(hotbarCells.find(c => c.classList.contains("hotbarcellselected"))?.getAttribute("block-id") ?? 0);
	if(calcedId in cellTypes){
		const type = cellTypes[calcedId];
		if(type.type == "cooler" && (getPlacingActive() != shift)) //active cooler mode XOR shift
			return calcedId + 32 as BlockID; //Place active cooler
		else return calcedId as BlockID;
	} else return 0;
}

function getHeat(){
	return +heatInput.value;
}
function getPower(){
	return +powerInput.value;
}
function getPlacingActive(){
	return activeInput.checked;
}

function loadReactor(data:string){
	try {
		
		const parsed = JSON.parse(data);
		//Make sure the data is valid
		assert(parsed.metadata.version.match(/[1-9].[0-9].[0-9]/gi), "Invalid version");
		assert(parsed.metadata.validationCode == validationCode, "Incorrect validation code");
		if(parsed.metadata.version != VERSION){
			console.warn("Loading JSON file with a different data version.");
		}

		assert(parsed.metadata.dimensions.length == 3, "Invalid dimenions");
		assert(typeof parsed.metadata.dimensions[0] == "number", "Invalid dimenions");
		assert(typeof parsed.metadata.dimensions[1] == "number", "Invalid dimenions");
		assert(typeof parsed.metadata.dimensions[2] == "number", "Invalid dimenions");

		//The data seems valid, try to load it
		let tempReactor = new Reactor(parsed.metadata.dimensions[0], parsed.metadata.dimensions[1], parsed.metadata.dimensions[2]);
		tempReactor.contents = parsed.content;
		tempReactor.name = parsed.metadata.name;
		assert(tempReactor.validate(), "Invalid data");

		//Validation passed
		tempReactor.update();
		defaultReactor = tempReactor;
		x_input.value = parsed.metadata.dimensions[0];
		y_input.value = parsed.metadata.dimensions[1];
		z_input.value = parsed.metadata.dimensions[2];
	} catch(err){
		loadNCReactorPlanner(data, "Imported Reactor");
	}
}

function loadNCReactorPlanner(rawData:string, filename:string){
	
	try {
		let data = JSON.parse(rawData);
		assert(typeof data.SaveVersion.Build == "number");
		assert(data.CompressedReactor);

		assert(typeof data.InteriorDimensions.X == "number", "Invalid dimenions");
		assert(typeof data.InteriorDimensions.Y == "number", "Invalid dimenions");
		assert(typeof data.InteriorDimensions.Z == "number", "Invalid dimenions");
		let tempReactor = new Reactor(data.InteriorDimensions.X, data.InteriorDimensions.Y, data.InteriorDimensions.Z)
		for(const name in ncrpMappings){
			if(data.CompressedReactor[name] instanceof Array){
				for(const pos of data.CompressedReactor[name]){
					tempReactor.contents[pos.Y - 1][pos.X - 1][pos.Z - 1] = ncrpMappings[name];
				}
			}
		}
		tempReactor.name = filename;
		assert(tempReactor.validate());

		tempReactor.update();
		defaultReactor = tempReactor;
		x_input.value = data.InteriorDimensions.X;
		y_input.value = data.InteriorDimensions.Y;
		z_input.value = data.InteriorDimensions.Z;
	} catch(err){
		console.error("Invalid JSON!", err);
	}
}

function getHotbarCell(image:string, tooltip:string, id:BlockID){
	const div = document.createElement("div");
	div.classList.add("hotbarcell");
	div.addEventListener("click", selectCell);
	div.title = tooltip;
	div.setAttribute("block-id", id.toString());
	const img = document.createElement("img");
	img.src = image;
	div.append(img);
	return div;
}
//Make the hotbar
hotbar.append(...hotbarCells = [
	...cellTypes
		.filter(cellType => cellType.placeable && !cellType.activeCooler) //Don't add a new image for each active cooler
		.map(cellType =>
			getHotbarCell(cellType.imagePath, cellType.tooltipText, cellType.id)
		),
	getHotbarCell("assets/00.png", "Remove", 0)
]);
selectCell.call(hotbarCells[0]);
document.querySelector("#options-panel>.flex button")?.addEventListener("click", function(this:HTMLElement){
	open(atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==")); this.innerText = "what did you think would happen";
});

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

(window as any).everythingIsFine = true;
