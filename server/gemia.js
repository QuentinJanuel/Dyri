"use strict";

// Imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require("fs");
const path = require("path");

// Constants declarations
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

// Access Control Allow Origin
app.all("/", function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});
// Client side redirection
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

// Screen and controllers
let Screen = {
	socket: null,
	interval: null,
	exists: false
}
let Controllers = [];

// Sockets
io.on("connection", socket => {
	socket.on("controller", () => {
		const isNew = !Controllers
		.filter(controller => controller != null)
		.map(controller => controller.socket.id)
		.includes(socket.id);
		console.log(socket.id);
		if(isNew){
			const color = getColor();
			socket.emit("color", color.substring(1));
			const num = Controllers.length;
			Controllers[num] = {
				socket: socket,
				color: color,
				joysticks: {
					left: {angle: 0, distance: 0},
					right: {angle: 0, distance: 0}
				},
				getJoyData(data, side){
					data.angle *= -Math.PI/180;
					data.distance = Number(data.distance);
					this.joysticks[side] = data;
				},
				remove(){
					removeColor(this.color);
					Controllers[num] = null;
				}
			};
			let controller = Controllers[num];
			socket.on("lJoy", data => controller.getJoyData(data, "left"));
			socket.on("rJoy", data => controller.getJoyData(data, "right"));
			["home", "square", "circle"].forEach(button => {
				socket.on(button, () => {
					if(Screen.exists)
						Screen.socket.emit(button, socket.id);
				});
			});
			socket.emit("vibrate", [0, 500]);
			socket.on("disconnect", () => controller.remove());
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
					if(controller){
						return {
							color: controller.color,
							joysticks: controller.joysticks,
							id: controller.socket.id
						};
					}else{
						return null;
					}
				}));
			}, 1000/FPS);
			socket.on("vibrate", data => {
				Controllers.forEach(controller => {
					if(controller){
						if(controller.socket.id == data.id)
							controller.socket.emit("vibrate", data.pattern);
					}
				});
			});
			Screen.exists = true;
			Screen.socket = socket;
		}
	});
});

server.listen(PORT, () => {
	console.log("GEMIA started on port \""+PORT+"\".");
});

//server.close();
