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
	IonTitle,
	IonToolbar,
	useIonModal,
	useIonToast,
} from '@ionic/react'
import { doc } from 'firebase/firestore'
import { cameraOutline, removeOutline, searchOutline } from 'ionicons/icons'
import { useEffect, useRef, useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'
import { useParams } from 'react-router'
import { TrackerItemModel, TrackerModel } from '../data/Tracker'
import { firestore } from '../Firebase'
import { useSubDoc } from '../util/hooks'
import { distinct } from '../util/misc'

type ScannerModalComponentProps = {
	finishCallback: () => void
	uid: string
}

const ScannerModalComponent: React.FC<ScannerModalComponentProps> = ({ finishCallback, uid }) => {
	const [showToast] = useIonToast()
	const [tracker, _, setTrackerDoc] = useSubDoc<TrackerModel>(doc(firestore, 'trackers', uid), [uid])
	const lastScannedTs = useRef(new Date().getTime())
	const [lastScan, setLastScan] = useState({ text: '', timestamp: new Date().getTime() })

	useEffect(() => {
		if (!lastScan || !tracker || lastScan.timestamp - lastScannedTs.current < 3000) return

		lastScannedTs.current = lastScan.timestamp
		const trackerItemScanned = JSON.parse(lastScan.text) as TrackerItemModel

		if (
			tracker.items.map((item) => JSON.stringify(item)).includes(lastScan.text) &&
			!(tracker.items.filter((item) => item.email === trackerItemScanned.email).length < (tracker.maxRecords || 1))
		)
			showToast({
				header: 'Warning',
				message: `Midshipman already recorded in Tracker "${tracker.title}"`,
				color: 'warning',
				duration: 2000,
			})
		else if (
			tracker.midsAndCos.includes('all') ||
			tracker.midsAndCos.includes(trackerItemScanned.email) ||
			tracker.midsAndCos
				.filter((midOrCo) => midOrCo.length === 4)
				.map((midOrCo) => midOrCo.slice(-2))
				.includes(trackerItemScanned.email.slice(1, 3)) ||
			(trackerItemScanned.company && tracker.midsAndCos.includes(trackerItemScanned.company))
		) {
			/* const recordsSoFar = tracker.items.filter((item) => item.alpha === trackerItemScanned.alpha && item.company === trackerItemScanned.company).length
			let items = [...tracker.items] */
			setTrackerDoc({
				...tracker,
				items: [...tracker.items, trackerItemScanned],
				/* .map((item) => JSON.stringify(item))
					.filter(distinct)
					.map((item) => JSON.parse(item) as TrackerItemModel) */
			} as TrackerModel).then(() =>
				showToast({
					header: 'Success',
					message: `Midshipman recorded in Tracker "${tracker.title}"`,
					color: 'success',
					duration: 2000,
				})
			)
		} else
			showToast({
				header: 'Failure',
				message: `Midshipman is not included in Tracker "${tracker.title}"`,
				color: 'danger',
				duration: 2000,
			})
	}, [lastScan.timestamp])

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Scan Codes</IonTitle>
					<IonButtons slot='end'>
						<IonButton onClick={() => finishCallback()}>Done</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<div style={{ height: '100%', width: '100%' }}>
					{tracker && (
						<BarcodeScannerComponent
							width='100%'
							height='100%'
							onUpdate={async (_, res) => (res ? setLastScan({ text: res?.getText(), timestamp: res?.getTimestamp() }) : {})}
						/>
					)}
				</div>
			</IonContent>
		</IonPage>
	)
}

const TrackerTrackPage: React.FC = () => {
	const { uid, dept } = useParams<{ uid: string; dept: string }>()
	const [tracker, _, setTrackerDoc] = useSubDoc<TrackerModel>(doc(firestore, 'trackers', uid), [uid])

	const [searchText, setSearchText] = useState('')

	const [showScannerModal, hideScannerModal] = useIonModal(<ScannerModalComponent finishCallback={() => hideScannerModal()} uid={uid} />)

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/${dept}/trackers`} />
					</IonButtons>
					<IonTitle>
						{dept.toUpperCase()} Tracker: {tracker?.title} - {tracker?.posted?.toDate().toLocaleDateString()}
					</IonTitle>
					<IonButtons slot='end'>
						<IonButton onClick={() => showScannerModal({ swipeToClose: true })}>
							<IonIcon slot='icon-only' icon={cameraOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonItem color='light'>
					<IonIcon slot='start' icon={searchOutline} />
					<IonInput inputMode='numeric' type='number' enterkeyhint='search' onIonChange={(e) => setSearchText(e.detail.value ?? '')} />
				</IonItem>
				<IonList>
					{tracker?.items
						.filter((item) => (searchText ? item.email.startsWith(searchText) || item.company?.startsWith(searchText) : true))
						.filterMap((item, _i, self, newSelf: (TrackerItemModel & { count: number })[]) =>
							newSelf.filter((i) => i.email === item.email).length
								? undefined
								: { ...item, count: self.filter((i) => i.email === item.email).length }
						)
						.map((item, i) => (
							<IonItem key={i}>
								<IonLabel>
									{item.company} | {item.email} | {item.count}
								</IonLabel>
								<IonButtons slot='end'>
									<IonButton
										onClick={() => setTrackerDoc({ ...tracker, items: tracker.items.filter((theItem) => item.email !== theItem.email) })}
									>
										<IonIcon slot='icon-only' icon={removeOutline} />
									</IonButton>
								</IonButtons>
							</IonItem>
						))}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default TrackerTrackPage
