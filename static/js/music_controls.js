class Music {
  constructor(scrollpercent, timeplayed, progress, duration, state){
    this.scrollpercent = document.getElementById(scrollpercent)
    this.timeplayed = document.getElementById(timeplayed)
    this.progress = document.getElementById(progress)
    this.duration = document.getElementById(duration)

    this.audio = new Audio(state.getState('audio'))
    this.state = state

    let set_progress = this.setProgress(this);
    let update_progress = this.updateProgress(this);

    this.progress.addEventListener("click", set_progress)
    this.audio.addEventListener("timeupdate", update_progress)

    this.audio.currentTime = this.state.getState('timeplayed')

    this.state.subscribe('timeplayed', (st)=>{
      const progressPercent = (this.audio.currentTime / st.getState('duration')) * 100
      this.scrollpercent.style.width = `${progressPercent}%`
      this.timeplayed.innerHTML =
        Math.floor(this.audio.currentTime / 60) +
        ":" +
        Math.ceil(this.audio.currentTime) % 60
    })
    this.state.subscribe('audio', (st)=>{
      this.audio.src = st.getState('audio')
    })
    this.state.subscribe('duration', (st)=>{
      const currentDuration = st.getState('duration')
      this.duration.innerText = Math.floor(currentDuration/60)+":"+Math.floor(currentDuration%60);
    })

  }

  setProgress(self) {
    return function (e) {
      const width = this.clientWidth
      const clickX = e.offsetX      
      const duration = self.audio.duration


      self.audio.currentTime = (clickX / width) * duration;

      self.state.setStateWithLS('timeplayed', self.audio.currentTime)
    }
  }

  updateProgress(self) {
    return function(e){
      const { duration, currentTime } = e.srcElement
      self.state.setStateWithLS('timeplayed', currentTime)
    }
  }

  play(){
    this.audio.play()
  }

  pause(){
    this.audio.pause()
  }

  loadSong(songID){
      fetch(`https://saavn.me/songs?id=${songID}`)
        .then((response) => response.json())
        .then((json) => {
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

          this.pause();
          
          appstate.setStateWithLS('ID', songID)

          const resp = json.data[0];

          appstate.setStateWithLS('image', resp.image[2].link)
          appstate.setStateWithLS('audio', resp.downloadUrl[4].link)
          appstate.setStateWithLS('artists', resp.primaryArtists)
          appstate.setStateWithLS('songname', resp.name)
          appstate.setStateWithLS('timeplayed', 0)
          appstate.setStateWithLS('duration', resp.duration)
          appstate.setStateWithLS('title', resp.name+" by "+resp.primaryArtists+"| Sanman")
          
          this.play()
        });
  }
}