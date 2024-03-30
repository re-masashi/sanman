window.lrc = new Lyricer();

let loadLyrics = (text)=>{
  if (document.getElementById(lrc.divID)) {
    lrc.setLrc(text);
  }
}

window.addEventListener('lyricerclick', function(e){
    if (e.detail.time > 0&&e.detail.time!=undefined) {
        appstate.setStateWithLS('timeplayed') = e.detail.time;
        lrc.move(e.detail.time);
    }
});