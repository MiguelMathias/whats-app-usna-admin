import { collection, orderBy, query, where } from '@firebase/firestore'
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { addOutline } from 'ionicons/icons'
import { useParams } from 'react-router'
import { UpdateModel } from '../data/Update'
import { firestore } from '../Firebase'
import { useSubCollection } from '../util/hooks'

const UpdatesPage: React.FC = () => {
	const { dept } = useParams<{ dept: string }>()
	const [updates] = useSubCollection<UpdateModel>(query(collection(firestore, 'updates'), where('dept', '==', dept), orderBy('posted', 'desc')))

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/${dept}`} />
					</IonButtons>
					<IonTitle>{dept.toUpperCase()} Updates</IonTitle>
					<IonButtons slot='end'>
						<IonButton routerLink={`/${dept}/updates/add`}>
							<IonIcon slot='icon-only' icon={addOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					{updates.map((update, i) => (
						<IonItem key={i} routerLink={`/${dept}/updates/${update.uid}`} detail>
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

export default UpdatesPage
