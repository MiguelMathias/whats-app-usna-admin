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
import { allCategories, RestaurantBagItemModel, RestaurantModel } from '../../data/restaurants/Restaurant'
import { deleteStorageFolder, firestore, storage } from '../../Firebase'
import { useGetRestaurant } from '../../util/hooks'
import { capitalize, encodeB64Url } from '../../util/misc'
import LoadingPage from '../LoadingPage'

type RestaurantMenuEditPageProps = {
	restaurants: RestaurantModel[]
}

const RestaurantMenuEditPage: React.FC<RestaurantMenuEditPageProps> = ({ restaurants }) => {
	const [restaurant, _] = useGetRestaurant(restaurants)
	const [restaurantBagItems, setRestaurantBagItems] = useState<RestaurantBagItemModel[]>([])
	const [editMode, setEditMode] = useState(false)

	useEffect(() => {
		if (restaurant)
			onSnapshot(collection(firestore, 'restaurants', restaurant.uid, 'items'), (snapshot) =>
				setRestaurantBagItems(snapshot.docs.map((doc) => doc.data() as RestaurantBagItemModel))
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
			<IonContent fullscreen>
				<IonList>
					{allCategories(restaurantBagItems)?.map((category, i) => (
						<React.Fragment key={i}>
							<IonItemDivider>{category}</IonItemDivider>
							{restaurantBagItems
								.filter((restaurantBagItem) => restaurantBagItem.restaurantItem.category === category)
								.map((restaurantBagItem, i) => (
									<IonItem
										detail={!editMode}
										routerLink={
											editMode ? undefined : `/restaurants/${restaurant.uid}/menu/${encodeB64Url(restaurantBagItem.restaurantItem)}`
										}
										key={i}
									>
										{editMode && (
											<IonButtons slot='end'>
												<IonButton
													onClick={async () => {
														console.log(restaurantBagItem)
														const restaurantItemToDelete = doc(
															firestore,
															'restaurants',
															restaurant.uid,
															'items',
															restaurantBagItem.restaurantItem.uid
														)
														const favoriteItemsToDelete = await Promise.all(
															(
																await getDocs(
																	query(
																		collectionGroup(firestore, 'favorites'),
																		where('restaurantItem.uid', '==', restaurantBagItem.uid)
																	)
																)
															).docs
														)
														const bagItemsToDelete = (
															await getDocs(
																query(
																	collectionGroup(firestore, 'bag'),
																	where('restaurantItem.uid', '==', restaurantBagItem.uid)
																)
															)
														).docs
														await Promise.all(
															favoriteItemsToDelete
																.concat(bagItemsToDelete)
																.map((doc) => doc.ref)
																.concat(restaurantItemToDelete)
																.map(deleteDoc)
														)
														console.log('Deleted all restaurant items of name ' + restaurantBagItem.restaurantItem.name)
														//Delete item folder from firebase storage
														await deleteStorageFolder(
															storage,
															`restaurants/${restaurant.uid}/items/${restaurantBagItem.restaurantItem.uid}`
														)
													}}
												>
													<IonIcon slot='icon-only' icon={removeOutline} />
												</IonButton>
											</IonButtons>
										)}
										<IonLabel>{restaurantBagItem.restaurantItem.name}</IonLabel>
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
