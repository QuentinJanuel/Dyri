"use strict";

Screen.setup();

const startGame = function(gameName){
	var gamePath = "/games/"+gameName+"/";
	$.ajax({
		url: gamePath+"config.json",
		dataType: "json"
	}).done(function(json){
		var newCSS = "";
		if(!json.fonts)
			json.fonts = [];
		json.fonts.forEach(function(font){
			newCSS += "@font-face{font-family: \""+font.name+"\"; src: url(\""+gamePath+font.url+"\");}";
		});
		$("#css").text($("#css").text()+newCSS);
		if(!json.images)
			json.images = [];
		Screen.loadImages(
			json.images.map(function(image){
				image.url = gamePath+image.url;
				return image;
			})
		, function(){
			Screen.dimensions = json.dimensions;
			Screen.needResize = true;
			if(!json.sounds)
				json.sounds = [];
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
