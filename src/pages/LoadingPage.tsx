import { IonContent, IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'

const LoadingPage: React.FC = () => (
	<IonPage>
		<IonHeader>
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
