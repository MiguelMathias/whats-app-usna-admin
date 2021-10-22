import { collection, collectionGroup, deleteDoc, doc, getDocs, onSnapshot, query, where } from '@firebase/firestore'
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonPage,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import { addOutline, checkmarkOutline, createOutline, removeOutline } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { allCategories, RestaurantItemModel, RestaurantModel } from '../../data/restaurants/Restaurant'
import { firestore } from '../../Firebase'
import { useGetRestaurant } from '../../util/hooks'
import { capitalize, encodeB64Url } from '../../util/misc'
import LoadingPage from '../LoadingPage'

type RestaurantMenuEditPageProps = {
	restaurants: RestaurantModel[]
}

const RestaurantMenuEditPage: React.FC<RestaurantMenuEditPageProps> = ({ restaurants }) => {
	const [restaurant, _] = useGetRestaurant(restaurants)
	const [restaurantItems, setRestaurantItems] = useState<RestaurantItemModel[]>([])
	const [editMode, setEditMode] = useState(false)

	useEffect(() => {
		if (restaurant)
			onSnapshot(collection(firestore, 'restaurants', restaurant.uid, 'items'), (snapshot) =>
				setRestaurantItems(snapshot.docs.map((doc) => doc.data() as RestaurantItemModel))
			)
	}, [restaurant?.uid])

	if (!restaurant) return <LoadingPage />
	//On menu item change, change all user favorites with the name and delete it from all bags
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/restaurants/${restaurant?.uid}`} />
					</IonButtons>{' '}
					<IonTitle>{capitalize(restaurant?.name)} Menu</IonTitle>
					<IonButtons slot='end'>
						<IonButton onClick={() => setEditMode(!editMode)}>
							<IonIcon slot='icon-only' icon={editMode ? checkmarkOutline : createOutline} />
						</IonButton>
						<IonButton routerLink={`/restaurants/${restaurant?.uid}/menu/add`}>
							<IonIcon slot='icon-only' icon={addOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					{allCategories(restaurantItems)?.map((category, i) => (
						<React.Fragment key={i}>
							<IonItemDivider>{category}</IonItemDivider>
							{restaurantItems
								.filter((restaurantItem) => restaurantItem.category === category)
								.map((restaurantItem, i) => (
									<IonItem
										detail={!editMode}
										routerLink={editMode ? undefined : `/restaurants/${restaurant.uid}/menu/${encodeB64Url(restaurantItem)}`}
										key={i}
									>
										{editMode && (
											<IonButtons slot='start'>
												<IonButton
													onClick={async () => {
														const restaurantItemToDelete = doc(
															firestore,
															'restaurants',
															restaurant.uid,
															'items',
															restaurantItem.uid
														)
														const favoriteItemsToDelete = await Promise.all(
															(
																await getDocs(
																	query(
																		collectionGroup(firestore, 'favorites'),
																		where('restaurantItem.uid', '==', restaurantItem.uid)
																	)
																)
															).docs
														)
														const bagItemsToDelete = (
															await getDocs(
																query(collectionGroup(firestore, 'bag'), where('restaurantItem.uid', '==', restaurantItem.uid))
															)
														).docs
														await Promise.all(
															favoriteItemsToDelete
																.concat(bagItemsToDelete)
																.map((doc) => doc.ref)
																.concat(restaurantItemToDelete)
																.map(deleteDoc)
														)
														console.log('Deleted all restaurant items of name ' + restaurantItem.name)
													}}
												>
													<IonIcon slot='icon-only' icon={removeOutline} />
												</IonButton>
											</IonButtons>
										)}
										<IonLabel>{restaurantItem.name}</IonLabel>
									</IonItem>
								))}
						</React.Fragment>
					))}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default RestaurantMenuEditPage
