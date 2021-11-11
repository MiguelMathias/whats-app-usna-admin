import { Timestamp } from '@firebase/firestore'

export type UpdatePost = {
	updateUid: string
	title?: string
	caption?: string
	posted?: Timestamp
	instaPostId?: string
}
