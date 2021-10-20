export {}
const element = document.getElementById('root')

element?.addEventListener('touchstart', (e: any) => {
	// is not near edge of view, exit
	if (e.pageX > 10 && e.pageX < window.innerWidth - 10) return

	// prevent swipe to navigate gesture
	e.preventDefault()
})
