let homeData = null;
let isLyrOpen = false;

// const cacheRoutes = ['/albums/*',];

if (window.location.pathname==='/') {
	homeData = document.getElementById('approot').innerHTML;
}

document.querySelectorAll('a.nav-a').forEach((elem)=>{
	elem.addEventListener('click', (e)=>{
		e.preventDefault();
		navVisit(elem.href);
	})
})

let openLyrics = ()=>{
  if (isLyrOpen) {
    if (homeData===null) {
      navVisit('/');
    }
    isLyrOpen=false;
    document.getElementById('approot').innerHTML=homeData;
    return;
  }
  isLyrOpen = true;
  document.getElementById('approot').innerHTML='';
  let lr = document.createElement('lyrics');
  lr.id = 'lyricer';
  document.getElementById('approot').appendChild(lr);
  loadLyrics();
}


let navVisit=(page)=>{
  let cachedVal = window.caches.open('baseCache')
          .then((cache)=>cache.match(page));
  if (cachedVal!==undefined) {
    cachedVal.then((response)=>response.text()).then(data=>document.getElementById('approot').innerHTML = data)
  }

	fetch(page)
		.then((response) => {
      let copy = response.clone();
      if (page.substring(0,8)=='/albums/'&&response.ok) {
        window.caches.open('baseCache')
          .then((cache)=>{
            cache.put(page, copy);
          })
      };
      return response.text()
    })
		.then((data) => {
			document.getElementById('approot').innerHTML = data;
		});
}

function loadDetailedPage() {
  console.log("Loading "+currentQueueID);
  if (currentQueueID[0]==='a') {
    navVisit('/albums/'+currentQueueID.substring(2));
    return;
  }
  if (currentQueueIndex[0]==='p') {
    navVisit('/playlists/'+currentQueueID.substring(2));
    return;
  }
}
