import { CollectionReference, DocumentData, DocumentReference, onSnapshot, Query } from 'firebase/firestore'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { RestaurantModel } from '../data/restaurants/Restaurant'

export const useForceUpdate = () => {
	const [forceUpdate, setForceUpdate] = useState(false)
	return () => {
		setForceUpdate(!forceUpdate)
	}
}

export const useGetRestaurant = (
	restaurants: RestaurantModel[]
): [RestaurantModel | undefined, Dispatch<SetStateAction<RestaurantModel | undefined>>] => {
	const { restaurantUid } = useParams<{ restaurantUid: string }>()
	const [restaurant, setRestaurant] = useState(
		restaurantUid === 'add'
			? ({
					name: '',
					uid: '',
					hours: {},
					active: false,
					manuallyClosed: false,
					description: '',
					locations: [],
			  } as RestaurantModel)
			: restaurants.find((restaurant) => restaurant.uid === restaurantUid)
	)
	useEffect(
		() => setRestaurant(restaurants.find((restaurant) => restaurant.uid === restaurantUid)),
		[restaurantUid, restaurants.length]
	)

	return [restaurant, setRestaurant]
}

export const useSubDoc = <T>(
	doc: DocumentReference<DocumentData>,
	deps: React.DependencyList | undefined = []
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] => {
	const [docData, setDocData] = useState<T>()
	useEffect(() => onSnapshot(doc, (snapshot) => setDocData(snapshot.data() as T)), deps)
	return [docData, setDocData]
}

export const useSubCollection = <T>(
	collection: Query<DocumentData> | CollectionReference<DocumentData>,
	deps: React.DependencyList | undefined = []
): [T[], React.Dispatch<React.SetStateAction<T[]>>] => {
	const [collectionData, setCollectionData] = useState<T[]>([])
	useEffect(
		() => onSnapshot(collection, (snapshot) => setCollectionData(snapshot.docs.map((doc) => doc.data() as T))),
		deps
	)
	return [collectionData, setCollectionData]
}
