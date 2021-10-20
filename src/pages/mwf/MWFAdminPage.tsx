import { IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const MWFAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>MWF</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent></IonContent>
		</IonPage>
	)
}

export default MWFAdminPage
