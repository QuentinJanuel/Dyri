var Sound;

(function(){
var Sound_Private = {
	sounds: {},
	list: function(){
		var list = Object.keys(Sound_Private.sounds)
		.map(function(soundName){
			return Sound_Private.sounds[soundName];
		});
		return {
			BGM: list.filter(function(obj){
				return obj.type == "bgm";
			}).map(function(obj){
				return obj.name;
			}),
			SFX: list.filter(function(obj){
				return obj.type == "sfx";
			}).map(function(obj){
				return obj.name;
			})
		};
		return list;
	},
	load: function(sounds, onLoad){
		if(sounds == undefined)
			onLoad();
		if(sounds.length == 0)
			onLoad();
		var callbackCalled = false;
		sounds.forEach(function(sound){
			if(sound.type == "bgm" || sound.type == "sfx"){
				var howl = new Howl({src: sound.url});
				Sound_Private.sounds[sound.name] = {
					name: sound.name,
					howl: howl,
					type: sound.type
				};
				if(sound.type == "bgm"){
					howl._loop = sound.type == "bgm";
					howl.volume(0.2);
				}
				howl.on("load", function(){
					var countLoaded = 0;
					sounds.forEach(function(sound2){
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
	get: function(soundName){
		var howl = Sound_Private.sounds[soundName].howl;
		if(!howl){
			console.error("Unexisting sound \""+soundName+"\"");
			return;
		}
		var sound = {};
		sound.play = function(){
			howl.play();
		}
		sound.pause = function(){
			howl.pause();
		}
		sound.stop = function(){
			howl.stop();
		}
		sound.volume = function(volume){
			if(volume)
				howl.volume(volume/100);
			else
				return howl.volume()*100;
		}
		sound.duration = function(){
			return howl._duration;
		}
		sound.position = function(pos){
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
	stopAllBGM: function(){
		this.list().BGM.forEach(function(bgm){
			this.get(bgm).stop();
		}.bind(this));
	},
	stopAllSFX: function(){
		this.list().SFX.forEach(function(sfx){
			this.get(sfx).stop();
		}.bind(this));
	},
	stopAll: function(){
		this.stopAllSFX();
		this.stopAllBGM();
	}
};
})();
