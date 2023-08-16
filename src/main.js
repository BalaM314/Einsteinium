"use strict";
const reactorName = getElement("reactor-name", HTMLInputElement);
const uploadButton = getElement("upload-button", HTMLInputElement);
const x_input = getElement("x-input", HTMLInputElement);
const y_input = getElement("y-input", HTMLInputElement);
const z_input = getElement("z-input", HTMLInputElement);
const reactorLayers = getElement("reactor-layers", HTMLDivElement);
const statsPanel = getElement("stats-panel", HTMLDivElement);
const titleText = getElement("title", HTMLSpanElement);
const hotbar = getElement("hotbar", HTMLDivElement);
let hotbarCells = [];
const VERSION = "2.0.0";
let baseHeat = 18;
let basePower = 60;
let fuelTime = 144000;
const keybindMapping = {
    "0": 18,
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,
    "9": 8,
    "q": 9,
    "w": 10,
    "e": 11,
    "r": 12,
    "t": 13,
    "y": 14,
    "u": 15,
    "i": 16,
    "o": 17,
    "p": 18,
};
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
class Reactor {
    constructor(x, y, z) {
        this.contents = [];
        this.valids = [];
        this.y = constrain(y, 1, settings.maxReactorSize);
        this.x = constrain(x, 1, settings.maxReactorSize);
        this.z = constrain(z, 1, settings.maxReactorSize);
        this.name = consts.defaultName;
        this.contents = Array.from({ length: y }, () => Array.from({ length: x }, () => Array.from({ length: z }, () => 0)));
        this.valids = Array.from({ length: y }, () => Array.from({ length: x }, () => Array.from({ length: z }, () => false)));
    }
    get([x, y, z]) {
        if ((x >= 0 && x < this.x) &&
            (y >= 0 && y < this.y) &&
            (z >= 0 && z < this.z))
            return this.contents[y][x][z];
        else
            return null;
    }
    cellValid([x, y, z]) {
        if ((x >= 0 && x < this.x) &&
            (y >= 0 && y < this.y) &&
            (z >= 0 && z < this.z))
            return this.valids[y][x][z];
        else
            return true;
    }
    getData([x, y, z]) {
        const xInRange = x >= 0 && x < this.x;
        const yInRange = y >= 0 && y < this.y;
        const zInRange = z >= 0 && z < this.z;
        if (xInRange && yInRange && zInRange)
            return cellTypes[this.contents[y][x][z]];
        else if (((x == -1 || x == this.x) && yInRange && zInRange) ||
            ((y == -1 || y == this.y) && xInRange && zInRange) ||
            ((z == -1 || z == this.z) && xInRange && yInRange))
            return cellTypes[19];
        else
            return null;
    }
    edit(x, y, z, id) {
        if (isNaN(id) || !(id in cellTypes)) {
            console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
            return false;
        }
        this.contents[y][x][z] = id;
        this.valids[y][x][z] = (cellTypes[id].type == "misc");
        this.update();
        return true;
    }
    update() {
        this.updateCellsValidity();
        this.updateCellsValidity();
        this.updateCellsValidity();
        this.updateCellsValidity();
        this.updateDOM(reactorLayers);
        this.updateStats(statsPanel);
    }
    validate() {
        try {
            assert(this.contents.length == this.y, "Incorrect dimensions");
            for (let x of this.contents) {
                assert(x.length == this.x, "Incorrect dimensions");
                for (let y of x) {
                    assert(y.length == this.z, "Incorrect dimensions");
                    for (let cell of y) {
                        assert(typeof cell == "number", "Invalid cell");
                        assert(cell in cellTypes, "Invalid cell");
                    }
                }
            }
            return true;
        }
        catch (err) {
            return false;
        }
    }
    getDOMCell(reactorLayers, x, y, z) {
        return reactorLayers.childNodes[y].firstChild.childNodes[(z * this.x) + x];
    }
    updateDOM(reactorLayers) {
        reactorLayers.innerHTML = "";
        reactorLayers.style.setProperty("--cells-z", this.z.toString());
        reactorLayers.style.setProperty("--cells-x", this.x.toString());
        for (let y = 0; y < this.y; y++) {
            let tempElement = document.createElement("div");
            tempElement.className = "layer";
            const layerInner = document.createElement("div");
            layerInner.classList.add("layerinner");
            for (let z = 0; z < this.z; z++) {
                for (let x = 0; x < this.x; x++) {
                    const cell = document.createElement("div");
                    cell.classList.add("cell");
                    if (!this.cellValid([x, y, z]))
                        cell.classList.add("invalid");
                    cell.addEventListener("click", e => {
                        defaultReactor.edit(x, y, z, getSelectedId());
                    });
                    cell.addEventListener("contextmenu", e => {
                        if (!e.shiftKey) {
                            defaultReactor.edit(x, y, z, 0);
                            e.preventDefault();
                        }
                    });
                    cell.style.setProperty("grid-row", (z + 1).toString());
                    cell.style.setProperty("grid-column", (x + 1).toString());
                    const type = this.getData([x, y, z]);
                    cell.title = type.tooltipText;
                    const img = document.createElement("img");
                    img.src = type.imagePath;
                    img.alt = type.displayedName;
                    img.style.width = "100%";
                    cell.appendChild(img);
                    layerInner.appendChild(cell);
                }
            }
            tempElement.appendChild(layerInner);
            reactorLayers.appendChild(tempElement);
        }
        reactorName.value = this.name;
        squarifyCells(reactorLayers);
    }
    export() {
        download(this.name.replace(/[./\\;"?]/, "_") + ".json", `{
				"readme":"Hello! You appear to have tried to open this JSON file with a text editor. You shouldn't be doing that as it's raw JSON which makes no sense. Please open this using the website at https://balam314.github.io/Einsteinium/index.html",
				"READMEALSO":"This is the data storage file for a NuclearCraft fission reactor generated with Einsteinium.",
				"content": ` + JSON.stringify(this.contents) + `,
				"metadata":{
					"version":"${VERSION}",
					"dimensions":[${this.x},${this.y},${this.z}],
					"name": "${this.name}",
					"validationCode": "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf."
				}
			}`);
    }
    exportToBG(includeCasings) {
        if (includeCasings) {
            console.warn("includeCasings is not yet implemented.");
        }
        const stateIntArray = this.contents.map(l => l.map(r => r.filter(c => cellTypes[c].blockData))).flat(2);
        const posIntArray = this.contents.map((l, y) => l.map((r, x) => r.map((c, z) => [c, z]).filter(([c]) => cellTypes[c].blockData).map(([, z]) => 65536 * x + 256 * y + z))).flat(2);
        const mapIntState = this.contents.map(l => l.map(r => r.map(c => cellTypes[c].blockData).filter((c) => c != undefined))).flat(2);
        return `{stateIntArray:[I;${stateIntArray.join(",")}],dim:0,posIntArray:[I;${posIntArray.join(",")}],startPos:{X:0,Y:0,Z:0},mapIntState:[${mapIntState.join(",")}],endPos:{X:${this.x - 1},Y:${this.y - 1},Z:${this.z - 1}}}`;
    }
    getAdjacentFuelCells(pos) {
        return adjacentPositions(pos).reduce((acc, pos) => acc + +(this.get(pos) == 1), 0);
    }
    getAdjacentModerators(pos) {
        return adjacentPositions(pos).reduce((acc, pos) => acc + +(this.getData(pos)?.type == "moderator"), 0);
    }
    getDistantAdjacentCells([x, y, z]) {
        return directions.reduce((acc, direction) => {
            let pos = [x, y, z];
            for (let i = 0; i <= settings.neutronRadiationReach; i++) {
                add(pos, direction);
                const cell = this.getData(pos);
                if (cell?.id == 1 && i > 0)
                    return acc + 1;
                else if (cell?.type == "moderator")
                    continue;
                else
                    return acc;
            }
            return acc;
        }, 0);
    }
    getAdjacentValidCells(pos, id) {
        return adjacentPositions(pos).reduce((acc, pos) => acc + +(this.get(pos) == id && this.cellValid(pos)), 0);
    }
    calculateStats() {
        let totalHeat = 0;
        let totalCooling = 0;
        let totalEnergyPerTick = 0;
        let cellsCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let y = 0; y < this.y; y++) {
            for (let x = 0; x < this.x; x++) {
                for (let z = 0; z < this.z; z++) {
                    const pos = [x, y, z];
                    const cell = this.get(pos);
                    const cellData = cellTypes[cell];
                    cellsCount[cell]++;
                    if (cell == 1) {
                        let adjacentCells = this.getAdjacentFuelCells(pos);
                        let distantAdjacentCells = this.getDistantAdjacentCells(pos);
                        let adjacentModerators = this.getAdjacentModerators(pos);
                        let heatMultiplier = (adjacentCells + distantAdjacentCells + 1) * (adjacentCells + distantAdjacentCells + 2) / 2;
                        let energyMultiplier = adjacentCells + distantAdjacentCells + 1;
                        energyMultiplier += adjacentModerators * (settings.moderatorExtraPower / 6) * (adjacentCells + distantAdjacentCells + 1);
                        heatMultiplier += adjacentModerators * (settings.moderatorExtraHeat / 6) * (adjacentCells + distantAdjacentCells + 1);
                        totalHeat += baseHeat * heatMultiplier;
                        totalEnergyPerTick += basePower * energyMultiplier;
                        this.getDOMCell(reactorLayers, x, y, z).title += `
Adjacent Cells: ${adjacentCells}
${distantAdjacentCells ? ("Distant \"adjacent\" cells: " + distantAdjacentCells + "\n") : ""}\
Adjacent Moderators: ${adjacentModerators}
Heat Multiplier: ${heatMultiplier * 100}%
Energy Multiplier: ${energyMultiplier * 100}%`;
                        console.log(`Set tooltip of cell ${pos} to: `, this.getDOMCell(reactorLayers, x, y, z).title);
                    }
                    else if (cellData.type == "cooler") {
                        if (this.cellValid(pos)) {
                            totalCooling -= settings.coolers[cell];
                        }
                    }
                }
            }
        }
        return { "heatgen": totalHeat, "cooling": totalCooling, "power": totalEnergyPerTick, "cellcount": cellsCount };
    }
    checkValidation(check, pos) {
        if (typeof check == "object") {
            for (const [key, value] of Object.entries(check)) {
                const checkPassed = key == "moderator" ? inRange(this.getAdjacentModerators(pos), value) :
                    key == "casing" ? inRange(this.getAdjacentValidCells(pos, null), value) :
                        inRange(this.getAdjacentValidCells(pos, key), value);
                if (!checkPassed)
                    return false;
            }
            return true;
        }
        else {
            return check(this, pos);
        }
    }
    updateCellsValidity() {
        for (let y in this.contents) {
            for (let x in this.contents[y]) {
                for (let z in this.contents[y][x]) {
                    const cellType = cellTypes[this.contents[y][x][z]];
                    const pos = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };
                    if (cellType.type == "misc") {
                        this.valids[pos.y][pos.x][pos.z] = true;
                    }
                    else {
                        this.valids[pos.y][pos.x][pos.z] = this.checkValidation(cellType.valid, [pos.x, pos.y, pos.z]);
                    }
                }
            }
        }
    }
    updateStats(DOMnode) {
        let stats = this.calculateStats();
        let netHeat = stats.heatgen + stats.cooling;
        let spaceEfficiency = 1 - (stats.cellcount[0] / (this.x * this.y * this.z));
        let numCasings = 2 * this.x * this.y + 2 * this.x * this.z + 2 * this.y * this.z;
        DOMnode.innerHTML = `
		<h1>Reactor Stats</h1>
		<br>
		<h2>Heat and Power</h2>
		Total heat: ${Math.round(10 * stats.heatgen) / 10} HU/t<br>
		Total cooling: ${Math.round(10 * stats.cooling) / 10} HU/t<br>
		Net heat gen: <${(netHeat <= 0) ? "span" : "strong"} style="color: ${(netHeat <= 0) ? "#00FF00" : "#FF0000"}">${Math.round(10 * netHeat) / 10} HU/t</${(netHeat <= 0) ? "span" : "strong"}><br>
		${(netHeat > 0) ? `Meltdown time: ${Math.floor((25000 * this.x * this.y * this.z) * 0.05 / netHeat)} s<br>` : ""}
		Max base heat: ${checkNaN(Math.floor(-stats.cooling / (stats.heatgen / baseHeat)), 0)}<br>
		Efficiency: ${checkNaN(Math.round(1000 * stats.power / (stats.cellcount[1] * basePower)) / 10, 100)}%<br>
		Total Power: ${stats.power} RF/t<br>
		Fuel Pellet Duration: ${Math.round(fuelTime / stats.cellcount[1]) / 20} s<br>
		Energy Per Pellet: ${checkNaN(stats.power * (fuelTime / stats.cellcount[1]), 0)} RF<br>
		<h2>Materials</h2>
		Casings: ${numCasings}<br>
		Fuel cells: ${stats.cellcount[1]}<br>
		Moderators: ${stats.cellcount[17] + stats.cellcount[18]}<br>
		Total coolers: ${sum(stats.cellcount.slice(2, 17))}<br>
		Space Efficiency: ${spaceEfficiency}%
		<h3>Coolers</h3>
		${cellTypes.map((t, i) => [i, t]).filter(([i, t]) => t.type == "cooler" && stats.cellcount[i] > 0).map(([i, t]) => `${t.displayedName}: ${stats.cellcount[i]}<br>`).join("\n")}
		`;
    }
}
function squarifyCells(reactorLayers) {
    const z = parseInt(reactorLayers.style.getPropertyValue("--cells-z"));
    const x = parseInt(reactorLayers.style.getPropertyValue("--cells-x"));
    const cellWidth = reactorLayers.childNodes[0].firstChild.offsetWidth / x;
    const cellHeight = reactorLayers.childNodes[0].firstChild.offsetHeight / z;
    for (let reactorLayerOuter of reactorLayers.childNodes) {
        let reactorLayer = reactorLayerOuter.firstChild;
        for (let cell of reactorLayer.childNodes) {
            cell.style.setProperty("width", cellWidth + "px");
            cell.style.setProperty("height", cellHeight + "px");
        }
    }
}
uploadButton.onchange = function (e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (readerEvent) {
        let content = readerEvent.target.result;
        console.log(content);
        loadReactor(content);
    };
};
document.body.onkeydown = e => {
    if (e.key in keybindMapping) {
        const cell = hotbarCells[keybindMapping[e.key]];
        if (!cell)
            throw new Error(`Bad keybind mapping: invalid key ${e.key}: invalid index ${keybindMapping[e.key]}`);
        cell.click();
    }
};
function selectCell() {
    for (const cell of hotbarCells) {
        cell.classList.remove("hotbarcellselected");
    }
    this.classList.add("hotbarcellselected");
}
function getSelectedId() {
    try {
        let calcedId = +document.getElementsByClassName("hotbarcellselected")[0].firstChild.src.split("/").pop().split(".")[0];
        if (calcedId in cellTypes) {
            return calcedId;
        }
    }
    catch (err) {
    }
    return 0;
}
function loadReactor(data) {
    try {
        assert(data.match(/[<>\\;^]|(script)/gi) == null, "Security check failed");
        const parsed = JSON.parse(data);
        assert(parsed.metadata.version.match(/[1-9].[0.9].[0-9]/gi), "Invalid version");
        assert(parsed.metadata.validationCode == "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.", "Incorrect validation code");
        if (parsed.metadata.version != VERSION) {
            console.warn("Loading JSON file with a different data version.");
        }
        assert(parsed.metadata.dimensions.length == 3, "Invalid dimenions");
        assert(typeof parsed.metadata.dimensions[0] == "number", "Invalid dimenions");
        assert(typeof parsed.metadata.dimensions[1] == "number", "Invalid dimenions");
        assert(typeof parsed.metadata.dimensions[2] == "number", "Invalid dimenions");
        let tempReactor = new Reactor(parsed.metadata.dimensions[0], parsed.metadata.dimensions[1], parsed.metadata.dimensions[2]);
        tempReactor.contents = parsed.content;
        tempReactor.name = parsed.metadata.name;
        assert(tempReactor.validate(), "Invalid data");
        defaultReactor = tempReactor;
        x_input.value = parsed.metadata.dimensions[0];
        y_input.value = parsed.metadata.dimensions[1];
        z_input.value = parsed.metadata.dimensions[2];
        defaultReactor.update();
    }
    catch (err) {
        loadNCReactorPlanner(data, "Imported Reactor");
    }
}
function loadNCReactorPlanner(rawData, filename) {
    try {
        assert(rawData.match(/[<>\\;^]|(script)/gi) == null);
        let data = JSON.parse(rawData);
        assert(typeof data.SaveVersion.Build == "number");
        assert(data.CompressedReactor);
        let tempReactor = new Reactor(data.InteriorDimensions.X, data.InteriorDimensions.Y, data.InteriorDimensions.Z);
        for (const name of Object.keys(ncrpMappings)) {
            if (data.CompressedReactor[name] instanceof Array) {
                for (const pos of data.CompressedReactor[name]) {
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
    }
    catch (err) {
        console.error("Invalid JSON!", err);
    }
}
function getHotbarCell(image, tooltip) {
    const div = document.createElement("div");
    div.classList.add("hotbarcell");
    div.addEventListener("click", selectCell);
    div.title = tooltip;
    const img = document.createElement("img");
    img.src = image;
    div.append(img);
    return div;
}
hotbar.append(...hotbarCells = [
    ...cellTypes
        .filter(cellType => cellType.placeable)
        .map(cellType => getHotbarCell(cellType.imagePath, cellType.tooltipText)),
    getHotbarCell("assets/00.png", "Remove")
]);
selectCell.call(hotbarCells[0]);
document.querySelector("#options-panel>.flex button")?.addEventListener("click", function () {
    open(atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=="));
    this.innerText = "what did you think would happen";
});
let defaultReactor;
function regenReactor() {
    defaultReactor = new Reactor(+x_input.value, +y_input.value, +z_input.value);
    defaultReactor.update();
}
regenReactor();
titleText.innerHTML = `<strong>Einsteinium</strong> beta v${VERSION}: editing `;
console.log("%cWelcome to Einsteinium!", "font-size: 50px; color: blue");
console.log("Version Beta v" + VERSION);
console.log("Einsteinium is a tool to help you build NuclearCraft fission reactors.");
console.warn("Einsteinium is currently in beta. This means there will probably be a few bugs, and features will be added regularly. If you find a bug please report it on this project's GitHub.");
window.everythingIsFine = true;
