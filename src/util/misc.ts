import { format } from 'date-fns'

export type MapString<V> = { [key: string]: V }

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const distinct = (value: any, index: any, self: string | any[]) => self.indexOf(value) === index

export const encodeB64Url = <T>(objectToEncode: T) => encodeURI(btoa(JSON.stringify(objectToEncode)))
export const decodeB64Url = <T>(strToDecode: string) => JSON.parse(atob(decodeURI(strToDecode))) as T

export const formatDateDefault = (date?: Date) => (date ? format(date, 'EEE, MMM d y H:mm') : '')

export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

declare global {
	interface Array<T> {
		remove(elem: T, item?: T): T[]
		removeIndex(index: number, item?: T): T[]
		indexOfValue(elem: T): number
		insertIndex(index: number, ...items: T[]): T[]
		filterMap<U>(callbackfn: (value: T, index: number, self: T[], newArr: U[]) => U | undefined): U[]
	}

	interface Date {
		getDateWithoutTime(): Date
	}
}

if (!Array.prototype.remove)
	Array.prototype.remove = function <T>(this: T[], elem: T, item?: T): T[] {
		const index = this.indexOfValue(elem)
		if (index !== -1) return this.removeIndex(index)
		return this
	}

if (!Array.prototype.removeIndex)
	Array.prototype.removeIndex = function <T>(this: T[], index: number, item?: T): T[] {
		return this.slice(0, index).concat(this.slice(index + 1))
	}

if (!Array.prototype.indexOfValue)
	Array.prototype.indexOfValue = function <T>(this: T[], elem: T): number {
		let index = -1
		this.forEach((item, itemIndex) => (index = object_equals(item, elem) ? itemIndex : index))

		return index
	}

if (!Array.prototype.insertIndex)
	Array.prototype.insertIndex = function <T>(this: T[], index: number, ...items: T[]) {
		return [...this.slice(0, index), ...items, ...this.slice(index)]
	}

if (!Array.prototype.filterMap)
	Array.prototype.filterMap = function <T, U>(this: T[], callbackfn: (value: T, index: number, self: T[], newSelf: U[]) => U | undefined) {
		const newArr = [] as U[]
		let i = 0
		for (const item of this) {
			const result = callbackfn(item, i, this, newArr)
			if (result) newArr.push(result)

			i++
		}
		return newArr
	}

if (!Date.prototype.getDateWithoutTime)
	Date.prototype.getDateWithoutTime = function () {
		return new Date(this.toDateString())
	}

export const getAcademicYear = (date = new Date()) => (date.getMonth() > 5 ? date.getFullYear() + 1 : date.getFullYear())

export const range = (size: number, startAt: number = 0) => [...Array(size).keys()].map((i) => i + startAt)

const object_equals = (x: any, y: any): boolean => {
	if (x === y) return true
	// if both x and y are null or undefined and exactly the same

	if (!(x instanceof Object) || !(y instanceof Object)) return false
	// if they are not strictly equal, they both need to be Objects

	if (x.constructor !== y.constructor) return false
	// they must have the exact same prototype chain, the closest we can do is
	// test there constructor.

	for (var p in x) {
		if (!x.hasOwnProperty(p)) continue
		// other properties were tested using x.constructor === y.constructor

		if (!y.hasOwnProperty(p)) return false
		// allows to compare x[ p ] and y[ p ] when set to undefined

		if (x[p] === y[p]) continue
		// if they have the same strict value or identity then they are equal

		if (typeof x[p] !== 'object') return false
		// Numbers, Strings, Functions, Booleans must be strictly equal

		if (!object_equals(x[p], y[p])) return false
		// Objects and Arrays must be tested recursively
	}

	for (p in y) if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false
	// allows x[ p ] to be set to undefined

	return true
}
