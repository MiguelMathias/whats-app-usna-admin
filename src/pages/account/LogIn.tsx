import { GoogleAuthProvider } from '@firebase/auth'
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { signInWithPopup } from 'firebase/auth'
import { personOutline } from 'ionicons/icons'
import { auth } from '../../Firebase'

const provider = new GoogleAuthProvider()

const LogIn: React.FC = () => (
	<IonPage>
		<IonHeader>
			<IonToolbar>
				<IonButtons slot='start'>
					<IonMenuButton />
				</IonButtons>
				<IonTitle>Log In</IonTitle>
			</IonToolbar>
		</IonHeader>
		<IonContent fullscreen>
			<div style={{ textAlign: 'center', marginTop: 20 }}>
				<IonIcon icon={personOutline} style={{ fontSize: 64 }} />
			</div>
			<div style={{ textAlign: 'center', marginTop: 20 }}>
				<IonButton onClick={() => signInWithPopup(auth, provider)}>Google Authentication</IonButton>
			</div>
		</IonContent>
	</IonPage>
)

export default LogIn
