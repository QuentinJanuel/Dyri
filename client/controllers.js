"use strict";

const server = "http://localhost:80";
let socket = io(server);
socket.emit("screen");

let Controllers = [];
socket.on("receiveControllers", controllers => {
	Controllers = controllers;
});