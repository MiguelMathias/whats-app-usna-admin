export type Repeat = undefined | 'Daily' | 'Weekly' | 'Monthly'

export type Barber = {
	name: string
	appointments: Date[]
	availableTimes: [Date, Repeat][]
	unavailableTimes: [Date, Repeat][]
}

export const allBarbershopServices = [
	'Male Haircut',
	'Deep Conditioner & Blow Dry',
	'Shampoo & Haircut',
	'Blow Dry & Flat Iron',
	'Braids',
	'Facial Waxing',
] as const

export const allBarbershopAddOnServices = ['Perm', 'Relaxer'] as const

export type Service = typeof allBarbershopServices[number]

export type AddOnService = typeof allBarbershopAddOnServices[number]
