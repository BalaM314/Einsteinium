


type PreprocessedCellData = PreprocessedBasicCellData & (PreprocessedMiscCellData | PreprocessedCoolerCellData | PreprocessedModeratorCellData);
type CellValidCheckObject = {
	[_ in BlockID | "moderator" | "casing"]?: RangeSpecifier;
};
type CellValidCheck = CellValidCheckObject | ((reactor:Reactor, cell:Pos) => boolean);
interface PreprocessedBasicCellData {
	displayedName: string;
	description: string;
	blockData?: string;
	ncrpName?: string;
	placeable?: boolean;
}
interface PreprocessedMiscCellData {
	type: "misc";
}
interface PreprocessedCoolerCellData {
	coolAmount: [passive:number, active:number];
	type: "cooler";
	valid: CellValidCheck;
}
interface PreprocessedModeratorCellData {
	type: "moderator";
	valid: CellValidCheck;
}
type CellData = PreprocessedBasicCellData & (PreprocessedMiscCellData | (Omit<PreprocessedCoolerCellData, "coolAmount"> & {
	coolAmount: number;
}) | PreprocessedModeratorCellData) & {
	imagePath: string;
	id: BlockID;
	placeable: boolean;
	tooltipText: string;
	activeCooler?: boolean;
};
const removeActiveBitmask = ~ 32;
const activeCoolerBlockData = `Name:"nuclearcraft:active_cooler"`;
const cellTypes = ((d:PreprocessedCellData[]):CellData[] => {
	d.forEach((t, i) => {
		if(t.type == "cooler"){
			d[i + 32] = {
				...t,
				coolAmount: [t.coolAmount[1], t.coolAmount[1]], //bit of a hack...,
				displayedName: `Active ${t.displayedName}`,
				ncrpName: `Active ${t.ncrpName}`,
				blockData: activeCoolerBlockData,
			};
		}
	});
	return d.map((t, i) => ({
		...t,
		coolAmount: "coolAmount" in t ? t.coolAmount[0] : undefined!, //yet another hack, but I claim to know better than typecript here: if ! "coolAmount" in t then t is not a cooler, so coolAmount should be undefined
		id: i as BlockID,
		imagePath: `assets/${i & removeActiveBitmask}.png`,
		placeable: t.placeable ?? (t.type == "cooler" || t.type == "moderator"),
		tooltipText: `${t.displayedName}\n${t.description}`,
		activeCooler: t.type == "cooler" ? t.coolAmount[0] == t.coolAmount[1] : undefined //also a hack
	}))
})([
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
		placeable: true,
	},{
		displayedName: "Water Cooler",
		type: "cooler",
		description: "Requires at least one fuel cell or active moderator.",
		blockData: `Properties:{type:"water"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Water",
		coolAmount: [60, 150],
		valid(reactor, pos){
			return reactor.getAdjacentFuelCells(pos) >= 1 || reactor.getAdjacentModerators(pos) >= 1;
		},
	},{
		displayedName: "Redstone Cooler",
		type: "cooler",
		description: "Requires at least one fuel cell.",
		blockData: `Properties:{type:"redstone"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Redstone",
		coolAmount: [90, 3200],
		valid: {
			1: 1
		}
	},{
		displayedName: "Quartz Cooler",
		type: "cooler",
		description: "Requires at least one active moderator.",
		blockData: `Properties:{type:"redstone"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Quartz",
		coolAmount: [90, 3000],
		valid: {
			moderator: 1
		}
	},{
		displayedName: "Gold Cooler",
		type: "cooler",
		description: "Requires at least one redstone cooler and water cooler.",
		blockData: `Properties:{type:"gold"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Gold",
		coolAmount: [120, 4800],
		valid: {
			2: 1, 3: 1
		}
	},{
		displayedName: "Glowstone Cooler",
		type: "cooler",
		description: "Requires at least two active moderators.",
		blockData: `Properties:{type:"glowstone"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Glowstone",
		coolAmount: [130, 4000],
		valid: {
			moderator: 2
		}
	},{
		displayedName: "Lapis Cooler",
		type: "cooler",
		description: "Requires at least one fuel cell and casing.",
		blockData: `Properties:{type:"lapis"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Lapis",
		coolAmount: [120, 2800],
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
		coolAmount: [150, 7000],
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
		coolAmount: [140, 6600],
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
		coolAmount: [120, 5400],
		valid(reactor, [x, y, z]){
			return (
				(x == 0 || x == reactor.x - 1) &&
				(y == 0 || y == reactor.y - 1) &&
				(z == 0 || z == reactor.z - 1)
			);
		},
	},{
		displayedName: "Cryotheum Cooler",
		type: "cooler",
		description: "Requires at least two fuel cells.",
		blockData: `Properties:{type:"cryotheum"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Cryotheum",
		coolAmount: [160, 6400],
		valid: {
			1: 2,
		}
	},{
		displayedName: "Iron Cooler",
		type: "cooler",
		description: "Requires at least one gold cooler.",
		blockData: `Properties:{type:"iron"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Iron",
		coolAmount: [80, 2400],
		valid: {
			5: 1,
		}
	},{
		displayedName: "Emerald Cooler",
		type: "cooler",
		description: "Requires at least one moderator and fuel cell.",
		blockData: `Properties:{type:"emerald"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Emerald",
		coolAmount: [160, 3600],
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
		coolAmount: [80, 2600],
		valid: {
			6: 1,
		}
	},{
		displayedName: "Tin Cooler",
		type: "cooler",
		description: "Requires two lapis coolers on opposite sides.",
		blockData: `Properties:{type:"tin"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Tin",
		coolAmount: [120, 3000],
		valid(reactor, [x, y, z]){
			const pairs:[Pos, Pos][] = [
				[[x + 1, y, z], [x - 1, y, z]],
				[[x, y + 1, z], [x, y - 1, z]],
				[[x, y, z + 1], [x, y, z - 1]],
			];
			for(const [a, b] of pairs){
				if(reactor.isIDAndValid(a, 7) && reactor.isIDAndValid(b, 7)){
					return true;
				}
			}
			return false;
		}
	},{
		displayedName: "Magnesium Cooler",
		type: "cooler",
		description: "Requires at least one casing and moderator.",
		blockData: `Properties:{type:"magnesium"},Name:"nuclearcraft:cooler"`,
		ncrpName: "Magnesium",
		coolAmount: [110, 3600],
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

const ncrpMappings = Object.fromEntries([
	...cellTypes.map((t, i) => [t.ncrpName, i as BlockID] as const).filter((x):x is [string, BlockID] => x[0] != undefined)
]) satisfies Record<string, BlockID>;
const moderatorIds = cellTypes.map((t, i) => [t, i] as const).filter(([t, i]) => t.type == "moderator").map(([t, i]) => i);

