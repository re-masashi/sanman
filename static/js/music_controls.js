class Music {
  constructor(state){
    this.state = state

    this.scrollpercent = document.getElementById('scrollpercent')
    this.timeplayed = document.getElementById('timeplayed')
    this.progress = document.getElementById('progress')
    this.duration = document.getElementById('duration')

    this.audio = document.getElementById('audio')
    this.audio.src = this.state.getState('audio')
    this.queue = this.state.getState('queue') // Array<ID> ID->String

    let set_progress = this.setProgress(this);
    let update_progress = this.updateProgress(this);

    this.progress.addEventListener("click", set_progress)
    this.audio.addEventListener("timeupdate", update_progress)
    this.audio.addEventListener("ended", (e)=>{this.queueNext()})
    this.audio.addEventListener("ended", (e)=>{console.log(e.target.currentTime)})

    this.audio.currentTime = this.state.getState('timeplayed')

    this.state.subscribe('timeplayed', (st)=>{
      const progressPercent = (this.audio.currentTime / st.getState('duration')) * 100
      this.scrollpercent.style.width = `${progressPercent}%`
      this.timeplayed.innerHTML =
        Math.floor(this.audio.currentTime / 60) +
        ":" +
        Math.floor(this.audio.currentTime) % 60
    })
    this.state.subscribe('audio', (st)=>{
      this.audio.src = st.getState('audio')
    })
    this.state.subscribe('duration', (st)=>{
      const currentDuration = st.getState('duration')
      this.duration.innerText = Math.floor(currentDuration/60)+":"+Math.floor(currentDuration%60);
    })
    
    this.lyricer = new Lyricer()
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
          this.state.setState('playing', false)
          this.pause();
          
          appstate.setStateWithLS('ID', songID)

          const resp = json.data[0];

          let artists = resp.primaryArtists.split(',')
          let ids = resp.primaryArtistsId.split(',')

          appstate.setStateWithLS('raw_artists', resp.primaryArtists)

          let artist_href = ""
          for(let i=0;i<artists.length;i++)
            artist_href+=`<a href="/artists/${ids[i]}">${artists[i]}</a>,`
          artist_href = artist_href.slice(0,-1) // remove trailing ','

          appstate.setStateWithLS('image', resp.image[2].link)
          appstate.setStateWithLS('audio', resp.downloadUrl[4].link)
          appstate.setStateWithLS('artists', artist_href)
          appstate.setStateWithLS('songname', resp.name)
          appstate.setStateWithLS('timeplayed', 0)
          appstate.setStateWithLS('duration', resp.duration)
          appstate.setStateWithLS('title', resp.name+" by "+appstate.getState('raw_artists')+"| Sanman")
          
          this.state.setState('playing', true)
          this.play()
        });
  }

  loadSingle(songID){
    this.state.setStateWithLS('queueID', 's:'+songID)
    this.state.setStateWithLS('queue', [songID])
    this.state.setStateWithLS('queueIndex', 0)
    this.loadSong(songID)
    this.queueNext()
  }

  loadAlbum(albumID){
    fetch(`https://saavn.me/albums?id=${albumID}`)
      .then((response) => response.json())
      .then((json) => {
        let resp = json.data;
        let queue = []
        for (let i=0; i < resp.songs.length ; i++)
          queue.push(resp.songs[i].id)
        this.state.setStateWithLS('queue', queue)
        this.state.setStateWithLS('queueIndex', -1) // queueNext call later
        this.state.setStateWithLS('queueID', 'a:'+albumID)
        this.queueNext()
      })
  }

  loadPlaylist(playlistID){
    fetch(`https://saavn.me/playlists?id=${playlistID}`)
      .then((response) => response.json())
      .then((json) => {
        let resp = json.data;
        let queue = []
        for (let i=0; i < resp.songs.length ; i++)
          queue.push(resp.songs[i].id)
        this.state.setStateWithLS('queue', queue)
        this.state.setStateWithLS('queueIndex', -1) // queueNext call later
        this.state.setStateWithLS('queueID', 'p:'+playlistID)
        this.queueNext()
      })
  }


  queueNext(){

    if(this.state.getState('queueID').startsWith('s:')){
      this.state.setState('playing', false)
      this.audio.currentTime = 0
      this.state.setStateWithLS('timeplayed', 0)
      this.state.setState('playing', true)
      return
    }
    let queue = this.state.getState('queue')
    let queueIndex = (this.state.getState('queueIndex')+1)%queue.length
    this.state.setStateWithLS('queueIndex', queueIndex)
    this.loadSong(
      queue[queueIndex]
    )
  }

  queuePrev(){

    if(this.state.getState('queueID').startsWith('s:')){
      this.state.setState('playing', false)
      this.audio.currentTime = 0
      this.state.setStateWithLS('timeplayed', 0)
      this.state.setState('playing', true)
      return   
    }
    let queue = this.state.getState('queue')
    let queueIndex = (queue.length+this.state.getState('queueIndex')-1)%queue.length
    this.state.setState('queueIndex',queueIndex)
    this.loadSong(
      queue[queueIndex]
    )
  }

  jumpTo(pos, id){
    if (this.state.getState('queueID')==id) {
      this.state.setStateWithLS('queueIndex', pos-1)
      this.queueNext()
      return
    }
    if (id.startsWith('a:')) {
      this.loadAlbum(id.substring(2))
    }else if (id.startsWith('p:')) {
      this.loadPlaylist(id.substring(2))
    }
  }

  reattach(){
    this.scrollpercent = document.getElementById('scrollpercent')
    this.timeplayed = document.getElementById('timeplayed')
    this.progress = document.getElementById('progress')
    this.duration = document.getElementById('duration')

    this.progress.addEventListener("click", this.setProgress)
    this.audio.addEventListener("timeupdate", this.updateProgress)
    this.audio.addEventListener("ended",(e)=>{
      this.queueNext()
    })
    window.addEventListener('lyricerclick', function(e){
        if (e.detail.time > 0&&e.detail.time!=undefined) {
            appstate.setState('timeplayed', e.detail.time);
            lrc.move(e.detail.time);
        }
    });
  }
}