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
const clientPath = path.join(__dirname, "..", "client");
const gamePath = path.join(__dirname, "..", "..", "games");

//Client side redirection

app.use("/", express.static(clientPath));
app.use("/games", express.static(gamePath));

//Sockets
io.on("connection", socket => {
	socket.on("connection", type => {
		switch(type){
			case "screen":
				//do something
				//console.log("new screen");
				break;
			case "controller":
				//console.log("new controller");
				break;
		}
	});
	socket.on("disconnect", () => {
		//remove a controller or screen (depends)
	});
});

server.listen(PORT, () => {
	console.log("GEMIA started on port \""+PORT+"\".");
});
