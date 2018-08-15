"use strict";

Screen.setup();

const startGame = function(gameName){
	var gamePath = "/games/"+gameName+"/";
	$.ajax({
		url: gamePath+"config.json",
		dataType: "json"
	}).done(function(json){
		Screen.loadImages(
			json.images.map(function(image){
				image.url = gamePath+image.url;
				return image;
			})
		, function(){
			Screen.dimensions = json.dimensions;
			Screen.needResize = true;
			Sound.load(
				json.sounds.map(function(sound){
					sound.url = gamePath+sound.url;
					return sound;
				})
			, function(){
				document.body.appendChild($("<script>").attr({
					src: gamePath+"main.js",
					type: "module"
				})[0]);
			});
		});
	});
}

socket.on("games", function(games){
	console.log("All games detected:", games);
	startGame("test");
});
