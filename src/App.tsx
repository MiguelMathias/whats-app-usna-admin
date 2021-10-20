import { IonApp, IonRouterOutlet, IonSplitPane, IonToast } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'
import '@ionic/react/css/display.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/float-elements.css'
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/typography.css'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useEffectOnce } from 'react-use'
import { AppContext, AppContextType } from './AppContext'
import SideMenu from './components/SideMenu'
import { isAdmin, UserDataModel } from './data/account/User'
import { RestaurantModel } from './data/restaurants/Restaurant'
import { auth, firestore } from './Firebase'
import Account from './pages/account/Account'
import MFSDAdminPage from './pages/mfsd/MFSDAdminPage'
import MWFAdminPage from './pages/mwf/MWFAdminPage'
import NABSDAdminPage from './pages/nabsd/NABSDAdminPage'
import RestaurantHomePage from './pages/restaurants/RestaurantHomePage'
import RestaurantInfoPage from './pages/restaurants/RestaurantInfoPage'
import RestaurantMenuEditPage from './pages/restaurants/RestaurantMenuEditPage'
import RestaurantMenuItemEditPage from './pages/restaurants/RestaurantMenuItemEditPage'
import RestaurantOrdersPage from './pages/restaurants/RestaurantOrdersPage'
/* Theme variables */
import './theme/variables.css'

const App: React.FC = () => {
	const [user, setUser] = useState<User | undefined>(undefined)
	const [userData, setUserData] = useState<UserDataModel | undefined>(undefined)
	const [showToastNotif, setShowToastNotif] = useState(false)
	const [toastHeader, setToastHeader] = useState<string | undefined>('')
	const [toastMessage, setToastMessage] = useState<string | undefined>('')
	const [toastDuration, setToastDuration] = useState(2500)
	const [restaurants, setRestaurants] = useState<RestaurantModel[]>([])

	const filteredRestaurants = () => restaurants.filter((restaurant) => isAdmin(userData, restaurant.uid))

	const fireToastNotif = (header?: string, text?: string, duration?: number) => {
		setToastMessage(text)
		setToastHeader(header)
		setToastDuration(duration ?? 2500)
		setShowToastNotif(true)
	}

	const appContextProviderValue = {
		user,
		setUser,
		userData,
		setUserData,
		showToastNotif,
		setShowToastNotif,
		toastDuration,
		setToastDuration,
		fireToastNotif,
	} as AppContextType

	useEffect(() => {
		if (user) {
			const userDataUnsub = onSnapshot(doc(firestore, 'users', user.uid), (snapshot) => {
				if (snapshot.exists()) {
					const newUserData = snapshot.data() as UserDataModel
					if (!newUserData.uid) newUserData.uid = user.uid
					setUserData(newUserData)
				} else
					setDoc(doc(firestore, 'users', user.uid), {
						uid: user.uid,
						bagItems: [],
					} as UserDataModel)
			})

			return () => {
				userDataUnsub()
			}
		} else setUserData(undefined)
	}, [user?.uid])

	onAuthStateChanged(auth, (user) => {
		if (/[a-zA-Z0-9]*@usna\.edu/.test(user?.email ?? '') /* /m[1-9]{6}@usna\.edu/.test(user?.email ?? '') */)
			setUser(user ?? undefined)
		else if (user) {
			fireToastNotif('Wrong Account!', 'Must sign in with USNA (@usna.edu) Google account')
			signOut(auth)
		} else setUser(undefined)
	})

	useEffectOnce(() => {
		onSnapshot(collection(firestore, 'restaurants'), (snapshot) =>
			setRestaurants(snapshot.docs.map((doc) => doc.data() as RestaurantModel))
		)
	})

	return (
		<AppContext.Provider value={appContextProviderValue}>
			<IonApp>
				<IonReactRouter>
					<IonSplitPane contentId='main'>
						<SideMenu restaurants={restaurants} />
						<IonRouterOutlet id='main'>
							<Route exact path={`/restaurants/:restaurantUid`}>
								<RestaurantHomePage restaurants={filteredRestaurants()} />
							</Route>
							<Route exact path={`/restaurants/:restaurantUid/info`}>
								<RestaurantInfoPage restaurants={filteredRestaurants()} />
							</Route>
							<Route exact path={`/restaurants/:restaurantUid/menu`}>
								<RestaurantMenuEditPage restaurants={filteredRestaurants()} />
							</Route>
							<Route exact path={`/restaurants/:restaurantUid/menu/:restaurantItemB64`}>
								<RestaurantMenuItemEditPage restaurants={filteredRestaurants()} />
							</Route>
							<Route exact path={`/restaurants/:restaurantUid/orders`}>
								<RestaurantOrdersPage restaurants={filteredRestaurants()} />
							</Route>
							<Route exact path='/account'>
								<Account />
							</Route>
							<Route exact path='/mfsd'>
								{isAdmin(userData, 'mfsd') ? <MFSDAdminPage /> : <></>}
							</Route>
							<Route exact path='/mwf'>
								{isAdmin(userData, 'mwf') ? <MWFAdminPage /> : <></>}
							</Route>
							<Route exact path='/nabsd'>
								{isAdmin(userData, 'nabsd') ? <NABSDAdminPage /> : <></>}
							</Route>
							<Route exact path='/'>
								<Redirect to='/account' />
							</Route>
						</IonRouterOutlet>
					</IonSplitPane>
					<IonToast
						isOpen={showToastNotif}
						position='top'
						duration={toastDuration}
						header={toastHeader}
						message={toastMessage}
						onDidDismiss={() => setShowToastNotif(false)}
						translucent
					/>
				</IonReactRouter>
			</IonApp>
		</AppContext.Provider>
	)
}

export default App
