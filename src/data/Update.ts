import { Timestamp } from 'firebase/firestore'

export type UpdateModel = {
	uid: string
	dept: string
	title?: string
	caption?: string
	posted?: Timestamp
	instaPostId?: string
}
