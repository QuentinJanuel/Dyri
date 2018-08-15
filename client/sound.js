let Sound;

(function(){
const Sound_Private = {
	sounds: {},
	list(){
		const list = Object.keys(Sound_Private.sounds)
		.map(soundName => Sound_Private.sounds[soundName]);
		return {
			BGM: list.filter(obj => obj.type == "bgm").map(obj => obj.name),
			SFX: list.filter(obj => obj.type == "sfx").map(obj => obj.name)
		};
		return list;
	},
	load(sounds, onLoad){
		let callbackCalled = false;
		sounds.forEach(sound => {
			if(sound.type == "bgm" || sound.type == "sfx"){
				let howl = new Howl({src: sound.url});
				Sound_Private.sounds[sound.name] = {
					name: sound.name,
					howl: howl,
					type: sound.type
				};
				if(sound.type == "bgm"){
					howl._loop = sound.type == "bgm";
					howl.volume(0.2);
				}
				howl.on("load", () => {
					let countLoaded = 0;
					sounds.forEach(sound2 => {
						if(Sound_Private.sounds[sound2.name].howl._state == "loaded")
							countLoaded++;
					});
					if(countLoaded == sounds.length && !callbackCalled){
						onLoad();
						callbackCalled = true;
					}
				});
			}
		});
	},
	get(soundName){
		let howl = Sound_Private.sounds[soundName].howl;
		if(!howl){
			console.error("Unexisting sound \""+soundName+"\"");
			return;
		}
		let sound = {};
		sound.play = () => {
			howl.play();
		}
		sound.pause = () => {
			howl.pause();
		}
		sound.stop = () => {
			howl.stop();
		}
		sound.volume = volume => {
			if(volume)
				howl.volume(volume/100);
			else
				return howl.volume()*100;
		}
		sound.duration = () => howl._duration;
		sound.position = pos => {
			if(pos)
				howl.seek(pos);
			else
				return howl.seek();
		}
		return sound;
	}
}
Sound = {
	list: Sound_Private.list,
	load: Sound_Private.load,
	get: Sound_Private.get,
	stopAllBGM(){
		this.list().BGM.forEach(bgm => this.get(bgm).stop());
	},
	stopAllSFX(){
		this.list().SFX.forEach(sfx => this.get(sfx).stop());
	},
	stopAll(){
		this.stopAllSFX();
		this.stopAllBGM();
	}
};
})();
