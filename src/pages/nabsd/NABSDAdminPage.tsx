import { IonContent, IonHeader, IonItem, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const NABSDAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>NABSD</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonList>
					<IonItem button detail routerLink='/nabsd/updates'>
						Updates
					</IonItem>
					<IonItem button detail routerLink='/nabsd/trackers'>
						Trackers
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default NABSDAdminPage
