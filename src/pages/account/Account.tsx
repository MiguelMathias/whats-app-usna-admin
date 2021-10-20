import { useContext } from 'react'
import { AppContext } from '../../AppContext'
import LogIn from './LogIn'
import UserHome from './UserHome'

const Account: React.FC = () => {
	const appContext = useContext(AppContext)
	return appContext.user ? <UserHome /> : <LogIn />
}

export default Account
