import { CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, onSnapshot, Query, setDoc } from 'firebase/firestore'
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
	useEffect(() => setRestaurant(restaurants.find((restaurant) => restaurant.uid === restaurantUid)), [restaurantUid, restaurants.length])

	return [restaurant, setRestaurant]
}

export const useSubDoc = <T>(
	doc: DocumentReference<DocumentData>,
	deps: React.DependencyList = [],
	snapshotEffect: (snapshot: DocumentSnapshot<DocumentData>) => void = () => {}
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>, (data: T) => Promise<void>] => {
	const [docData, setDocData] = useState<T>()
	useEffect(
		() =>
			onSnapshot(doc, (snapshot) => {
				snapshotEffect(snapshot)
				setDocData(snapshot.data() as T)
			}),
		deps
	)
	return [docData, setDocData, (data: T) => setDoc(doc, data)]
}

export const useSubCollection = <T>(
	collection: Query<DocumentData> | CollectionReference<DocumentData>,
	deps: React.DependencyList = []
): [T[], React.Dispatch<React.SetStateAction<T[]>>] => {
	const [collectionData, setCollectionData] = useState<T[]>([])
	useEffect(() => onSnapshot(collection, (snapshot) => setCollectionData(snapshot.docs.map((doc) => doc.data() as T))), deps)
	return [collectionData, setCollectionData]
}
