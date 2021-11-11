import { collectionGroup, orderBy, Timestamp } from '@firebase/firestore'
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { addDays, addWeeks } from 'date-fns'
import { query, where } from 'firebase/firestore'
import { useState } from 'react'
import RestaurantOrderDetailHalf from '../../components/restaurants/RestaurantOrderDetailHalf'
import RestaurantOrdersListHalf from '../../components/restaurants/RestaurantOrdersListHalf'
import { RestaurantModel, RestaurantOrderModel } from '../../data/restaurants/Restaurant'
import { firestore } from '../../Firebase'
import { useGetRestaurant, useSubCollection } from '../../util/hooks'
import LoadingPage from '../LoadingPage'
import './RestaurantOrdersPage.scss'

type RestaurantOrdersPageProps = {
	restaurants: RestaurantModel[]
}

const RestaurantOrdersPage: React.FC<RestaurantOrdersPageProps> = ({ restaurants }) => {
	const [restaurant, _] = useGetRestaurant(restaurants)
	const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['submitted'])
	const [selectedLocationUids, setSelectedLocationUids] = useState<string[]>([])
	const [selectedOrderIndex, setSelectedOrderIndex] = useState(-1)
	const [fromDate, setFromDate] = useState<string>(addWeeks(new Date(), -1).toISOString())
	const [toDate, setToDate] = useState<string>(new Date().toISOString())
	const [orders] = useSubCollection<RestaurantOrderModel>(
		query(
			collectionGroup(firestore, 'orders'),
			where('restaurantUid', '==', restaurant?.uid),
			where('submitted', '>=', Timestamp.fromDate(new Date(fromDate).getDateWithoutTime())),
			where('submitted', '<=', Timestamp.fromDate(addDays(new Date(toDate), 1).getDateWithoutTime())),
			orderBy('submitted', 'desc')
		),
		[fromDate, toDate, restaurant?.uid]
	)

	const filteredOrders = () =>
		orders
			.filter((order) => selectedStatuses.every((status) => status in order && !!(order as any)[status]))
			.filter((order) => (restaurant?.locations.length ?? 0 > 0 ? selectedLocationUids.includes(order.restaurantLocationUid ?? '') : true))

	if (!restaurant) return <LoadingPage />

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/restaurants/${restaurant.uid}}`} />
					</IonButtons>
					<IonTitle>{restaurant.name} Orders</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<RestaurantOrdersListHalf
					selectedOrderIndex={selectedOrderIndex}
					setSelectedOrderIndex={setSelectedOrderIndex}
					selectedStatuses={selectedStatuses}
					setSelectedStatuses={setSelectedStatuses}
					fromDate={fromDate}
					setFromDate={setFromDate}
					toDate={toDate}
					setToDate={setToDate}
					filteredOrders={filteredOrders()}
					selectedLocationUids={selectedLocationUids}
					setSelectedLocationUids={setSelectedLocationUids}
					restaurant={restaurant}
				/>
				<RestaurantOrderDetailHalf selectedOrderIndex={selectedOrderIndex} order={orders[selectedOrderIndex]} />
			</IonContent>
		</IonPage>
	)
}

export default RestaurantOrdersPage
