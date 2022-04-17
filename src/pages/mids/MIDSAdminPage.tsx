import { IonContent, IonHeader, IonItem, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const MIDSAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>Midshipmen</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonList>
					<IonItem button detail routerLink='/mids/updates'>
						Updates
					</IonItem>
					<IonItem button detail routerLink='/mids/trackers'>
						Trackers
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default MIDSAdminPage
