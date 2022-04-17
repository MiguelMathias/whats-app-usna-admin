import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonCheckbox,
	IonContent,
	IonFooter,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonList,
	IonPage,
	IonReorder,
	IonReorderGroup,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar,
	useIonAlert,
	useIonRouter,
} from '@ionic/react'
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { listAll, ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import { removeOutline, checkmarkOutline } from 'ionicons/icons'
import { useContext, useState, useRef } from 'react'
import { Redirect, useParams } from 'react-router'
import { useEffectOnce } from 'react-use'
import { AppContext } from '../../AppContext'
import ImgOrVid from '../../components/ImgOrVid'
import { tradeCategories, TradeOfferModel } from '../../data/trade/Trade'
import { deleteStorageFolder, firestore, storage } from '../../Firebase'
import { useSubDoc } from '../../util/hooks'
import LoadingPage from '../LoadingPage'

const TradeAdminOfferPage = () => {
	const { user, userData } = useContext(AppContext)
	const { uid } = useParams<{ uid: string }>()
	const adding = uid === 'add'

	const [tradeOffer, setTradeOffer] = useState({
		uid: adding ? '' : uid,
		posterUid: user?.uid ?? '',
		title: '',
		category: 'Other',
		description: '',
		price: 0,
		active: true,
		favoritedUids: [] as string[],
		bestBid: { price: 0, email: '' },
	} as TradeOfferModel)
	const [files, setFiles] = useState<File[]>([])
	const [roomNoVisible, setRoomNoVisible] = useState(!!tradeOffer.roomNumber)
	const [phoneNoVisible, setPhoneNoVisible] = useState(!!tradeOffer.phoneNumber)
	const [emailVisible, setEmailVisible] = useState(!!tradeOffer.email)
	const [venmoIdVisible, setVenmoIdVisible] = useState(!!tradeOffer.venmoId)

	const title = useRef(tradeOffer.title)
	const category = useRef(tradeOffer.category)
	const description = useRef(tradeOffer.description)
	const price = useRef(tradeOffer.price)
	const accepted = useRef(!tradeOffer.active)

	const [showAlert] = useIonAlert()
	const router = useIonRouter()

	useEffectOnce(() => {
		if (!adding) {
			listAll(ref(storage, `trade/${tradeOffer.uid}/media`)).then(async (fileList) => {
				setFiles(
					await Promise.all(
						fileList.items.map(
							async (item) =>
								new File([await (await fetch(await getDownloadURL(item))).blob()], item.name, {
									type: item.name.includes('-vid') ? 'video/mp4' : undefined,
								})
						)
					)
				)
			})
			return onSnapshot(doc(firestore, 'trade', tradeOffer.uid), (snapshot) => {
				const newTradeOffer = snapshot.data() as TradeOfferModel
				if (!newTradeOffer) return
				title.current = newTradeOffer.title
				category.current = newTradeOffer.category
				description.current = newTradeOffer.description
				price.current = newTradeOffer.price
				accepted.current = !newTradeOffer.active

				setRoomNoVisible(!!newTradeOffer?.roomNumber)
				setPhoneNoVisible(!!newTradeOffer?.phoneNumber)
				setVenmoIdVisible(!!newTradeOffer?.venmoId)

				setTradeOffer(newTradeOffer)
			})
		}
	})

	if ((!tradeOffer && !adding) || !user?.uid) return <LoadingPage />

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/trade' />
					</IonButtons>
					<IonTitle>{tradeOffer.title}</IonTitle>
					<IonButtons slot='end'>
						{!adding && (
							<IonButton
								onClick={() => {
									showAlert({
										header: 'Confirm Deletion',
										message: 'Deleting this Offer is irreversible.',
										buttons: [
											'Cancel',
											{
												text: 'Continue',
												handler: async () => {
													const docRef = doc(firestore, 'trade', tradeOffer.uid)
													await deleteStorageFolder(storage, `trade/${tradeOffer.uid}/media`)
													await deleteDoc(docRef)
													router.push(`/trade`, 'back', 'pop')
												},
											},
										],
									})
								}}
							>
								<IonIcon slot='icon-only' icon={removeOutline} />
							</IonButton>
						)}
						<IonButton
							onClick={async () => {
								const docRef = adding ? doc(collection(firestore, 'trade')) : doc(firestore, 'trade', uid)
								await deleteStorageFolder(storage, `trade/${docRef.id}/media`)
								await Promise.all(
									files.map(async (imgFile, i) => {
										const locRef = ref(storage, `trade/${docRef.id}/media/${docRef.id}-${i + (imgFile.type === 'video/mp4' ? '-vid' : '')}`)
										await uploadBytes(locRef, imgFile)
									})
								)
								await setDoc(docRef, {
									...tradeOffer,
									uid: docRef.id,
									title: title.current,
									category: category.current,
									description: description.current,
									price: price.current,
									active: !accepted.current,
									posted: tradeOffer.posted ?? serverTimestamp(),
									posterUid: user.uid,
									roomNumber: roomNoVisible ? userData?.roomNumber ?? '' : '',
									phoneNumber: phoneNoVisible ? userData?.phoneNumber ?? '' : '',
									email: emailVisible ? user.email ?? '' : '',
									venmoId: venmoIdVisible ? userData?.venmoId ?? '' : '',
									bestBid: tradeOffer.bestBid ?? { price: 0, email: '' },
								} as TradeOfferModel)
								router.push(`/trade`, 'back', 'pop')
							}}
						>
							<IonIcon slot='icon-only' icon={checkmarkOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonList>
					<IonItem>
						<IonLabel position='stacked'>Title</IonLabel>
						<IonInput inputMode='text' type='text' value={title.current} onIonChange={(e) => (title.current = e.detail.value ?? '')} />
					</IonItem>
					<IonItem>
						<IonLabel position='stacked'>Category</IonLabel>
						<IonSelect interface='popover' value={category.current} onIonChange={(e) => (category.current = e.detail.value ?? 'Other')}>
							{tradeCategories.map((cat, i) => (
								<IonSelectOption key={i} value={cat}>
									{cat}
								</IonSelectOption>
							))}
						</IonSelect>
					</IonItem>
					<IonItem>
						<IonLabel position='stacked'>Description</IonLabel>
						<IonInput inputMode='text' type='text' value={description.current} onIonChange={(e) => (description.current = e.detail.value ?? '')} />
					</IonItem>
					<IonItem>
						<IonLabel position='stacked'>Price</IonLabel>
						<IonInput inputMode='decimal' type='number' value={price.current} onIonChange={(e) => (price.current = +(e.detail.value ?? 0))} />
					</IonItem>
					{user.email && (
						<IonItem>
							<IonLabel>Show Email ({user.email})?</IonLabel>
							<IonCheckbox slot='end' checked={emailVisible} onIonChange={(e) => setEmailVisible(e.detail.checked)} />
						</IonItem>
					)}
					{userData?.phoneNumber && (
						<IonItem>
							<IonLabel>Show Phone Number ({userData?.phoneNumber})?</IonLabel>
							<IonCheckbox slot='end' checked={phoneNoVisible} onIonChange={(e) => setPhoneNoVisible(e.detail.checked)} />
						</IonItem>
					)}
					{userData?.venmoId && (
						<IonItem>
							<IonLabel>Show Venmo ID ({userData?.venmoId})?</IonLabel>
							<IonCheckbox slot='end' checked={venmoIdVisible} onIonChange={(e) => setVenmoIdVisible(e.detail.checked)} />
						</IonItem>
					)}
					{userData?.roomNumber && (
						<IonItem>
							<IonLabel>Show Room Number ({userData?.roomNumber})?</IonLabel>
							<IonCheckbox slot='end' checked={roomNoVisible} onIonChange={(e) => setRoomNoVisible(e.detail.checked)} />
						</IonItem>
					)}
					{!adding && (
						<IonItem>
							<IonLabel>Bid Accepted / Archived</IonLabel>
							<IonCheckbox slot='end' checked={accepted.current} onIonChange={(e) => (accepted.current = e.detail.checked)} />
						</IonItem>
					)}
					<IonItem>
						<input type='file' accept='.jpg, .jpeg, .mp4' multiple onChange={(e) => setFiles(files.concat(Array.from(e.target.files ?? [])))} />
						<IonButton slot='end' onClick={() => setFiles([])}>
							Clear
						</IonButton>
					</IonItem>
					{files.length > 0 && (
						<IonReorderGroup
							disabled={false}
							onIonItemReorder={(e) => {
								files.splice(e.detail.to, 0, files.splice(e.detail.from, 1)[0])
								setFiles(files)
								e.detail.complete()
							}}
						>
							{[...Array.from(files)].map((imgFile, i) => (
								<IonItem key={i}>
									<ImgOrVid file={imgFile} style={{ maxWidth: 250 }} controls />
									<IonButtons slot='end'>
										<IonButton onClick={() => setFiles(files.removeIndex(i))}>
											<IonIcon slot='icon-only' icon={removeOutline} />
										</IonButton>
									</IonButtons>
									<IonReorder slot='end' />
								</IonItem>
							))}
						</IonReorderGroup>
					)}
				</IonList>
			</IonContent>
			{!adding && (
				<IonFooter>
					<IonItem>
						<IonLabel>
							${tradeOffer.bestBid?.price ?? 0}
							{tradeOffer.bestBid?.email && (
								<>
									{' '}
									- by <a href={`mailto:${tradeOffer.bestBid?.email}`}>{tradeOffer.bestBid?.email}</a>
								</>
							)}
						</IonLabel>
						<IonButton
							slot='end'
							onClick={async () => {
								await setDoc(doc(firestore, 'trade', uid), { ...tradeOffer, active: false } as TradeOfferModel)
								router.push(`/trade`, 'back', 'pop')
							}}
						>
							Accept Bid
						</IonButton>
					</IonItem>
				</IonFooter>
			)}
		</IonPage>
	)
}

export default TradeAdminOfferPage
