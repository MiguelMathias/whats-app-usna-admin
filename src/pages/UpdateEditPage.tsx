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
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonRouter,
} from '@ionic/react'
import { checkmarkOutline, removeOutline } from 'ionicons/icons'
import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useEffectOnce } from 'react-use'
import ImgOrVid from '../components/ImgOrVid'
import { UpdateModel } from '../data/Update'
import { deleteStorageFolder, firestore, storage } from '../Firebase'

const UpdateEditPage: React.FC = () => {
	const { uid, dept } = useParams<{ uid: string; dept: string }>()
	const adding = uid === 'add'
	const [update, setUpdate] = useState({ uid: '', dept: dept } as UpdateModel)
	const [files, setFiles] = useState<File[]>([])
	const router = useIonRouter()
	const titleText = useRef(update?.title)
	const categoryText = useRef(update?.category)
	const captionText = useRef(update?.caption)

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
				titleText.current = newUpdate.title
				categoryText.current = newUpdate.category
				captionText.current = newUpdate.caption
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
								await setDoc(docRef, {
									...update,
									uid: docRef.id,
									dept: dept,
									title: titleText.current ?? '',
									category: categoryText.current ?? '',
									caption: captionText.current ?? '',
									posted: !!update?.posted ? update.posted : serverTimestamp(),
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
						<IonTextarea autoGrow value={categoryText.current} onIonChange={(e) => (categoryText.current = e.detail.value ?? '')} />
					</IonItem>
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
