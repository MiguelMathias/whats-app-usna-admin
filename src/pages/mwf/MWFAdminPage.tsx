import { IonContent, IonHeader, IonItem, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const MWFAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>MWF</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<IonItem button detail routerLink='/mwf/updates'>
						Updates
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default MWFAdminPage
