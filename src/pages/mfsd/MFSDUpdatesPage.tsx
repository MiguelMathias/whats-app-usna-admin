import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { addOutline } from 'ionicons/icons'
import { UpdatePost } from '../../data/mfsd/MFSD'

type MFSDUpdatesPageProps = {
	updates: UpdatePost[]
}

const MFSDUpdatesPage: React.FC<MFSDUpdatesPageProps> = ({ updates }) => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/mfsd' />
					</IonButtons>
					<IonTitle>MFSD Updates</IonTitle>
					<IonButtons slot='end'>
						<IonButton routerLink='/mfsd/updates/add'>
							<IonIcon slot='icon-only' icon={addOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					{updates.map((update, i) => (
						<IonItem key={i} routerLink={`/mfsd/updates/${update.updateUid}`} detail>
							<IonLabel style={{ whitespace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
								{update.posted?.toDate().toLocaleDateString()}
								{update.title && ' - '}
								{update.title}
							</IonLabel>
						</IonItem>
					))}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default MFSDUpdatesPage
