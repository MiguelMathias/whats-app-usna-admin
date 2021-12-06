import { firestore, initializeApp, messaging, storage } from 'firebase-admin'
import * as functions from 'firebase-functions'

initializeApp()

export const updateKHMenu = functions.database.ref('/khMenu').onWrite((snapshot) =>
	firestore()
		.doc('/mfsd/khMenu')
		.set(snapshot.after.val())
		.then((result) => console.log(result))
		.catch((err) => console.error(err))
)

export const subUsersToTopics = functions.firestore.document('users/{userDoc}').onWrite(({ after }) => {
	if (!after.exists) return

	const { displayName, deviceTokens, subbedTopics } = after.data() as { displayName: string; deviceTokens?: string[]; subbedTopics?: string[] }
	const unSubbedTopics = ['mfsd', 'mwf', 'nabsd'].filter((topic) => !subbedTopics?.includes(topic))
	for (const topic of subbedTopics ?? [])
		functions.app.admin
			.messaging()
			.subscribeToTopic(deviceTokens ?? [], topic)
			.then((val) => {
				if (val.failureCount > 0) console.log(`Errors in subscribing : ${displayName}'s devices (${deviceTokens}) to ${topic}'`, val.errors)
				console.log(`Success in subscribing ${displayName}'s devices (${deviceTokens}) to ${topic}`)
			})
			.catch((err) => console.error(err))

	for (const topic of unSubbedTopics)
		functions.app.admin
			.messaging()
			.unsubscribeFromTopic(deviceTokens ?? [], topic)
			.then((val) => {
				if (val.failureCount > 0) console.log(`Errors in unsubscribing : ${displayName}'s devices (${deviceTokens}) from ${topic}'`, val.errors)
				console.log(`Success in unsubscribing ${displayName}'s devices (${deviceTokens}) from ${topic}`)
			})
			.catch((err) => console.error(err))
})

export const sendUpdateNotif = functions.firestore.document('updates/{updateUid}').onWrite(async ({ after }) => {
	if (!after.exists) return
	const { uid, dept, title, caption } = after.data() as { uid: string; dept: string; title: string; caption?: string }

	const img = (
		await storage()
			.bucket()
			.getFiles({ prefix: `updates/${uid}/media` })
	)[0]
		.filter((img) => !img.name.includes('-vid'))
		.sort()
		.find(() => true)
	const message = {
		topic: dept,
		notification: {
			title: `${dept.toUpperCase()}: ${title}`,
			body: caption,
			imageUrl: img ? `https://firebasestorage.googleapis.com/v0/b/whats-app-usna.appspot.com/o/${img.name.split('/').join('%2F')}?alt=media` : undefined,
		},
		data: { dept, uid },
	} as messaging.Message
	messaging()
		.send(message)
		.then((result) => console.log('Sent message', JSON.stringify(message, null, 2), JSON.stringify(result, null, 2)))
		.catch((err) => console.error(err))
})
