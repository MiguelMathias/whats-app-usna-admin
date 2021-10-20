import { IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const MFSDAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>MFSD</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent></IonContent>
		</IonPage>
	)
}

export default MFSDAdminPage
