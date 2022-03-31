import { collection, doc, onSnapshot, serverTimestamp, setDoc } from '@firebase/firestore'
import { getDownloadURL, listAll, ref, uploadBytes } from '@firebase/storage'
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonPage,
	IonReorder,
	IonReorderGroup,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonAlert,
	useIonRouter,
} from '@ionic/react'
import { deleteDoc } from 'firebase/firestore'
import { checkmarkOutline, removeOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useEffectOnce } from 'react-use'
import ImgOrVid from '../components/ImgOrVid'
import { UpdateModel } from '../data/Update'
import { deleteStorageFolder, firestore, storage } from '../Firebase'
import { range, getAcademicYear } from '../util/misc'

const UpdateEditPage: React.FC = () => {
	const { uid, dept } = useParams<{ uid: string; dept: string }>()
	const adding = uid === 'add'
	const [update, setUpdate] = useState({ uid: '', dept } as UpdateModel)
	const [files, setFiles] = useState<File[]>([])
	const router = useIonRouter()
	const titleText = useRef(update.title)
	const categoryText = useRef(update.category)
	const captionText = useRef(update.caption)
	const midshipmenText = useRef('')

	const [showAlert] = useIonAlert()
	const [filters, setFilters] = useState<string[]>(['all'])
	const [companies, setCompanies] = useState<string[]>([])
	const [years, setYears] = useState<string[]>([])

	useEffectOnce(() => {
		if (!adding) {
			listAll(ref(storage, `updates/${uid}/media`)).then(async (fileList) => {
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
			return onSnapshot(doc(firestore, 'updates', uid), (snapshot) => {
				const newUpdate = snapshot.data() as UpdateModel
				if (!newUpdate) return
				titleText.current = newUpdate.title
				categoryText.current = newUpdate.category
				captionText.current = newUpdate.caption
				const filters = []
				if (newUpdate.midsAndCos.includes('all') || newUpdate.midsAndCos.length === 0) filters.push('all')
				if (newUpdate.midsAndCos.find((midOrCo) => midOrCo.length === 2)) filters.push('cos')
				if (newUpdate.midsAndCos.find((midOrCo) => midOrCo.length === 4)) filters.push('yrs')
				if (newUpdate.midsAndCos.find((midOrCo) => midOrCo.length == 6)) filters.push('mids')
				setFilters(filters)

				setCompanies(newUpdate.midsAndCos.filter((midOrCo) => midOrCo.length === 2))
				setYears(newUpdate.midsAndCos.filter((midOrCo) => midOrCo.length === 4))
				midshipmenText.current = newUpdate.midsAndCos.filter((midOrCo) => midOrCo.length === 6).join('\n')

				setUpdate(newUpdate)
			})
		}
	})

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/${dept}/updates`} />
					</IonButtons>
					<IonTitle>{adding ? 'Add' : 'Edit'} Post</IonTitle>
					<IonButtons slot='end'>
						{!adding && (
							<IonButton
								onClick={async () => {
									showAlert({
										header: 'Confirm Deletion',
										message: 'Deleting this Udpate is irreversible.',
										buttons: [
											'Cancel',
											{
												text: 'Continue',
												handler: async () => {
													const docRef = doc(firestore, 'updates', uid)
													await deleteStorageFolder(storage, `updates/${docRef.id}/media`)
													await deleteDoc(docRef)
													router.push(`/${dept}/updates`, 'back', 'pop')
												},
											},
										],
									})
								}}
							>
								<IonIcon icon={removeOutline} slot='icon-only' />
							</IonButton>
						)}
						<IonButton
							onClick={async () => {
								const docRef = adding ? doc(collection(firestore, 'updates')) : doc(firestore, 'updates', uid)
								await deleteStorageFolder(storage, `updates/${docRef.id}/media`)
								await Promise.all(
									files.map(async (imgFile, i) => {
										const locRef = ref(
											storage,
											`updates/${docRef.id}/media/${docRef.id}-${i + (imgFile.type === 'video/mp4' ? '-vid' : '')}`
										)
										await uploadBytes(locRef, imgFile)
									})
								)
								const midsAndCos = []
								if (filters.includes('mids')) midsAndCos.push(...midshipmenText.current.split(/\s*[\s,]\s*/))
								if (filters.includes('cos')) midsAndCos.push(...companies)
								if (filters.includes('yrs')) midsAndCos.push(...years)
								if (filters.includes('all')) midsAndCos.push('all')
								await setDoc(docRef, {
									...update,
									uid: docRef.id,
									title: titleText.current ?? '',
									category: categoryText.current ?? '',
									caption: captionText.current ?? '',
									posted: update?.posted ?? serverTimestamp(),
									midsAndCos,
								} as UpdateModel)
								router.push(`/${dept}/updates`, 'back', 'pop')
							}}
						>
							<IonIcon icon={checkmarkOutline} slot='icon-only' />
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
						<IonLabel position='stacked'>Send to:</IonLabel>
						<IonSelect multiple value={filters} onIonChange={(e) => setFilters(e.detail.value)}>
							<IonSelectOption value='all'>All</IonSelectOption>
							<IonSelectOption value='cos'>Specific Companies</IonSelectOption>
							<IonSelectOption value='yrs'>Specific Classes</IonSelectOption>
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
					{filters.includes('yrs') && (
						<IonItem>
							<IonLabel position='stacked'>Classes</IonLabel>
							<IonSelect multiple value={years} onIonChange={(e) => setYears(e.detail.value)}>
								{range(4, getAcademicYear()).map((year, i) => (
									<IonSelectOption key={i}>{year}</IonSelectOption>
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
					<IonItem>
						<IonLabel position='stacked'>Caption</IonLabel>
						<IonTextarea autoGrow value={captionText.current} onIonChange={(e) => (captionText.current = e.detail.value ?? '')} />
					</IonItem>
					<IonItemDivider>Images {'&'} Video</IonItemDivider>
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
		</IonPage>
	)
}

export default UpdateEditPage
