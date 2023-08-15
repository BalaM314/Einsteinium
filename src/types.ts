
interface ObjectConstructor {
	/**
	 * Returns an array of key/values of the enumerable properties of an object
	 * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
	 */
	keys<const K extends PropertyKey>(o: Record<K, unknown>):K[];
	entries<const K extends PropertyKey, T>(o: { [_ in K]: T } | ArrayLike<T>): [K, T][];
	fromEntries<const K extends PropertyKey, T>(o: Iterable<readonly [K, T]>): Record<K, T>;
}
type BlockID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;
type Pos = [x:number, y:number, z:number];
type RangeSpecifier = number | [min:number, max:number];

