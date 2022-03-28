import { IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const MIDSAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Midshipmen</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
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
