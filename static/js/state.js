class State{
	constructor(){
		this.state = {
			playing: false,
		}
		this.subscribers = {}
		this.elemSubscribers = {}
		this.condElemSubscribers = {}
	}
	subscribe(propname, listener){
		// listener must take one arg `state`
		if (!this.subscribers[propname]) {
			this.subscribers[propname] = []
		}
		this.subscribers[propname].push(listener);
	}
	elemSubscribe(propname, elem){
		// elem must be a DOM element
		if (!this.elemSubscribers[propname]) {
			this.elemSubscribers[propname] = []
		}
		this.elemSubscribers[propname].push(elem);
	}
	condElemSubscribe(propname, condElem){
		// conditional element (condElem)
		// must have 'elem' as a DOMElement
		// must have 'expression' which returns a string
		/* Eg:
		`
			condElem = {
				elem: document.getElementById('light'),
				expression: (state) => {
					if(state.getState('on'))
						return 'on'
					else
						return 'off'
				}
			}
		`
		*/
		if (!this.condElemSubscribers[propname]) {
			this.condElemSubscribers[propname] = []
		}
		this.condElemSubscribers[propname].push(condElem);
	}
	setState(prop, value, callback){
		let old = this.state.prop;
		this.state[prop] = value;
		for(let sub in this.subscribers[prop]){
			this.subscribers[prop][sub](this)
		}
		for(let sub in this.elemSubscribers[prop]){
			this.elemSubscribers[prop][sub].innerHTML = value;
		}
		for(let sub in this.condElemSubscribers[prop]){
			let elem = this.condElemSubscribers[prop][sub];
			elem.elem.innerHTML = elem.expression(this);
		}
		if (callback)
			callback();
	}
	setStateWithLS(prop, value, callback){
		// setState but with localstorage binding <3
		let old = this.state.prop;
		this.state[prop] = value;
		localStorage.setItem(prop, JSON.stringify(value))
		for(let sub in this.subscribers[prop]){
			this.subscribers[prop][sub](this)
		}
		for(let sub in this.elemSubscribers[prop]){
			this.elemSubscribers[prop][sub].innerHTML = value;
		}
		for(let sub in this.condElemSubscribers[prop]){
			let elem = this.condElemSubscribers[prop][sub];
			elem.elem.innerHTML = elem.expression(this);
		}
		if (callback)
			callback();
	}
	getState(prop){
		return this.state[prop];
	}
	initState(){
		this.setState(
			'image',
			localStorage.getItem("image")||'/static/images/placeholder.jpg',
		)
		this.setState(
			'ID',
			localStorage.getItem("ID")||"c1IjvQEH",
		)
		this.setState(
			'audio',
			localStorage.getItem("audio")||'https://aac.saavncdn.com/987/e6953ba47dfe798e3b9b9464ca73b2a2_320.mp4',
		)
		this.setState(
			'artists',
			localStorage.getItem("artists")||"Travis Scott",
		)
		this.setState(
			'songname',
			localStorage.getItem("songname")||"Nightcrawler",
		)
		this.setState(
			'duration',
			parseFloat(localStorage.getItem("duration")||321),
		)
		this.setState(
			'timeplayed',
			parseFloat(localStorage.getItem("timeplayed")||0),
		)
		this.setState(
			'title',
			localStorage.getItem("title")||"Home | Sanman",
		)
		this.setState(
			'queue',
			JSON.parse(localStorage.getItem("queue"))||[],
		)
		this.setState(
			'queueIndex',
			parseInt(localStorage.getItem('queueIndex')||0),
		)
		this.setState(
			'queueID',
			localStorage.getItem('queueID')||'s:'+this.getState('ID'),
		)
	}
}