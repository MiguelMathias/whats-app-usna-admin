import { Timestamp } from 'firebase/firestore'

export type TrackerModel = {
	uid: string
	dept: string
	category?: string
	title: string
	posted?: Timestamp
	items: TrackerItemModel[]
	maxRecords?: number
	midsAndCos: string[]
}

export type TrackerItemModel = {
	alpha: string
	company?: string
}
