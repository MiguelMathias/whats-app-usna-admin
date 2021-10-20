import { collectionGroup, deleteDoc, getDoc, getDocs, query, setDoc } from '@firebase/firestore'
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonCheckbox,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonMenuButton,
	IonPage,
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonPopover,
	useIonRouter,
} from '@ionic/react'
import { collection, doc, where } from 'firebase/firestore'
import { checkmarkOutline } from 'ionicons/icons'
import React, { useState } from 'react'
import { useParams } from 'react-router'
import { RestaurantModel } from '../../data/restaurants/Restaurant'
import { firestore } from '../../Firebase'
import { useGetRestaurant } from '../../util/hooks'
import { capitalize, daysOfWeek } from '../../util/misc'
import LoadingPage from '../LoadingPage'

type RestaurantInfoPageProps = {
	restaurants: RestaurantModel[]
}

const RestaurantInfoPage: React.FC<RestaurantInfoPageProps> = ({ restaurants }) => {
	const { restaurantUid } = useParams<{ restaurantUid: string }>()
	const isAdding = restaurantUid === 'add'
	const [restaurant, setRestaurant] = useGetRestaurant(restaurants)
	const router = useIonRouter()

	const [deleteRestaurantText, setDeleteRestaurantText] = useState('')
	const [showDeletePopover, hideDeletePopover] = useIonPopover(
		<IonList lines='none'>
			<IonItem>
				<IonLabel>
					<h1>
						<b>Are you sure?</b>
					</h1>
				</IonLabel>
			</IonItem>
			<IonItem>
				<p>
					This action is <b>irreversible</b>. Type the name of the restaurant to confirm.
				</p>
			</IonItem>
			<IonItem>
				<IonInput placeholder='Restaurant Name' value={deleteRestaurantText} onIonChange={(e) => setDeleteRestaurantText(e.detail.value ?? '')} />
			</IonItem>
			<IonToolbar>
				<IonButtons slot='start'>
					<IonButton onClick={() => hideDeletePopover()}>Cancel</IonButton>
				</IonButtons>
				<IonButtons slot='end'>
					<IonButton
						disabled={deleteRestaurantText !== restaurant?.name}
						color='danger'
						onClick={async () => {
							if (restaurant) {
								//delete all user favorites with restaurant id
								const userFavoritesDocs = await getDocs(
									query(collectionGroup(firestore, 'favorites'), where('restaurantUid', '==', restaurant?.uid))
								)
								//delete all user bag items with restaurant id
								const bagItemDocs = await getDocs(
									query(collectionGroup(firestore, 'bag'), where('restaurantItem.restaurantUid', '==', restaurant?.uid))
								)
								//delete all user orders with restaurant id
								const orderDocs = await getDocs(query(collectionGroup(firestore, 'orders'), where('restaurantUid', '==', restaurant?.uid)))
								//delete all restaurant items
								const restaurantItemsDocs = await getDocs(collection(firestore, 'restaurants', restaurant?.uid, 'items'))
								//delete restaurant doc
								const restaurantDoc = await getDoc(doc(firestore, 'restaurants', restaurant.uid))

								await Promise.all(
									[...userFavoritesDocs.docs, ...bagItemDocs.docs, ...orderDocs.docs, ...restaurantItemsDocs.docs, restaurantDoc].map((doc) =>
										deleteDoc(doc.ref)
									)
								)
								console.log(`Successfully deleted all associated ${restaurant.name} data.`)
								//router.push('/account', 'root')
								window.location.assign('/')
							}
							hideDeletePopover()
						}}
					>
						Delete
					</IonButton>
				</IonButtons>
			</IonToolbar>
		</IonList>
	)

	if (!restaurant) {
		setRestaurant({ active: true, manuallyClosed: false, description: '', hours: {}, name: '', uid: '' })
		return <LoadingPage />
	}

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					{restaurant.uid ? (
						<IonButtons slot='start'>
							<IonBackButton defaultHref={`/restaurants/${restaurant.uid}`} />
						</IonButtons>
					) : (
						<IonMenuButton slot='start' />
					)}
					<IonTitle>{capitalize(restaurant.name)} Info</IonTitle>
					<IonButtons slot='end'>
						<IonButton
							onClick={async () => {
								if (!isAdding) {
									await setDoc(doc(firestore, 'restaurants', restaurant.uid), restaurant)
									router.goBack()
								} else {
									const newDoc = doc(collection(firestore, 'restaurants'))
									await setDoc(newDoc, { ...restaurant, uid: newDoc.id } as RestaurantModel)
									router.push(`/restaurants/${newDoc.id}`)
								}
							}}
						>
							<IonIcon slot='icon-only' icon={checkmarkOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<IonItemDivider>Name:</IonItemDivider>
					<IonItem>
						<IonInput
							value={restaurant.name}
							onIonChange={(e) =>
								setRestaurant({
									...restaurant,
									name: e.detail.value ?? '',
								})
							}
						/>
					</IonItem>
					<IonItemDivider>Description:</IonItemDivider>
					<IonItem>
						<IonTextarea
							autoGrow
							value={restaurant.description}
							onIonChange={(e) => setRestaurant({ ...restaurant, description: e.detail.value ?? '' })}
						/>
					</IonItem>
					<IonItemDivider>Hours:</IonItemDivider>
					{daysOfWeek.map((day, i) => (
						<IonItem key={i}>
							<IonLabel slot='start'>{day}</IonLabel>
							<IonList style={{ width: '100%' }}>
								<IonItem>
									<IonLabel slot='start'>Open</IonLabel>
									<IonInput
										type='time'
										value={restaurant.hours[day]?.open}
										onIonChange={(e) => {
											const newRest = { ...restaurant }
											newRest.hours[day] = { ...newRest.hours[day], open: e.detail.value ?? '' }
											setRestaurant(newRest)
										}}
									/>
								</IonItem>
								<IonItem>
									<IonLabel slot='start'>Close</IonLabel>
									<IonInput
										type='time'
										value={restaurant.hours[day]?.close}
										onIonChange={(e) => {
											const newRest = { ...restaurant }
											newRest.hours[day] = { ...newRest.hours[day], close: e.detail.value ?? '' }
											setRestaurant(newRest)
										}}
									/>
								</IonItem>
							</IonList>
						</IonItem>
					))}
					<IonItemDivider>Manually Closed</IonItemDivider>
					<IonItem>
						<IonCheckbox
							slot='start'
							checked={restaurant.manuallyClosed}
							onIonChange={(e) => setRestaurant({ ...restaurant, manuallyClosed: e.detail.checked })}
						/>
						<IonLabel>Closed? (Restaurant will {restaurant.manuallyClosed ? '' : 'not'} be displayed as closed to users)</IonLabel>
					</IonItem>
					<IonItemDivider>Active</IonItemDivider>
					<IonItem>
						<IonCheckbox slot='start' checked={restaurant.active} onIonChange={(e) => setRestaurant({ ...restaurant, active: e.detail.checked })} />
						<IonLabel>Active? (Restaurant will {restaurant.active ? '' : 'not'} be displayed to users)</IonLabel>
					</IonItem>
					{!!restaurant.uid && (
						<>
							<IonItemDivider>DANGER</IonItemDivider>
							<IonItem detail button onClick={() => showDeletePopover({ showBackdrop: true, onDidDismiss: () => setDeleteRestaurantText('') })}>
								<IonLabel color='danger'>DELETE RESTAURANT</IonLabel>
							</IonItem>
						</>
					)}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default RestaurantInfoPage
