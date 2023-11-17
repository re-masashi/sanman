let playing = false;

let currentImage = localStorage.getItem("currentImage");
let currentID = localStorage.getItem("currentID")||"c1IjvQEH";
let currentAudio = localStorage.getItem("currentAudio");
let currentArtists = localStorage.getItem("currentArtists");
let currentSongname = localStorage.getItem("currentSongname");
let currentDuration = localStorage.getItem("currentDuration");
let currentTitle = localStorage.getItem("currentTitle");
let currentQueuePrev = localStorage.getItem("currentQueuePrev");
let currentQueueNext = localStorage.getItem("currentQueueNext");
let currentQueue = localStorage.getItem('currentQueue');
let currentQueueIndex = parseInt(localStorage.getItem('currentQueueIndex')||0);
let currentQueueID = localStorage.getItem('currentQueueID')||'s:'+currentID;
/*
	'a:<albumid>'
	or
	'p:<playlistid>'
	or
	's:<singleid>'
*/

let mediaSessionInit = ()=>{
  if ("mediaSession" in navigator) {
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
      queue.current.play();
      document.querySelector('#playbutton').innerHTML = `<i class="material-icons animate-glotext bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-black text-center">pause</i>`;
      playing=true;
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      queue.current.pause();
      document.querySelector('#playbutton').innerHTML = `<i class="material-icons">play_arrow</i>`;
      playing=false;
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
      if (details.fastSeek && 'fastSeek' in queue.current) {
        // Only use fast seek if supported.
        queue.current.fastSeek(details.seekTime);
        return;
      }
      queue.current.currentTime = details.seekTime;
      const progressPercent = (queue.current.currentTime / currentDuration) * 100;
      document.getElementById('scrollpercent').style.width = `${progressPercent}%`;
      document.getElementById('timeplayed').innerHTML = Math.floor(queue.current.currentTime/60)+":"+Math.floor(queue.current.currentTime%60);
      // TODO: Update playback state.
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      queuePrev();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      queueNext();
    });
    // navigator.mediaSession.setActionHandler('seekto', (details) => {
    //    // if (details.fastSeek && 'fastSeek' in queue.current) {
    //    //   // Only use fast seek if supported.
    //    //   queue.current.fastSeek(details.seekTime);
    //    //   return;
    //    // }
    //    queue.current.currentTime = details.seekTime;

    //    const progressPercent = (queue.current.currentTime / currentDuration) * 100;
    //    document.getElementById('scrollpercent').style.width = `${progressPercent}%`;
    //    document.getElementById('timeplayed').innerHTML = Math.floor(queue.current.currentTime/60)+":"+Math.floor(queue.current.currentTime%60);

    //  });

  }

}

let queue = {
	'queue': JSON.parse(currentQueue)||[],
	'previous': JSON.parse(currentQueuePrev)||[],
	'current' : new Audio(currentAudio||'https://aac.saavncdn.com/987/e6953ba47dfe798e3b9b9464ca73b2a2_320.mp4'),
	'next': JSON.parse(currentQueueNext)||[],
}

document.getElementById('duration').innerHTML = Math.floor(currentDuration/60)+":"+Math.ceil(currentDuration%60);
document.getElementById('artists').innerHTML = currentArtists;
document.getElementById('songname').innerHTML = currentSongname;
document.getElementById('albumcover').src = currentImage;
document.title = currentTitle;

loadSong(currentID)

let queueNext = (e)=>{
  playing = false;
  // queue.current.addEventListener('timeupdate', updateProgress);
  // document.getElementById('progress').addEventListener('click', setProgress);
  if (queue.queue.length <= 1) {
    queue.current.currentTime = 0;
    play();
    return;
  }
  if (currentQueueIndex>=queue.queue.length-1) {
    currentQueueIndex = 0;
    localStorage.setItem("currentQueue", JSON.stringify(queue.queue));
    console.log(queue.queue[currentQueueIndex]);
    loadSong(queue.queue[currentQueueIndex]);
    return;
  }
  console.log(currentQueueIndex)
  currentQueueIndex +=1;
  currentQueueIndex = currentQueueIndex%(queue.queue.length-1); // prevent out of index errs
  localStorage.setItem("currentQueue", JSON.stringify(queue.queue));
  localStorage.setItem("currentQueueIndex", JSON.stringify(currentQueueIndex));
  console.log(queue.queue[currentQueueIndex]);
  loadSong(queue.queue[currentQueueIndex]);
}

let queuePrev = (e)=>{
	console.log("prev")
	playing = false;
  if (queue.queue.length <= 1) {
    queue.current.currentTime = 0;
    play();
    return;
  }
	if (currentQueueIndex<=0) {
		currentQueueIndex=queue.queue.length;
	}
	currentQueueIndex -=1;
	localStorage.setItem("currentQueue", JSON.stringify(queue.queue));
  localStorage.setItem("currentQueueIndex", JSON.stringify(currentQueueIndex));
	loadSong(queue.queue[currentQueueIndex]);
}

