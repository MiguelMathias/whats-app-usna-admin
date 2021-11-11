type ImgOrVidProps = {
	file: File
	style?: React.CSSProperties
	controls?: boolean
	vidRef?: React.LegacyRef<HTMLVideoElement>
}

const ImgOrVid: React.FC<ImgOrVidProps> = ({ file, style, controls, vidRef }) =>
	file.type === 'video/mp4' ? (
		<video ref={vidRef} style={style} src={URL.createObjectURL(file)} controls={controls} />
	) : (
		<img style={{ maxWidth: 250 }} src={URL.createObjectURL(file)} />
	)

export default ImgOrVid
