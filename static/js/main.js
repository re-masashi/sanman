const pauseIcon = `<i class="material-icons animate-glotext bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-black text-center">pause</i>`;
const playIcon = `<i class="material-icons">play_arrow</i>`;

window.appstate = new State();

appstate.condElemSubscribe('playing', {
	elem: document.getElementById('playbutton'),
	expression: (state)=>{
		if (state.getState('playing'))
			return pauseIcon
		else
			return playIcon
	}
})

appstate.elemSubscribe('songname', document.getElementById('songname'))
appstate.elemSubscribe('artists', document.getElementById('artists'))
appstate.elemSubscribe('player_songcover', document.getElementById('artists'))

document.getElementById('playbutton').onclick = (e)=>{
	appstate.setState('playing', !appstate.getState('playing'))
}

appstate.initState();

let player = new Music('scrollpercent', 'timeplayed', 'progress', 'duration', appstate);

appstate.subscribe('playing', (state)=>{
	if (state.getState('playing')) {
		player.play()
	}else{
		player.pause()
	}
})

appstate.subscribe('image', (state)=>{
	document.getElementById('player_songcover').src = state.getState('image')
})


let showMoreOptions = () => {
	console.log("todo")
}