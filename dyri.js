const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const fs = require("fs");

const PORT = 3000;

io.on("connection", socket => {
	console.log("New client.");
	socket.on("msg", txt => {
		console.log(txt);
	});
	socket.on("disconnect", () => {
		console.log("Someone left.");
	});
});

server.listen(PORT, () => {
	console.log("Started on port \""+PORT+"\".");
});
