import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle } from '@ionic/react'
import { addCircleOutline, cashOutline, libraryOutline, personOutline, restaurantOutline } from 'ionicons/icons'
import { useContext } from 'react'
import { useLocation } from 'react-router'
import { AppContext } from '../AppContext'
import { isAdmin } from '../data/account/User'
import { RestaurantModel } from '../data/restaurants/Restaurant'
import './SideMenu.scss'

type Pages = {
	title: string
	path: string
	icon?: string
	routerDirection?: string
}

type SideMenuProps = {
	restaurants: RestaurantModel[]
}

const SideMenu: React.FC<SideMenuProps> = ({ restaurants }) => {
	const location = useLocation()
	const { userData } = useContext(AppContext)

	const routes = (
		[
			isAdmin(userData, 'mfsd') && { title: 'MFSD', path: '/mfsd', icon: restaurantOutline },
			isAdmin(userData, 'mwf') && { title: 'MWF', path: '/mwf', icon: cashOutline },
			isAdmin(userData, 'nabsd') && { title: 'NABSD', path: '/nabsd', icon: libraryOutline },
		] as Pages[]
	)
		.filter((page) => !!page)
		.concat(
			...restaurants
				.filter((restaurant) => isAdmin(userData, restaurant.uid))
				.map((restaurant) => ({ title: restaurant.name, path: `/restaurants/${restaurant.uid}` } as Pages))
		)
		.concat(
			isAdmin(userData, 'all')
				? { title: 'Add Restaurant', path: '/restaurants/add/info', icon: addCircleOutline }
				: []
		)

	const renderListItems = (list: Pages[]) => {
		return list
			.filter((route) => !!route.path)
			.map((p) => (
				<IonMenuToggle key={p.path} auto-hide='false'>
					<IonItem
						routerLink={p.path}
						routerDirection='none'
						className={location.pathname.startsWith(p.path) ? 'selected' : undefined}
					>
						<IonIcon slot='start' icon={p.icon} />
						<IonLabel>{p.title}</IonLabel>
					</IonItem>
				</IonMenuToggle>
			))
	}
	return (
		<IonMenu swipeGesture type='push' contentId='main'>
			<IonContent forceOverscroll={false}>
				<IonList lines='none'>
					{renderListItems([{ title: 'Account', path: '/account', icon: personOutline }])}
					<IonListHeader>Admin</IonListHeader>
					{renderListItems(routes)}
				</IonList>
			</IonContent>
		</IonMenu>
	)
}

export default SideMenu
