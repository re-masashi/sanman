const pauseIcon = `<i class="material-icons animate-glotext bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-black text-center">pause</i>`;
const playIcon = `<i class="material-icons">play_arrow</i>`;

window.appstate = new State();

let initPage = () =>{
	appstate.condElemSubscribe('playing', {
		elem: document.getElementById('playbutton'),
		expression: (state)=>{
			if (state.getState('playing'))
				return pauseIcon
			else
				return playIcon
		}
	})

	appstate.condElemSubscribe('duration', {
		elem: document.getElementById('duration'),
		expression: (state)=>{
			const dur = state.getState('duration')
			return Math.floor(dur/60)+":"+Math.floor(dur)%60;
		}
	})

	appstate.elemSubscribe('songname', document.getElementById('songname'))
	appstate.elemSubscribe('artists', document.getElementById('artists'))
	appstate.elemSubscribe('player_songcover', document.getElementById('artists'))

	appstate.subscribe('image', (state)=>{
		document.getElementById('player_songcover').src = state.getState('image')
	})
	appstate.initState();

	appstate.subscribe('playing', (state)=>{
		if (state.getState('playing')) {
			player.play()
		}else{
			player.pause()
		}
	})
}

initPage()

let loadDetailedPage = () => {
	if (appstate.getState('queueID').startsWith('p:')) {
		Turbo.visit('/playlists/'+appstate.getState('queueID').slice(2))
		return	
	}
	Turbo.visit('/songs/'+appstate.getState('queue')[appstate.getState('queueIndex')])
}

function downloadSong() {
	let currentSongname = appstate.getState('songname')
  let filename = currentSongname
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function() {
  let a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhr.response);
    a.download = filename; 
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    delete a;
  };
  xhr.open('GET', appstate.getState('audio'));
  xhr.send();
}


let shareSong = ()=>{
	console.log('share')
  if (navigator.share === undefined) {
     window.location.href = "/share/song/?id="+appstate.getState('ID');
     return;
  }
  navigator.share({
    title: currentSongname+" by "+currentArtists,
    text: "Listen to "+currentSongname+" by "+currentArtists+" on Sanman!",
    url: window.location.origin+"/share/song/?id="+currentID
  });
}

let showMoreOptions = () =>{
  if (document.getElementById('moreoptions')!==null) {
    document.getElementById('moreoptions').remove();
    return;
  }
  document.body.innerHTML+=`
    <div class="font-thin bg-black ml-1 duration-300 flex items-center flex-col fixed bottom-0 left-0 mb-24 z-50 rounded-3xl" id="moreoptions">
      <button class="p-2 hover:-translate-y-1 hover:scale-110 duration-300 transition" onclick="downloadSong();">
        <i class="material-icons text-fuchsia-500">download</i>
      </button>
      <button class="p-4 hover:-translate-y-1 hover:scale-110 duration-300 transition" >
        <i class="material-icons text-fuchsia-500 ">favorite</i>
      </button>
      <button class="p-2 hover:-translate-y-1 hover:scale-110 duration-300 transition" onclick="shareSong();">
        <i class="material-icons text-fuchsia-500 ">share</i>
      </button>
    </div>
  `
}

let mediaSessionInit = ()=>{
  if ("mediaSession" in navigator) {
  	let currentSongname = appstate.getState('songname')
  	let currentArtists = appstate.getState('raw_artists')
  	let currentImage = appstate.getState('image')
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSongname,
      artist: currentArtists,
      // album: "The Ultimate Collection (Remastered)",
      artwork: [
        {
          src: currentImage,
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () => {
    	player.play()
    	appstate.setState('playing', true)
    });
    navigator.mediaSession.setActionHandler("pause", () => {
    	player.pause()
    	appstate.setState('playing', false)
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      /* Nothing */
    });
    // navigator.mediaSession.setActionHandler("seekbackward", () => {
    //   /* TODO */
    // });
    // navigator.mediaSession.setActionHandler("seekforward", () => {
    //   /* TODO. */
    // });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.fastSeek && 'fastSeek' in player.audio) {
        // Only use fast seek if supported.
        player.audio.fastSeek(details.seekTime);
        appstate.setStateWithLS('timeplayed', details.seekTime)
        return;
      }
      appstate.setState('timeplayed',details.seekTime)
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      player.queuePrev();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      player.queueNext();
    });
  }
}

mediaSessionInit()

appstate.subscribe('timeplayed', (state)=>{
  lrc.move(state.getState('timeplayed'))
})

let openLyrics=()=>{
	Turbo.visit('/lyrics/'+appstate.getState('ID'))
}