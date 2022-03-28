import { doc, setDoc } from '@firebase/firestore'
import { User } from 'firebase/auth'
import { v4 as uuidv4 } from 'uuid'
import { AppContextType } from '../../AppContext'
import { firestore } from '../../Firebase'
import { MapString } from '../../util/misc'

export type UserDataModel = {
	uid: string
	email: string
	displayName?: string
	company?: number
	roomNumber?: number
	deviceTokens?: string[]
	subbedTopics?: string[]
	stripeId?: string
}

export type AdminsModel = {
	all: string[]
	depts: MapString<string[]>
}

export const setUserDoc = async (appContext: AppContextType) => {
	if (appContext.user) {
		return setDoc(doc(firestore, 'users', appContext.user.uid), appContext.userData)
	} else console.error("User isn't logged in; cannot set user data document.")
}

export const isAdmin = (admins?: AdminsModel, user?: User, dept: string = uuidv4()) =>
	admins && user?.email && (admins?.all.includes(user.email) || admins?.depts[dept]?.includes(user.email))
