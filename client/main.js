"use strict";

Screen.setup();

const startGame = gameName => {
	const gamePath = "/games/"+gameName+"/";
	$.ajax({
		url: gamePath+"config.json",
		dataType: "json"
	}).done(json => {
		Screen.loadImages(
			json.images.map(image => {
				image.url = gamePath+image.url;
				return image;
			})
		, () => {
			Screen.dimensions = json.dimensions;
			Screen.needResize = true;
			document.body.appendChild($("<script>").attr({
				src: gamePath+"main.js",
				type: "module"
			})[0]);
		});
	});
}

socket.on("games", games => {
	startGame(games[1]);
});
