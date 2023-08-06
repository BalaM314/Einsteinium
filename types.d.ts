
interface ObjectConstructor {
	/**
	 * Returns an array of key/values of the enumerable properties of an object
	 * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
	 */
	keys<const K extends PropertyKey>(o: Record<K, unknown>):K[];
	entries<const K extends PropertyKey, T>(o: { [_ in K]: T } | ArrayLike<T>): [K, T][];
	fromEntries<const K extends PropertyKey, T>(o: Iterable<readonly [K, T]>): Record<K, T>;
}
