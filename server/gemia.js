"use strict";

//Imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require("fs");
const path = require("path");

//Constants declarations
const PORT = 80;
const FPS = 60;
const clientPath = path.join(__dirname, "..", "client");
const gamePath = path.join(__dirname, "..", "..", "games");
const Colors = [
	"#22c0cc",
	"#0fba00",
	"#d88900",
	"#d81eb3",
	"#bc0d2a"
];

//Fetch game folder
const getGames = () => fs.readdirSync(gamePath).filter(name => {
	let file = path.join(gamePath, name);
	return fs.lstatSync(file).isDirectory();
});

//Client side redirection
app.use("/", express.static(clientPath));
app.use("/games", express.static(gamePath));

// Prototypes
Array.prototype.chooseOne = function(){
  return this[Math.floor(Math.random()*this.length)];
}

//Colors
let colorsWeight = Colors.map(color => {
	return {color: color, weight: 0};
});
const getColor = () => {
	let minWeight = Math.min(...colorsWeight.map(colorWeight => colorWeight.weight));
	const choice = colorsWeight.filter(colorWeight => colorWeight.weight == minWeight).chooseOne();
	colorsWeight[colorsWeight.indexOf(choice)].weight++;
	return choice.color;
}
const removeColor = color => {
	for(let i = 0; i < colorsWeight.length; ++i){
		if(colorsWeight[i].color == color){
			colorsWeight[i].weight--;
			break;
		}
	}
}

//Screen and Controllers
let Screen = {
	socket: null,
	interval: null,
	exists: false
}
let Controllers = [];

/*
socket.emit("vibrate", [0, 50, 50, 50]);
*/

// Sockets
io.on("connection", socket => {
	socket.on("controller", () => {
		const isNew = !Controllers.map(controller => controller.socket.id).includes(socket.id);
		if(isNew){
			console.log("new controller spotted");
			const color = getColor();
			socket.emit("color", color.substring(1));
			const num = Controllers.length;
			Controllers[num] = {
				socket: socket,
				color: color,
				joystick: {
					left: {angle: 0, distance: 0},
					right: {angle: 0, distance: 0}
				},
				home: false,
			};
			socket.on("lJoy", data => {
				Controllers[num].joystick.left = data;
			});
			socket.on("rJoy", data => {
				Controllers[num].joystick.right = data;
			});
			socket.on("home", () => {
				Controllers[num].home = true;
			});
			socket.on("disconnect", () => {
				removeColor(color);
				Controllers.splice(num, 1);
			});
		}
	});
	socket.on("screen", () => {
		if(!Screen.exists){
			socket.emit("games", getGames());
			socket.on("disconnect", () => {
				clearInterval(Screen.interval);
				Screen.interval = null;
				Screen.socket = null;
				Screen.exists = false;
			});
			Screen.interval = setInterval(() => {
				socket.emit("receiveControllers", Controllers.map(controller => {
					let tinyController = {};
					Object.keys(controller).forEach(key => {
						if(key != "socket"){
							tinyController[key] = controller[key];
						}
					});
					return tinyController;
				}));
			}, 1000/FPS);
			socket.on("vibrate", data => {
				if(Controllers.length > data.num){
					Controllers[data.num].socket.emit("vibrate", data.pattern);
				}
			});
			Screen.exists = true;
			Screen.socket = socket;
		}
	});
});

server.listen(PORT, () => {
	console.log("GEMIA started on port \""+PORT+"\".");
});
