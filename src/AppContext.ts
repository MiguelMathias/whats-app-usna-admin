import { User } from 'firebase/auth'
import React from 'react'
import { AdminsModel, UserDataModel } from './data/account/User'

export type AppContextType = {
	user?: User
	setUser: (user: User) => void
	userData?: UserDataModel
	setUserData: (userData: UserDataModel) => void
	admins: AdminsModel
	setAdmins: (admins: AdminsModel) => void
}

export const AppContext = React.createContext({
	user: undefined,
	setUser: () => {},
	userData: undefined,
	setUserData: () => {},
	admins: { all: [], depts: {} },
	setAdmins: () => {},
} as AppContextType)
