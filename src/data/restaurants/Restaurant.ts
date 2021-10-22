import { Timestamp } from '@firebase/firestore'
import { getDay, setHours, setMinutes, setSeconds } from 'date-fns'
import { daysOfWeek, distinct, MapStringType as StringMap } from '../../util/misc'

export type RestaurantModel = {
	name: string
	uid: string
	hours: StringMap<{ open: string; close: string }> //map of days of week to hours in XXXX-YYYY 24-hr format
	description: string
	active: boolean
	manuallyClosed: boolean
	locations: RestaurantLocationModel[]
}

export type RestaurantLocationModel = {
	uid: string
	name: string
}

export type RestaurantItemModel = {
	restaurantUid: string
	name: string
	category: string
	price: number
	minutesToReady: number
	ingredients: RestaurantItemIngredientModel[]
	selectedIngredients: number[]
	options: RestaurantItemOptionModel[]
	uid: string
	description?: string
	locationUids: string[]
}

export type RestaurantItemOptionModel = {
	name: string
	selectable: RestaurantItemOptionSelectableModel[]
	selected: number
}

export type RestaurantItemOptionSelectableModel = { name: string; price: number }

export type RestaurantItemIngredientModel = {
	name: string
	price: number //the price increase for adding this ingredient
}

export type RestaurantBagItemModel = {
	restaurantItem: RestaurantItemModel
	note: string
	uid: string
}

export type RestaurantOrderModel = {
	displayName: string
	userUid: string
	restaurantUid: string
	restaurantLocation?: string
	restaurantBagItems: RestaurantBagItemModel[]
	scheduledPickup?: Timestamp
	submitted?: Timestamp
	accepted?: Timestamp
	rejected?: Timestamp
	pickupReady?: Timestamp
	fulfilled?: Timestamp
	uid: string
}

export const allCategories = (restaurantItems: RestaurantItemModel[] | RestaurantBagItemModel[]) =>
	restaurantItems.map((item) => ('restaurantItem' in item ? item.restaurantItem.category : item.category)).filter(distinct)

export const restaurantBagItemPrice = (restaurantBagItem: RestaurantBagItemModel) =>
	restaurantBagItem.restaurantItem.price +
	restaurantBagItem.restaurantItem.ingredients
		.filter((_, i) => restaurantBagItem.restaurantItem.selectedIngredients.includes(i))
		.map((ingredient) => ingredient.price ?? 0)
		.reduce((prev, cur) => prev + cur, 0) +
	restaurantBagItem.restaurantItem.options
		.map((option) => (option.selected && option.selected >= 0 ? option.selectable[option.selected].price ?? 0 : 0))
		.reduce((cur, prev) => cur + prev, 0)

export const orderTotalPrice = (restaurantOrder: RestaurantOrderModel | RestaurantBagItemModel[]) =>
	'restaurantBagItems' in restaurantOrder
		? restaurantOrder.restaurantBagItems.length
			? restaurantOrder.restaurantBagItems.map((bagItem) => restaurantBagItemPrice(bagItem)).reduce((prev, cur) => prev + cur, 0)
			: 0
		: restaurantOrder.length
		? restaurantOrder.map((bagItem) => restaurantBagItemPrice(bagItem)).reduce((prev, cur) => prev + cur, 0)
		: 0

export const orderReadyMinMinutes = (order: RestaurantOrderModel | RestaurantBagItemModel[]) =>
	Math.max(
		...('restaurantBagItems' in order ? order.restaurantBagItems : order)
			.map((restaurantBagItem) => restaurantBagItem.restaurantItem.minutesToReady ?? 30)
			.concat(0)
	)

export const getRestaurantHours = (restaurant: RestaurantModel, date: Date = new Date()): { start: Date; end: Date } | undefined => {
	const day = daysOfWeek[getDay(date)]
	if (restaurant.hours[day]) {
		const [open, close] = [restaurant.hours[day].open, restaurant.hours[day].close]
		const [openHrs, openMins] = [parseInt(open.slice(0, 2)), parseInt(open.slice(2))]
		const [closeHrs, closeMins] = [parseInt(close.slice(0, 2)), parseInt(close.slice(2))]
		return {
			start: setHours(setMinutes(setSeconds(date, 0), openMins), openHrs),
			end: setHours(setMinutes(setSeconds(date, 0), closeMins), closeHrs),
		}
	}
}

export const getMaxRestaurantHours = (restaurant: RestaurantModel): { start: number; end: number } => {
	const date = new Date()
	let earliest: Date = setHours(date, 23)
	let latest: Date = setHours(date, 0)
	daysOfWeek.forEach((day) => {
		if (!restaurant.hours[day]) return
		const [open, close] = [restaurant.hours[day].open, restaurant.hours[day].close]
		const [openHrs, openMins] = [parseInt(open.slice(0, 2)), parseInt(open.slice(2))]
		const [closeHrs, closeMins] = [parseInt(close.slice(0, 2)), parseInt(close.slice(2))]
		const [start, end] = [setHours(setMinutes(setSeconds(date, 0), openMins), openHrs), setHours(setMinutes(setSeconds(date, 0), closeMins), closeHrs)]
		if (start < earliest) earliest = start
		if (end > latest) latest = end
	})
	return { start: earliest.getHours(), end: latest.getHours() }
}
