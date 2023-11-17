let lrc = new Lyricer();

let loadLyrics = ()=>{
	fetch('https://sanman.re-masashi.repl.co/lyrics/song?q='+currentSongname+' '+currentArtists)
	  .then(r=>r.text())
	  .then(text=>{
		lrc.setLrc(text);
	  })
}