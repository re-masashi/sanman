document.querySelectorAll('a.nav-a').forEach((elem)=>{
	elem.addEventListener('click', (e)=>{
		e.preventDefault();
		fetch(elem.href)
		.then((response) => response.text())
		.then((data) => {
			document.getElementById('approot').innerHTML = data;
		});
	})
})