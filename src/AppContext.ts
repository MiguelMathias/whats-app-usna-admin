import { User } from 'firebase/auth'
import React from 'react'
import { UserDataModel } from './data/account/User'

export type AppContextType = {
	user?: User
	setUser: (user: User) => void
	userData?: UserDataModel
	setUserData: (userData: UserDataModel) => void
}

export const AppContext = React.createContext({
	user: undefined,
	setUser: (user: User) => {},
	userData: undefined,
	setUserData: (userData: UserDataModel) => {},
} as AppContextType)
