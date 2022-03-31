import admin, { messaging } from 'firebase-admin'
import { database, firestore } from 'firebase-functions'

admin.initializeApp()

export const updateKHMenu = database.ref('/khMenu').onWrite((snapshot) =>
	admin
		.firestore()
		.doc('/mfsd/khMenu')
		.set(snapshot.after.val())
		.then((result) => console.log(result))
		.catch((err) => console.error(err))
)

export const subUsersToTopics = firestore.document('users/{userDoc}').onWrite(({ before, after }) => {
	if (!before.exists) return
	if (!after.exists) return

	const { displayName, deviceTokens, subbedTopics } = after.data() as { displayName: string; deviceTokens?: string[]; subbedTopics?: string[] }

	if ((before.data() as { subbedTopics?: string[] }).subbedTopics?.every((topic) => subbedTopics?.includes(topic))) return

	const unSubbedTopics = ['mfsd', 'mwf', 'nabsd'].filter((topic) => !subbedTopics?.includes(topic))
	for (const topic of subbedTopics ?? [])
		admin
			.messaging()
			.subscribeToTopic(deviceTokens ?? [], topic)
			.then((val) => {
				if (val.failureCount > 0) console.log(`Errors in subscribing : ${displayName}'s devices (${deviceTokens}) to ${topic}'`, val.errors)
				console.log(`Success in subscribing ${displayName}'s devices (${deviceTokens}) to ${topic}`)
			})
			.catch((err) => console.error(err))

	for (const topic of unSubbedTopics)
		admin
			.messaging()
			.unsubscribeFromTopic(deviceTokens ?? [], topic)
			.then((val) => {
				if (val.failureCount > 0) console.log(`Errors in unsubscribing : ${displayName}'s devices (${deviceTokens}) from ${topic}'`, val.errors)
				console.log(`Success in unsubscribing ${displayName}'s devices (${deviceTokens}) from ${topic}`)
			})
			.catch((err) => console.error(err))
})

export const sendUpdateNotif = firestore.document('updates/{updateUid}').onWrite(async ({ after }) => {
	if (!after.exists) return
	const { uid, dept, title, caption, midsAndCos } = after.data() as { uid: string; dept: string; title: string; caption?: string; midsAndCos: string[] }

	const img = (
		await admin
			.storage()
			.bucket()
			.getFiles({ prefix: `updates/${uid}/media` })
	)[0]
		.filter((img) => !img.name.includes('-vid'))
		.sort()
		.find(() => true)
	const notification = {
		title: `${dept.toUpperCase()}: ${title}`,
		body: caption,
		imageUrl: img ? `https://firebasestorage.googleapis.com/v0/b/whats-app-usna.appspot.com/o/${img.name.split('/').join('%2F')}?alt=media` : undefined,
	}
	const data = { dept, uid }

	if (midsAndCos.length > 0 || midsAndCos.includes('all')) {
		const message = {
			topic: dept,
			notification,
			data,
		} as messaging.Message
		admin
			.messaging()
			.send(message)
			.then((result) => console.log('Sent message', JSON.stringify(message, null, 2), JSON.stringify(result, null, 2)))
			.catch((err) => console.error(err))
	} else {
		const allDeviceTokens = []
		for (const midOrCo of midsAndCos) {
			if (/\d\d\d\d\d\d/.test(midOrCo)) {
				const alpha = midOrCo
				const { uid } = await admin.auth().getUserByEmail(`m${alpha}@usna.edu`)
				const { deviceTokens } = (await admin.firestore().doc(`/users/${uid}`).get()).data() as { deviceTokens?: string[] }
				allDeviceTokens?.push(...(deviceTokens ?? []))
			} else if (/\d\d\d\d/.test(midOrCo)) {
				const year = midOrCo.slice(-2)
				const allUsersOfYear = (await admin.auth().listUsers()).users.filter((user) => user.email?.slice(1, 3) === year)
				const deviceTokens = (
					await Promise.all(
						(await admin.firestore().collection('users').listDocuments())
							.filter((doc) => allUsersOfYear.map((user) => user.uid).includes(doc.id))
							.map((doc) => doc.get())
					)
				)
					.map((doc) => (doc.data() as { deviceTokens?: [] }).deviceTokens)
					.reduce((p, c) => p?.concat(c ?? []), [] as string[])
				allDeviceTokens.push(...(deviceTokens ?? []))
			} else if (/\d\d/.test(midOrCo)) {
				const co = midOrCo
				const deviceTokens = (await admin.firestore().collection('users').where('midsAndCos', 'array-contains', co).get()).docs
					.map((doc) => (doc.data() as { deviceTokens?: [] }).deviceTokens)
					.reduce((p, c) => p?.concat(c ?? []), [] as string[])
				allDeviceTokens.push(...(deviceTokens ?? []))
			}
		}
		messaging().sendMulticast({ tokens: allDeviceTokens, notification, data })
	}
})
