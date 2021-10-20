import { doc, setDoc } from '@firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { AppContextType as AppContextType } from '../../AppContext'
import { firestore } from '../../Firebase'

export type UserDataModel = {
	uid: string
	admin?: string[]
}

export const setUserData = async (appContext: AppContextType) => {
	if (appContext.user) {
		return setDoc(doc(firestore, 'users', appContext.user.uid), appContext.userData)
	} else console.error("User isn't logged in; cannot set user data document.")
}

export const isAdmin = (userData?: UserDataModel, dept: string = uuidv4()) =>
	userData?.admin?.includes('all') || userData?.admin?.includes(dept)
