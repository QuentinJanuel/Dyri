"use strict";

const server = "http://localhost:80";
let socket = io(server);
socket.emit("screen");

let Controllers = {
	controllers: [],
	eventsPressed: [],
	getNumber(){
		return this.controllers.filter(controller => controller != null).length;
	},
	getById(id){
		for(let i = 0; i < this.controllers.length; ++i){
			if(this.controllers[i]){
				if(this.controllers[i].id == id)
					return this.getByNum(i);
			}
		}
		return null;
	},
	getByNum(num){
		let controller = {};
		Object.keys(this.controllers[num]).forEach(key => {
			controller[key] = this.controllers[num][key];
		});
		controller.vibrate = pattern => {
			if(typeof(pattern) == "number")
				pattern = [pattern];
			socket.emit("vibrate", {
				id: controller.id,
				pattern: [0, ...pattern]
			});
		}
		controller.exists = () => Boolean(this.getById(controller.id));
		return controller;
	},
	getList(){
		return this.controllers
		.filter(controller => controller != null)
		.map(controller => this.getById(controller.id));
	},
	onJoin(){},
	onQuit(){},
	onPressed(button, callback){
		this.eventsPressed.push({
			button: button,
			callback: callback
		});
	},
	getMain(){
		return this.getList()[0];
	}
};
["home", "square", "circle"].forEach(button => {
	socket.on(button, id => {
		Controllers.eventsPressed.forEach(event => {
			if(event.button == button)
				event.callback(Controllers.getById(id));
		});
	});
});
socket.on("receiveControllers", controllers => {
	const oldLength = Controllers.getNumber();
	Controllers.controllers = controllers;
	const newLength = Controllers.getNumber();
	const diff = newLength-oldLength;
	for(let i = 0; i < diff; ++i){
		Controllers.onJoin();
	}
	for(let i = 0; i > diff; --i){
		Controllers.onQuit();
	}
});