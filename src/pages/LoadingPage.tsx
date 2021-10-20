import { IonButton, IonContent, IonHeader, IonMenuButton, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'

const LoadingPage: React.FC = () => (
	<IonPage>
		<IonHeader>
			<IonButton slot='start'>
				<IonMenuButton />
			</IonButton>
			<IonToolbar>
				<IonTitle>Loading...</IonTitle>
			</IonToolbar>
		</IonHeader>
		<IonContent>
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<IonSpinner />
			</div>
		</IonContent>
	</IonPage>
)

export default LoadingPage
