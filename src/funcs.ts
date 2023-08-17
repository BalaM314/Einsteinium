
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
function array3D<T = number>(a:number, b:number, c:number, value:T){
	return Array.from({length: a}, () =>
		Array.from({length: b}, () => 
			Array.from({length: c}, () => value)
		)
	)
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
function adjacentPositions([x, y, z]:Pos):Pos[]{
	return [
		[x + 1, y, z],
		[x, y + 1, z],
		[x, y, z + 1],
		[x - 1, y, z],
		[x, y - 1, z],
		[x, y, z - 1],
	];
}
const directions:Pos[] = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
	[-1, 0, 0],
	[0, -1, 0],
	[0, 0, -1],
];
/** Adds `amount` to `pos`. */
function add(pos:Pos, amount:Pos){
	pos[0] += amount[0];
	pos[1] += amount[1];
	pos[2] += amount[2];
}
function download(filename:string, text:string){
	//there is no better way...
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
/** Does not do any actual checking. */
function assertType<T>(value:unknown):asserts value is T {}
function round(amount:number, places = 0):number {
	const tenEplaces = 10 ** places;
	return Math.round(amount * tenEplaces) / tenEplaces;
}