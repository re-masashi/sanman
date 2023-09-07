let playing = false;
let queue = {
	'previous': [],
	'current' : new Audio('https://aac.saavncdn.com/987/e6953ba47dfe798e3b9b9464ca73b2a2_320.mp4'),
	'next': []
}

document.getElementById('progress').addEventListener('click', setProgress);

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
	  	console.log(json);
	  	const resp = json.data[0];
      queue.current.pause();
      queue.current.remove();
	  	console.log(resp);
	  	queue.current = new Audio(resp.downloadUrl[4].link);
	  	document.getElementById('albumcover').src=resp.image[2].link;
	  	document.getElementById('artists').innerHTML = resp.primaryArtists;
	  	document.getElementById('songname').innerHTML = resp.name;
      let duration = resp.duration;
      document.getElementById('duration').innerHTML = Math.floor(duration/60)+":"+Math.ceil(duration%60);
	  	queue.current.play();
	  	queue.current.addEventListener('timeupdate', updateProgress);
	  	document.querySelector('#playbutton').innerHTML = "<i class='material-icons'>pause</i>";
	  	playing = true;
      document.getElementById('progress').addEventListener('click', setProgress);
	  });
}

function play() {
	if (playing) {
		queue.current.pause();
		document.querySelector('#playbutton').innerHTML = "<i class='material-icons'>play_arrow</i>";
	}else{
		queue.current.play();
		document.querySelector('#playbutton').innerHTML = "<i class='material-icons'>pause</i>";
	}
	playing = !playing;
	
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  document.getElementById('scrollpercent').style.width = `${progressPercent}%`;
  document.getElementById('timeplayed').innerHTML = Math.floor(currentTime/60)+":"+Math.ceil(currentTime%60);
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
	          <p class="text-gray-300">Name of your song please</p>
	        </div>
	        <div class="space-y-4">
	        	<input 
	        		id="query" 
	        		type='text' 
	        		class="bg-gray-900 appearance-none rounded w-full py-2 px-4 text-red-100 leading-tight focus:outline-none focus:bg-gray-950 focus:border-red-800 focus:border-2"
	        		placeholder="Song Name">
	          <button id="modalbtn2" onclick="results(document.getElementById('query').value);document.getElementById('modal').remove();" class="p-3 bg-white border rounded-full w-full font-semibold">GO!</button>
	          <button id="modalbtn1" onclick="document.getElementById('modal').remove();" class="p-3 bg-red-800 rounded-full text-white w-full font-bold">Cancel</button>
	        </div>
	      </div>
	    </div>
	  </div>
	</div>
	`
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
