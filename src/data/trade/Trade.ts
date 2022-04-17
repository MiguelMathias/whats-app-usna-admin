import { Timestamp } from 'firebase/firestore'

export type TradeOfferModel = {
	uid: string
	posterUid: string
	title: string
	category: TradeCategoryModel
	price: number
	description: string
	roomNumber?: string
	phoneNumber?: string
	venmoId?: string
	email?: string
	active: boolean
	posted?: Timestamp
	bestBid?: { price: number; email: string }
}

export const tradeCategories = [
	'Art',
	'Books',
	'Camera/Photo',
	'Car',
	'Cell Phones/Accessories',
	'Clothing',
	'Collectibles',
	'Computers/Electronics',
	'Gift Cards',
	'Health/Beauty',
	'Jewelry',
	'Music/Gear',
	'Services',
	'Sporting Goods',
	'Toys/Hobbies',
	'Travel',
	'Video Games',
	'Other',
] as const

export type TradeCategoryModel = typeof tradeCategories[number]

export const sortTypes = ['posted-desc', 'posted-asc', 'title-desc', 'title-asc', 'price-desc', 'price-asc'] as const

export type SortType = typeof sortTypes[number]