function play() {
	if (playing) {
		queue.current.pause();
		document.querySelector('#playbutton').innerHTML = `<i class="material-icons">play_arrow</i>`;
	}else{
		queue.current.play();
		document.querySelector('#playbutton').innerHTML = `<i class="material-icons animate-glotext bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-black text-center">pause</i>`;
	}
	playing = !playing;
}

mediaSessionInit();

function setProgress(e) {
  console.log('cl');
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = queue.current.duration;

  queue.current.currentTime = (clickX / width) * duration;
  const progressPercent = (queue.current.currentTime / duration) * 100;
  document.getElementById('scrollpercent').style.width = `${progressPercent}%`;
  document.getElementById('timeplayed').innerHTML = Math.floor(queue.current.currentTime/60)+":"+Math.ceil(queue.current.currentTime%60);
  
}


function loadSong(id) {
	fetch(`https://saavn.me/songs?id=${id}`)
	  .then((response) => response.json())
	  .then((json) => {
	  	currentID = id;
	  	localStorage.setItem("currentID", currentID);
	  	if (json.data === null) {
	  		console.log("SUMN WRONG")
	  		document.getElementById('approot').innerHTML = document.getElementById('approot').innerHTML+
	  		`
	  		<div id="toast" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 py-10">
	  		  <div class="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-black">
	  		    <div class="w-full">
	  		      <div class="m-8 my-20 max-w-[400px] mx-auto">
	  		        <div class="mb-2">
	  		          <h1 class="mb-4 text-white text-xl font-bold">Too many requests</h1>
	  		        </div>
	  		        <div class="space-y-2">
	  		          <button id="modalbtn2" onclick="document.getElementById('toast').remove();" class="p-3 bg-white border rounded-full w-full font-semibold">Ok</button>
	  		        </div>
	  		      </div>
	  		    </div>
	  		  </div>
	  		</div>
	  		`;
	  		return;
	  	}

	  	const resp = json.data[0];

	  	if (queue.current!==null) {
	  		queue.current.pause();
	  		queue.current.remove();
	  	}

	  	currentImage = resp.image[2].link;
	  	localStorage.setItem('currentImage', resp.image[2].link);
	  	document.getElementById('albumcover').src=currentImage;

	  	currentAudio = resp.downloadUrl[4].link;
	  	localStorage.setItem('currentAudio', currentAudio);
	  	queue.current = new Audio(currentAudio);
      queue.current.controls = true;

	  	currentArtists = resp.primaryArtists;
	  	document.getElementById('artists').innerHTML = currentArtists;
	  	localStorage.setItem('currentArtists', currentArtists);

	  	currentSongname = resp.name;
	  	document.getElementById('songname').innerHTML = currentSongname;
	  	localStorage.setItem("currentSongname", currentSongname);

      let currentDuration = resp.duration;
      document.getElementById('duration').innerHTML = Math.floor(currentDuration/60)+":"+Math.floor(currentDuration%60);
      localStorage.setItem("currentDuration", currentDuration);

      mediaSessionInit();

	  	queue.current.play();
	  	queue.current.addEventListener('timeupdate', updateProgress);
	  	document.querySelector('#playbutton').innerHTML = `<i class="material-icons animate-glotext bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-black text-center">pause</i>`;
	  	playing = true;
	  	
      currentTitle = resp.name + " by " + resp.primaryArtists + " | Sanman";
      document.title = currentTitle;
      localStorage.setItem('currentTitle', currentTitle);
      
      document.getElementById('progress').addEventListener('click', setProgress);
      if (currentID!==null)
      	queue.previous.push(currentID);
      
      // queue.current.addEventListener('ended', (e)=>{
      //   playing = false;
      //   console.log('ended')
      //   // queue.previous.push(currentID);
      //   //loadSong(queue.next.shift());
      //   // console.log(queue.current);
      //   // queue.current.addEventListener('timeupdate', updateProgress);
      //   // document.getElementById('progress').addEventListener('click', setProgress);
      //   play();
      // })
      queue.current.addEventListener('ended', queueNext);    
	  });
}

function playPlaylist(id) {
		queue.queue = [];
    currentQueueIndex = 0;
		fetch(`https://saavn.me/playlists?id=${id}`)
		  .then((response) => response.json())
		  .then((json) => {
		  	let resp = json.data;
		  	for (let i=1; i <= resp.songs.length - 1 ; i++) {
		  		queue.queue.push(resp.songs[i].id)
		  	}
        loadSong(resp.songs[0].id);
		  })
}

function playAlbum(id) {
    queue.queue = [];
    currentQueueIndex = 0;
    fetch(`https://saavn.me/albums?id=${id}`)
      .then((response) => response.json())
      .then((json) => {
        let resp = json.data;
        for (let i=0; i < resp.songs.length ; i++) {
          queue.queue.push(resp.songs[i].id)
        }
        loadSong(resp.songs[0].id);
      })
}


