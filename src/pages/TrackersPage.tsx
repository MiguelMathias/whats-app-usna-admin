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
import { collection, limit, orderBy, query, where } from 'firebase/firestore'
import { addOutline, checkmarkOutline, createOutline } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { TrackerModel } from '../data/Tracker'
import { firestore } from '../Firebase'
import { useSubCollection } from '../util/hooks'
import { distinct } from '../util/misc'

const TrackersPage: React.FC = () => {
	const { dept } = useParams<{ dept: string }>()
	const [trackers, _, limit, incLimit, setLimit] = useSubCollection<TrackerModel>(
		query(collection(firestore, 'trackers'), where('dept', '==', dept), orderBy('posted', 'desc')),
		[dept],
		50
	)
	const [editMode, setEditMode] = useState(false)

	const allCategories = () => trackers.map((tracker) => tracker.category).filter(distinct)
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
					<IonTitle>{dept.toUpperCase()} Trackers</IonTitle>
					<IonButtons slot='end'>
						<IonButton onClick={() => setEditMode((editMode) => !editMode)}>
							<IonIcon slot='icon-only' icon={editMode ? checkmarkOutline : createOutline} />
						</IonButton>
						<IonButton routerLink={`/${dept}/trackers/add`}>
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
					{trackers
						.filter((update) => (categories.length > 0 ? categories.includes(update.category ?? '') : true))
						.map((tracker, i) => (
							<IonItem
								key={i}
								button
								detail={editMode}
								routerLink={editMode ? `/${dept}/trackers/${tracker.uid}` : `/${dept}/trackers/track/${tracker.uid}`}
							>
								<IonLabel style={{ whitespace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									{tracker.title}
									{tracker.posted && ' - '}
									{tracker.posted?.toDate().toLocaleDateString()}
								</IonLabel>
							</IonItem>
						))}
				</IonList>
				<IonInfiniteScroll onIonInfinite={incLimit} threshold='100px' disabled={trackers.length < limit}>
					<IonInfiniteScrollContent loadingSpinner='dots' />
				</IonInfiniteScroll>
			</IonContent>
		</IonPage>
	)
}

export default TrackersPage
