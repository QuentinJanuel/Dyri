const server = "http://localhost:80";

let socket = io(server);
socket.emit("connection", "screen");

let canvas = $("<canvas>");
let ctx = $(canvas)[0].getContext("2d");

const autosizeCanvas = () => {
	$(canvas).css({
    	position: "absolute",
    	width: "100%",
    	height: "100%"
	});
}

autosizeCanvas();
window.onresize = autosizeCanvas;

const fillCanvas = () => {
	ctx.fillStyle = "#FFF";
	ctx.fillRect(0, 0, $(canvas).width(), $(canvas).height());
}

fillCanvas();

$("body").append(canvas);