function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  document.getElementById('scrollpercent').style.width = `${progressPercent}%`;
  document.getElementById('timeplayed').innerHTML = Math.floor(currentTime/60)+":"+Math.ceil(currentTime%60);
  navigator.mediaSession.setPositionState({
    duration: currentDuration,
    playbackRate: queue.current.playbackRate,
    position: queue.current.currentTime,
  });
}

let modal = (title, text, button1, button2, act1, act2) => {
	document.body.innerHTML += `
	<div id="modal" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 py-10">
	  <div class="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-black">
	    <div class="w-full">
	      <div class="m-8 my-20 max-w-[400px] mx-auto">
	        <div class="mb-8">
	          <h1 class="mb-4 text-white text-3xl font-extrabold">${title}</h1>
	          <p class="text-gray-300">${text}</p>
	        </div>
	        <div class="space-y-4">
	          <button id="modalbtn1" onclick="document.getElementById('modal').remove();" class="p-3 bg-red-800 rounded-full text-white w-full font-semibold">${button1}</button>
	          <button id="modalbtn2" onclick="document.getElementById('modal').remove();" class="p-3 bg-white border rounded-full w-full font-semibold">${button2}</button>
	        </div>
	      </div>
	    </div>
	  </div>
	</div>
	`
	return [
		document.getElementById('modal'),
		document.getElementById('modalbtn1'),
		document.getElementById('modalbtn2')
	]
}

let search = () =>{
	document.body.innerHTML += `
	<div id="modal" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 py-10">
	  <div class="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-black">
	    <div class="w-full">
	      <div class="m-8 my-20 max-w-[400px] mx-auto">
	        <div class="mb-8">
	          <h1 class="mb-4 text-white text-3xl font-extrabold">Search</h1>
	          <p class="text-gray-300">Search a song or album or playlist</p>
	        </div>
	        <div class="space-y-4">
	        	<input 
	        		id="query" 
	        		type='text' 
	        		class="bg-gray-900 appearance-none rounded w-full py-2 px-4 text-red-100 leading-tight focus:outline-none"
	        		placeholder="Song Name">
	          <button id="modalbtn2" onclick="results(document.getElementById('query').value);document.getElementById('modal').remove();" class="p-3 bg-white border rounded-full w-full font-semibold">GO!</button>
	          <button id="modalbtn1" onclick="document.getElementById('modal').remove();" class="p-3 bg-indigo-800 rounded-full text-white w-full font-bold">Cancel</button>
	        </div>
	      </div>
	    </div>
	  </div>
	</div>
	`
  let input = document.getElementById("query");

  // Execute a function when the user presses a key on the keyboard
  input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("modalbtn2").click();
    }
  }); 
}

let results = (query) => {
	fetch('/apisearch?q='+query)
	  .then(r=>r.text())
	  .then(t=>{
	  	console.log(t);
	  	document.body.innerHTML += `
	  	<div id="modal" class="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-75 py-10">
	  	  <div class="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-black">
	  	    <div class="w-full">
	  	      <div class="m-8 my-20 max-w-[400px] mx-auto">
	  	        <div class="mb-8">
	  	          <h1 class="mb-4 text-white text-3xl font-extrabold">Results</h1>
	  	          <p class="text-gray-300">Showing results for '${query}'</p>
	  	        </div>
	  	        <div class="space-y-4">
	  	        	<div class="max-w-2xl mx-auto">

	  	        		<div class="p-4 max-w-md bg-black rounded-lg border shadow-md sm:p-8">
	  	        	    <div class="flex justify-between items-center mb-4">
	  	        	        <h3 class="text-xl font-bold leading-none text-gray-900 dark:text-white">
	  	        	        	...
	  	        	        </h3>
	  	        	        <a class="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
	  	        	            View all
	  	        	        </a>
	  	        	   </div>
	  	        	   <div class="flow-root">
	  	        	   ${t}
	  	        	   </div>
	  	        	</div>
	  	        	</div>
	  	          <button id="modalbtn1" onclick="document.getElementById('modal').remove();" class="p-3 bg-red-800 rounded-full text-white w-full font-bold">Cancel</button>
	  	        </div>
	  	      </div>
	  	    </div>
	  	  </div>
	  	</div>
	  	`
	  })
}


function downloadSong() {    
  let filename = currentSongname+" by "+currentArtists;
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
  xhr.open('GET', queue.current.src);
  xhr.send();
}

function setQueueState() {
  localStorage.setItem("currentQueue", JSON.stringify(queue.queue));
  localStorage.setItem("currentQueueID", currentQueueID);
}

// document.getElementById('sharebtn').addEventListener('click', (e)=>{
//   if (navigator.share === undefined) {
//      window.location.href = "/share/song/?id="+currentID;
//   }
//   navigator.share({
//     title: currentSongname+" by "+currentArtists,
//     text: "Listen to "+currentSongname+" by "+currentArtists+" on Sanman!",
//     url: window.location.origin+"/share/song/?id="+currentID
//   });
// })

if ("serviceWorker" in navigator) {
  // register service worker
  navigator.serviceWorker.register("static/sw.js").then(()=>{});
}
