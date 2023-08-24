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
const validationCode = "This is a string of text that only Einsteinium's data files should have and is used to validate the JSON. Einsteinium is a tool to help you plan NuclearCraft fission reactors. grhe3uy48er9tfijrewiorf.";
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
    "coolers": [0, 0, 60, 90, 90, 120, 130, 120, 150, 140, 120, 160, 80, 160, 80, 120, 110],
    "activeCoolers": [0, 0, 150, 3200, 3000, 4800, 4000, 2800, 7000, 6600, 5400, 6400, 2400, 3600, 2600, 3000, 3600],
};
let placingActiveCooler = false;
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
        this.contents = array3D(y, x, z, 0);
        this.valids = array3D(y, x, z, false);
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
    edit([x, y, z], id) {
        if (isNaN(id) || !(id in cellTypes)) {
            console.error(`Invalid attempt to edit reactor 1 at position ${x},${y},${z} with bad id ${id}`);
            return false;
        }
        this.contents[y][x][z] = id;
        this.update();
        return true;
    }
    update() {
        this.updateCellsValidity();
        this.updateCellsValidity();
        this.updateCellsValidity();
        this.updateCellsValidity();
        const stats = this.calculateStats();
        this.updateStats(statsPanel, stats);
        this.updateDOM(reactorLayers, stats);
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
    getDOMCell(reactorLayers, [x, y, z]) {
        return reactorLayers.childNodes[y].childNodes[(z * this.x) + x];
    }
    updateDOM(reactorLayers, { cellInfo }) {
        reactorLayers.innerHTML = "";
        reactorLayers.style.setProperty("--cells-z", this.z.toString());
        reactorLayers.style.setProperty("--cells-x", this.x.toString());
        function cellClicked(e) {
            const y = +this.parentElement.getAttribute("y");
            const [z, x] = this.style.gridArea.split(" / ").map(a => +a - 1);
            const pos = [x, y, z];
            if (e.buttons & 2 && e.shiftKey) {
                return;
            }
            else if (e.buttons & 2 && !e.shiftKey) {
                defaultReactor.edit(pos, 0);
            }
            else if (e.buttons & 4) {
                const id = defaultReactor.get(pos);
                if (id != null) {
                    selectCell.call(hotbarCells.at(id - 1));
                }
            }
            else {
                defaultReactor.edit(pos, getSelectedId(e.shiftKey));
            }
        }
        function cellContextMenued(e) {
            if (e.buttons & 2 && e.shiftKey) {
            }
            else {
                e.preventDefault();
            }
        }
        for (let y = 0; y < this.y; y++) {
            const layer = document.createElement("div");
            layer.classList.add("layer");
            layer.setAttribute("y", y.toString());
            for (let z = 0; z < this.z; z++) {
                for (let x = 0; x < this.x; x++) {
                    const pos = [x, y, z];
                    const cell = document.createElement("div");
                    const stat = cellInfo[y][x][z];
                    const type = this.getData(pos);
                    const extraTooltip = ("adjacentCells" in stat) ?
                        `\nAdjacent Cells: ${stat.adjacentCells}
${stat.distantAdjacentCells ? ("Distant \"adjacent\" cells: " + stat.distantAdjacentCells + "\n") : ""}\
Adjacent Moderators: ${stat.adjacentModerators}
Heat Multiplier: ${stat.heatMultiplier * 100}%
Energy Multiplier: ${stat.energyMultiplier * 100}%`
                        : "";
                    const activeTooltip = type.activeCooler ? `` : "";
                    cell.classList.add("cell");
                    if (!this.cellValid(pos))
                        cell.classList.add("invalid");
                    if (type.activeCooler)
                        cell.classList.add("active-cooler");
                    cell.addEventListener("mousedown", cellClicked);
                    cell.addEventListener("contextmenu", cellContextMenued);
                    cell.style.setProperty("grid-row", (z + 1).toString());
                    cell.style.setProperty("grid-column", (x + 1).toString());
                    cell.title = type.tooltipText + extraTooltip + activeTooltip;
                    cell.style.backgroundImage = `url(${type.imagePath})`;
                    layer.appendChild(cell);
                }
            }
            reactorLayers.appendChild(layer);
        }
        reactorName.value = this.name;
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
					"validationCode": "${validationCode}"
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
        let cellsCount = Array(cellTypes.length).fill(0);
        let cellInfo = array3D(this.y, this.x, this.z, null);
        for (let y = 0; y < this.y; y++) {
            for (let x = 0; x < this.x; x++) {
                for (let z = 0; z < this.z; z++) {
                    const pos = [x, y, z];
                    const id = this.get(pos);
                    const type = cellTypes[id];
                    cellsCount[id]++;
                    cellInfo[y][x][z] = {
                        id, type
                    };
                    if (id == 1) {
                        let adjacentCells = this.getAdjacentFuelCells(pos);
                        let distantAdjacentCells = this.getDistantAdjacentCells(pos);
                        let adjacentModerators = this.getAdjacentModerators(pos);
                        let heatMultiplier = (adjacentCells + distantAdjacentCells + 1) * (adjacentCells + distantAdjacentCells + 2) / 2;
                        let energyMultiplier = adjacentCells + distantAdjacentCells + 1;
                        energyMultiplier += adjacentModerators * (settings.moderatorExtraPower / 6) * (adjacentCells + distantAdjacentCells + 1);
                        heatMultiplier += adjacentModerators * (settings.moderatorExtraHeat / 6) * (adjacentCells + distantAdjacentCells + 1);
                        totalHeat += baseHeat * heatMultiplier;
                        totalEnergyPerTick += basePower * energyMultiplier;
                        cellInfo[y][x][z] = {
                            ...cellInfo[y][x][z],
                            adjacentCells, adjacentModerators, distantAdjacentCells,
                            energyMultiplier, heatMultiplier
                        };
                    }
                    else if (type.type == "cooler") {
                        if (this.cellValid(pos)) {
                            totalCooling -=
                                id & 32 ? settings.activeCoolers[id & removeActiveBitmask] : settings.coolers[id];
                        }
                    }
                }
            }
        }
        assertType(cellInfo);
        cellsCount[19] = 2 * (this.x * this.y + this.x * this.z + this.y * this.z);
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
        };
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
        for (let y = 0; y < this.y; y++) {
            for (let x = 0; x < this.x; x++) {
                for (let z = 0; z < this.z; z++) {
                    const pos = [x, y, z];
                    const cellType = this.getData(pos);
                    if (cellType.type == "misc") {
                        this.valids[y][x][z] = true;
                    }
                    else {
                        this.valids[y][x][z] = this.checkValidation(cellType.valid, pos);
                    }
                }
            }
        }
    }
    updateStats(DOMnode, { cellInfo, cellsCount, totalCooling, totalEnergyPerTick, totalHeat, netHeat, spaceEfficiency }) {
        DOMnode.innerHTML = `\
		<h1>Reactor Stats</h1>
		<br>
		<h2>Heat and Power</h2>
		Total heat: ${round(totalHeat, 10)} HU/t<br>
		Total cooling: ${round(totalCooling, 10)} HU/t<br>
		Net heat gen: <${(netHeat <= 0) ? "span" : "strong"} style="color: ${(netHeat <= 0) ? "#00FF00" : "#FF0000"}">${round(netHeat, 10)} HU/t</${(netHeat <= 0) ? "span" : "strong"}><br>
		${(netHeat > 0) ? `Meltdown time: ${Math.floor((25000 * this.x * this.y * this.z) * 0.05 / netHeat)} s<br>` : ""}
		Max base heat: ${checkNaN(Math.floor(-totalCooling / (totalHeat / baseHeat)), 0)}<br>
		Efficiency: ${checkNaN(round(totalEnergyPerTick / (cellsCount[1] * basePower) * 100, 2), 100)}%<br>
		Total Power: ${round(totalEnergyPerTick)} RF/t<br>
		Fuel Pellet Duration: ${checkNaN(round(fuelTime / cellsCount[1] / 20, 1), 0, true)} s<br>
		Energy Per Pellet: ${checkNaN(round(totalEnergyPerTick * fuelTime / cellsCount[1]), 0)} RF<br>
		Space Efficiency: ${round(spaceEfficiency * 100, 2)}%
		<h2>Materials</h2>
		Casings: ${cellsCount[19]}<br>
		Fuel cells: ${cellsCount[1]}<br>
		Moderators: ${cellsCount[17] + cellsCount[18]}<br>
		<h3>Coolers</h3>
		${cellTypes.map((t, i) => [i, t]).filter(([i, t]) => t.type == "cooler" && cellsCount[i] > 0).map(([i, t]) => `${t.displayedName}: ${cellsCount[i]}<br>`).join("\n")}
		Total coolers: ${sum(cellsCount.slice(2, 17))}<br>
		`;
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
function getSelectedId(shift = false) {
    let calcedId = +(hotbarCells.find(c => c.classList.contains("hotbarcellselected"))?.getAttribute("block-id") ?? 0);
    if (calcedId in cellTypes) {
        const type = cellTypes[calcedId];
        if (type.type == "cooler" && (placingActiveCooler != shift))
            return calcedId + 32;
        else
            return calcedId;
    }
    else
        return 0;
}
function loadReactor(data) {
    try {
        const parsed = JSON.parse(data);
        assert(parsed.metadata.version.match(/[1-9].[0.9].[0-9]/gi), "Invalid version");
        assert(parsed.metadata.validationCode == validationCode, "Incorrect validation code");
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
        tempReactor.update();
        defaultReactor = tempReactor;
        x_input.value = parsed.metadata.dimensions[0];
        y_input.value = parsed.metadata.dimensions[1];
        z_input.value = parsed.metadata.dimensions[2];
    }
    catch (err) {
        loadNCReactorPlanner(data, "Imported Reactor");
    }
}
function loadNCReactorPlanner(rawData, filename) {
    try {
        let data = JSON.parse(rawData);
        assert(typeof data.SaveVersion.Build == "number");
        assert(data.CompressedReactor);
        assert(typeof data.InteriorDimensions.X == "number", "Invalid dimenions");
        assert(typeof data.InteriorDimensions.Y == "number", "Invalid dimenions");
        assert(typeof data.InteriorDimensions.Z == "number", "Invalid dimenions");
        let tempReactor = new Reactor(data.InteriorDimensions.X, data.InteriorDimensions.Y, data.InteriorDimensions.Z);
        for (const name in ncrpMappings) {
            if (data.CompressedReactor[name] instanceof Array) {
                for (const pos of data.CompressedReactor[name]) {
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
    }
    catch (err) {
        console.error("Invalid JSON!", err);
    }
}
function getHotbarCell(image, tooltip, id) {
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
hotbar.append(...hotbarCells = [
    ...cellTypes
        .filter(cellType => cellType.placeable && !cellType.activeCooler)
        .map(cellType => getHotbarCell(cellType.imagePath, cellType.tooltipText, cellType.id)),
    getHotbarCell("assets/00.png", "Remove", 0)
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
