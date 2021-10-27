import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { CACHE_SIZE_UNLIMITED, enableMultiTabIndexedDbPersistence, initializeFirestore } from 'firebase/firestore'
import { deleteObject, FirebaseStorage, getStorage, listAll, ref } from 'firebase/storage'

const firebaseConfig = {
	apiKey: 'AIzaSyD6luQ46FnJxHg4tT8zvS3gzsPOJTEC1eQ',
	authDomain: 'whats-app-usna.firebaseapp.com',
	projectId: 'whats-app-usna',
	storageBucket: 'whats-app-usna.appspot.com',
	messagingSenderId: '529286961549',
	appId: '1:529286961549:web:0112ba2aef31fa216f05c4',
	measurementId: 'G-LBB41MGGHH',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firestore = initializeFirestore(firebaseApp, {
	cacheSizeBytes: CACHE_SIZE_UNLIMITED,
})
export const storage = getStorage(firebaseApp)
export const auth = getAuth(firebaseApp)

setPersistence(auth, browserLocalPersistence)
enableMultiTabIndexedDbPersistence(firestore)

export const deleteStorageFolder = async (storage: FirebaseStorage, path: string) => {
	const folderRef = ref(storage, path)
	const dir = await listAll(folderRef)

	await Promise.all([
		...dir.items.map((fileRef) => {
			deleteStorageFile(storage, fileRef.fullPath)
		}),
		...dir.prefixes.map((folderRef) => {
			deleteStorageFolder(storage, folderRef.fullPath)
		}),
	])
}

export const deleteStorageFile = (storage: FirebaseStorage, path: string) => deleteObject(ref(storage, path))
