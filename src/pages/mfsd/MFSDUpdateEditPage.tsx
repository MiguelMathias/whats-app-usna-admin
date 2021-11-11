import { collection, doc, serverTimestamp, setDoc } from '@firebase/firestore'
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
import ImgOrVid from '../../components/ImgOrVid'
import { UpdatePost } from '../../data/mfsd/MFSD'
import { deleteStorageFolder, firestore, storage } from '../../Firebase'

type MFSDUpdateEditPageProps = {
	updates: UpdatePost[]
}

const MFSDUpdateEditPage: React.FC<MFSDUpdateEditPageProps> = ({ updates }) => {
	const { updateUid } = useParams<{ updateUid: string }>()
	const adding = updateUid === 'add'
	const [files, setFiles] = useState<File[]>([])
	const update = adding ? { updateUid: '' } : updates.find((update) => update.updateUid === updateUid)
	const router = useIonRouter()
	const titleText = useRef(update?.title)
	const captionText = useRef(update?.caption)

	useEffectOnce(() => {
		if (!adding) {
			listAll(ref(storage, `mfsd/updates/${updateUid}/media`)).then(async (fileList) => {
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
		}
	})

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref='/mfsd/updates' />
					</IonButtons>
					<IonTitle>{adding ? 'Add' : 'Edit'} Post</IonTitle>
					<IonButtons slot='end'>
						<IonButton
							onClick={async () => {
								const docRef = adding ? doc(collection(firestore, 'mfsd')) : doc(firestore, 'mfsd', updateUid)
								await setDoc(docRef, {
									...update,
									updateUid: docRef.id,
									title: titleText.current ?? '',
									caption: captionText.current ?? '',
									posted: !!update?.posted ? update.posted : serverTimestamp(),
								} as UpdatePost)
								await deleteStorageFolder(storage, `mfsd/updates/${docRef.id}/media`)
								await Promise.all(
									files.map(async (imgFile, i) => {
										const locRef = ref(
											storage,
											`mfsd/updates/${docRef.id}/media/${docRef.id}-${i + (imgFile.type === 'video/mp4' ? '-vid' : '')}`
										)
										await uploadBytes(locRef, imgFile)
									})
								)
								router.push('/mfsd/updates', 'back', 'pop')
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

export default MFSDUpdateEditPage
