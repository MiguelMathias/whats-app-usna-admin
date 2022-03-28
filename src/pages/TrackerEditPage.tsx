import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonList,
	IonPage,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonAlert,
	useIonRouter,
} from '@ionic/react'
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { checkmarkOutline, removeOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useEffectOnce } from 'react-use'
import { TrackerModel } from '../data/Tracker'
import { firestore } from '../Firebase'

const TrackerEditPage: React.FC = () => {
	const { uid, dept } = useParams<{ uid: string; dept: string }>()
	const adding = uid === 'add'

	const [tracker, setTracker] = useState({ uid: '', dept, items: [], title: '', midsAndCos: [] } as TrackerModel)
	const [filters, setFilters] = useState<string[]>(['all'])
	const [companies, setCompanies] = useState<string[]>([])

	const titleText = useRef(tracker.title)
	const categoryText = useRef(tracker.category ?? '')
	const midshipmenText = useRef('')
	const maxRecords = useRef(1)

	const router = useIonRouter()

	const [showAlert] = useIonAlert()

	useEffectOnce(() => {
		if (!adding)
			return onSnapshot(doc(firestore, 'trackers', uid), (snapshot) => {
				const newTracker = snapshot.data() as TrackerModel
				if (!newTracker) return
				titleText.current = newTracker.title
				categoryText.current = newTracker.category ?? ''
				maxRecords.current = newTracker.maxRecords ?? 1

				const filters = []
				if (newTracker.midsAndCos.includes('all') || newTracker.midsAndCos.length === 0) filters.push('all')
				if (newTracker.midsAndCos.find((midOrCo) => midOrCo.length === 2)) filters.push('cos')
				if (newTracker.midsAndCos.find((midOrCo) => midOrCo.length == 6)) filters.push('mids')
				setFilters(filters)

				setCompanies(newTracker.midsAndCos.filter((midOrCo) => midOrCo.length === 2))
				midshipmenText.current = newTracker.midsAndCos.filter((midOrCo) => midOrCo.length === 6).join('\n')

				setTracker(newTracker)
			})
	})

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/${dept}/trackers`} />
					</IonButtons>
					<IonTitle>{adding ? 'Add' : 'Edit'} Tracker</IonTitle>
					<IonButtons slot='end'>
						{!adding && (
							<IonButton
								onClick={() =>
									showAlert({
										header: 'Confirm Deletion',
										message: 'Deleting this Tracker is irreversible.',
										buttons: [
											'Cancel',
											{
												text: 'Continue',
												handler: async () => {
													const docRef = doc(firestore, 'trackers', uid)
													await deleteDoc(docRef)
													router.push(`/${dept}/trackers`, 'back', 'pop')
												},
											},
										],
									})
								}
							>
								<IonIcon slot='icon-only' icon={removeOutline} />
							</IonButton>
						)}
						<IonButton
							onClick={async () => {
								const docRef = adding ? doc(collection(firestore, 'trackers')) : doc(firestore, 'trackers', uid)
								const midsAndCos = []
								if (filters.includes('mids')) midsAndCos.push(...midshipmenText.current.split(/\s*[\s,]\s*/))
								if (filters.includes('cos')) midsAndCos.push(...companies)
								if (filters.includes('all')) midsAndCos.push('all')
								await setDoc(docRef, {
									...tracker,
									uid: docRef.id,
									title: titleText.current,
									category: categoryText.current,
									posted: tracker.posted ?? serverTimestamp(),
									maxRecords: maxRecords.current,
									midsAndCos,
								} as TrackerModel)
								router.push(`/${dept}/trackers`, 'back', 'pop')
							}}
						>
							<IonIcon slot='icon-only' icon={checkmarkOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<IonItem>
						<IonLabel position='stacked'>Title</IonLabel>
						<IonInput value={titleText.current} onIonChange={(e) => (titleText.current = e.detail.value ?? '')} />
					</IonItem>
					<IonItem>
						<IonLabel position='stacked'>Category</IonLabel>
						<IonInput value={categoryText.current} onIonChange={(e) => (categoryText.current = e.detail.value ?? '')} />
					</IonItem>
					<IonItem>
						<IonLabel position='stacked'>Maximum Records for a Midshipman</IonLabel>
						<IonInput
							type='number'
							inputMode='numeric'
							value={maxRecords.current}
							onIonChange={(e) => (maxRecords.current = +(e.detail.value ?? 1))}
						/>
					</IonItem>
					<IonItem>
						<IonLabel position='stacked'>Fitler Mids by:</IonLabel>
						<IonSelect multiple value={filters} onIonChange={(e) => setFilters(e.detail.value)}>
							<IonSelectOption value='all'>All</IonSelectOption>
							<IonSelectOption value='cos'>Specific Companies</IonSelectOption>
							<IonSelectOption value='mids'>Specific Midshipmen</IonSelectOption>
						</IonSelect>
					</IonItem>
					{filters.includes('cos') && (
						<IonItem>
							<IonLabel position='stacked'>Companies</IonLabel>
							<IonSelect multiple value={companies} onIonChange={(e) => setCompanies(e.detail.value)}>
								{Array.from({ length: 30 }, (x, i) => i).map((i) => (
									<IonSelectOption key={i}>{i + 1}</IonSelectOption>
								))}
							</IonSelect>
						</IonItem>
					)}
					{filters.includes('mids') && (
						<IonItem>
							<IonLabel position='stacked'>Midshipmen (Enter Alphas separated by line)</IonLabel>
							<IonTextarea autoGrow value={midshipmenText.current} onIonChange={(e) => (midshipmenText.current = e.detail.value ?? '')} />
						</IonItem>
					)}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default TrackerEditPage
