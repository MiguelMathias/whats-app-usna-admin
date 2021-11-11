import { IonContent, IonHeader, IonItem, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const MFSDAdminPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>MFSD</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<IonItem
						button
						detail
						href='https://docs.google.com/spreadsheets/d/12f04LzgmavFpKIj8SB44SKcAcyEe9lLDbY5LNED8d-0'
						target='_blank'
					>
						King Hall Menus
					</IonItem>
					<IonItem button detail routerLink='/mfsd/updates'>
						Updates Blog
					</IonItem>
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default MFSDAdminPage
