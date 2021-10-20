import { IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const NABSDAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>NABSD</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent></IonContent>
		</IonPage>
	)
}

export default NABSDAdminPage
