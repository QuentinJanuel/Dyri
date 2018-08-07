//Imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require("fs");
const path = require("path");

//Constants declarations
const PORT = 80;

//Client side redirection
app.use("/", express.static(path.join(__dirname, "..", "client")));

//Sockets
io.on("connection", socket => {
	socket.on("connection", type => {
		switch(type){
			case "screen":
				//do something
				console.log("new screen");
				break;
			case "controller":
				console.log("new controller");
				break;
		}
	});
	socket.on("disconnect", () => {
		//remove a controller or screen (depends)
	});
});

server.listen(PORT, () => {
	console.log("Diry started on port \""+PORT+"\".");
});
