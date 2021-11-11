import { firestore, initializeApp } from 'firebase-admin'
import * as functions from 'firebase-functions'

initializeApp()

export const updateKHMenu = functions.database.ref('/khMenu').onWrite((snapshot) =>
	firestore()
		.doc('/mfsd/khMenu')
		.set(snapshot.after.val())
		.then((result) => console.log(result))
		.catch((err) => console.error(err))
)
