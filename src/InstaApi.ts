import { IgApiClient, PostingAlbumPhotoItem, PostingAlbumVideoItem } from 'instagram-private-api'
import { getThumbnails } from 'video-metadata-thumbnails'

const username = 'testacct73'
const password = 'SwordFish69'
const ig = new IgApiClient()
ig.state.generateDevice(username)
;(async () => {
	const user = await ig.account.login(username, password)
	console.log('logged into insta as: ' + user.username)
})()

const uploadPhoto = async (photoFile: File, caption?: string) =>
	ig.publish.photo({
		file: Buffer.from(photoFile),
		caption,
	})

const uploadVideo = async (videoFile: File, caption?: string) =>
	ig.publish.video({
		video: Buffer.from(videoFile),
		coverImage: Buffer.from((await getThumbnails(videoFile))[0].blob ?? ''),
		caption,
	})

const uploadAlbum = async (albumFiles: File[], caption?: string) =>
	ig.publish.album({
		items: await Promise.all(
			albumFiles.map(async (albumFile) =>
				albumFile.type === 'video/mp4'
					? ({ video: Buffer.from(albumFile), coverImage: Buffer.from((await getThumbnails(albumFile))[0].blob ?? '') } as PostingAlbumVideoItem)
					: ({ file: Buffer.from(albumFile) } as PostingAlbumPhotoItem)
			)
		),
		caption,
	})

export const uploadInsta = async (files: File[], caption?: string) =>
	files.length > 1 ? uploadAlbum(files, caption) : files[0].type === 'video/mp4' ? uploadVideo(files[0], caption) : uploadPhoto(files[0], caption)
