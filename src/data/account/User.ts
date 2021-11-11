import { doc, setDoc } from '@firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { AppContextType as AppContextType } from '../../AppContext'
import { firestore } from '../../Firebase'
import { MapStringType } from '../../util/misc'

export type UserDataModel = {
	uid: string
}

export type AdminsModel = {
	all: string[]
	depts: MapStringType<string[]>
}

export const setUserData = async (appContext: AppContextType) => {
	if (appContext.user) {
		return setDoc(doc(firestore, 'users', appContext.user.uid), appContext.userData)
	} else console.error("User isn't logged in; cannot set user data document.")
}

export const isAdmin = (admins?: AdminsModel, userData?: UserDataModel, dept: string = uuidv4()) =>
	admins && userData && (admins?.all.includes(userData.uid) || admins?.depts[dept]?.includes(userData.uid))
