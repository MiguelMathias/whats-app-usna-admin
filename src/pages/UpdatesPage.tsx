import { collection, orderBy, query, where } from '@firebase/firestore'
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInfiniteScroll,
	IonInfiniteScrollContent,
	IonItem,
	IonLabel,
	IonList,
	IonPage,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import { addOutline } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { UpdateModel } from '../data/Update'
import { firestore } from '../Firebase'
import { useSubCollection } from '../util/hooks'
import { distinct } from '../util/misc'

const UpdatesPage: React.FC = () => {
	const { dept } = useParams<{ dept: string }>()
	const [updates, _, limit, incLimit, setLimit] = useSubCollection<UpdateModel>(
		query(collection(firestore, 'updates'), where('dept', '==', dept), orderBy('posted', 'desc')),
		[dept],
		50
	)

	const allCategories = () => updates.map((update) => update.category).filter(distinct)
	const [categories, setCategories] = useState<string[]>([])

	useEffect(() => {
		if (categories.length > 0) setLimit(Infinity)
	}, [categories])

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
			<IonContent fullscreen>
				{allCategories().length > 0 && (
					<IonItem color='light'>
						<IonLabel>Category</IonLabel>
						<IonSelect multiple slot='end' value={categories} onIonChange={(e) => setCategories(e.detail.value)}>
							{allCategories().map((cat, i) => (
								<IonSelectOption key={i} value={cat}>
									{cat}
								</IonSelectOption>
							))}
						</IonSelect>
					</IonItem>
				)}
				<IonList>
					{updates
						.filter((update) => (categories.length > 0 ? categories.includes(update.category ?? '') : true))
						.map((update, i) => (
							<IonItem key={i} routerLink={`/${dept}/updates/${update.uid}`} detail>
								<IonLabel style={{ whitespace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									{update.title}
									{update.posted && ' - '}
									{update.posted?.toDate().toLocaleDateString()}
								</IonLabel>
							</IonItem>
						))}
				</IonList>
				<IonInfiniteScroll onIonInfinite={incLimit} threshold='100px' disabled={updates.length < limit}>
					<IonInfiniteScrollContent loadingSpinner='dots' />
				</IonInfiniteScroll>
			</IonContent>
		</IonPage>
	)
}

export default UpdatesPage
