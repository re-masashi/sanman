let lrc = new Lyricer();

let loadLyrics = ()=>{
  const page = '/lyrics/song?q='+currentSongname+' '+currentArtists
  let cachedVal = window.caches.open('lyrCache')
      .then((cache)=>cache.match(page));
  if (cachedVal!==undefined) {
    cachedVal
      .then((response)=>{
        if (response!==undefined) return response.text();
      })
      .then(data=>{
        if (document.getElementById(lrc.divID)) {
          lrc.setLrc(data);
        }        
      })
  }
  
	fetch(page)
	  .then(response=>{
      let copy = response.clone();
      window.caches.open('lyrCache')
        .then((cache)=>{
          cache.put(page, copy);
        })
      return response.text()
    })
	  .then(text=>{
      if (document.getElementById(lrc.divID)) {
        lrc.setLrc(text);
      }
	  })
}

window.addEventListener('lyricerclick', function(e){
    if (e.detail.time > 0) {
        queue.current.currentTime = e.detail.time;
        lrc.move(e.detail.time);
    }
});