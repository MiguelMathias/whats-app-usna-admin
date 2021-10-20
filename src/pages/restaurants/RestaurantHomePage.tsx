import { IonContent, IonHeader, IonItem, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { RestaurantModel } from '../../data/restaurants/Restaurant'
import { useGetRestaurant } from '../../util/hooks'
import { capitalize } from '../../util/misc'
import LoadingPage from '../LoadingPage'

type RestaurantHomePageProps = {
	restaurants: RestaurantModel[]
}

const RestaurantHomePage: React.FC<RestaurantHomePageProps> = ({ restaurants }) => {
	const [restaurant, _] = useGetRestaurant(restaurants)

	if (!restaurant) return <LoadingPage />

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>{capitalize(restaurant.name)}</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<IonItem detail routerLink={`/restaurants/${restaurant.uid}/info`}>
						Restaurant Info
					</IonItem>
					<IonItem detail routerLink={`/restaurants/${restaurant.uid}/menu`}>
						Menu
					</IonItem>
					<IonItem detail routerLink={`/restaurants/${restaurant.uid}/orders`}>
						Orders
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default RestaurantHomePage
