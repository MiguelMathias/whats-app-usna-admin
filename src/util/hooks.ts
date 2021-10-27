import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { RestaurantModel } from '../data/restaurants/Restaurant'

export const useForceUpdate = () => {
	const [forceUpdate, setForceUpdate] = useState(false)
	return () => {
		setForceUpdate(!forceUpdate)
	}
}

export const useGetRestaurant = (restaurants: RestaurantModel[]): [RestaurantModel | undefined, Dispatch<SetStateAction<RestaurantModel | undefined>>] => {
	const { restaurantUid } = useParams<{ restaurantUid: string }>()
	const [restaurant, setRestaurant] = useState(
		restaurantUid === 'add'
			? ({ name: '', uid: '', hours: {}, active: false, manuallyClosed: false, description: '', locations: [] } as RestaurantModel)
			: restaurants.find((restaurant) => restaurant.uid === restaurantUid)
	)
	useEffect(() => setRestaurant(restaurants.find((restaurant) => restaurant.uid === restaurantUid)), [restaurantUid, restaurants.length])

	return [restaurant, setRestaurant]
}
