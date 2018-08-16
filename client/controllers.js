"use strict";

var IP = "127.0.0.1";
var PORT = 80;

var server = "http://"+IP+":"+PORT;
var socket = io(server);
socket.emit("screen");

var Controllers = {
	controllers: [],
	eventsPressed: [],
	getNumber: function(){
		return this.controllers.filter(function(controller){
			return controller != null;
		}).length;
	},
	getById: function(id){
		for(let i = 0; i < this.controllers.length; ++i){
			if(this.controllers[i]){
				if(this.controllers[i].id == id)
					return this.getByNum(i);
			}
		}
		return null;
	},
	getByNum: function(num){
		let controller = {};
		Object.keys(this.controllers[num]).forEach(function(key){
			controller[key] = this.controllers[num][key];
		}.bind(this));
		controller.vibrate = function(pattern){
			if(typeof(pattern) == "number")
				pattern = [pattern];
			socket.emit("vibrate", {
				id: controller.id,
				pattern: [0, ...pattern]
			});
		}
		controller.exists = function(){
			return Boolean(this.getById(controller.id));
		}
		Object.keys(controller.joysticks).forEach(function(side){
			var joystick = controller.joysticks[side];
			var angle = joystick.angle%(2*Math.PI);
			while(angle < 0){
				angle += 2*Math.PI;
			}
			var directions = {
				up: false,
				down: false,
				left: false,
				right: false
			};
			if(joystick.distance > 0.5){
				var tol = Math.PI/8;
				if(angle < tol || angle > Math.PI*2-tol)
					directions.right = true;
				if(angle > Math.PI/2-tol && angle < Math.PI/2+tol)
					directions.up = true;
				if(angle > Math.PI-tol && angle < Math.PI+tol)
					directions.left = true;
				if(angle > Math.PI*3/2-tol && angle < Math.PI*3/2+tol)
					directions.down = true;
			}
			controller.joysticks[side].directions = directions;
		});
		return controller;
	},
	getList: function(){
		return this.controllers
		.filter(function(controller){
			return controller != null;
		}).map(function(controller){
			return this.getById(controller.id);
		}.bind(this));
	},
	onJoin: function(){},
	onQuit: function(){},
	onPressed: function(buttons, callback){
		buttons.split(" ").forEach(function(button){
			this.eventsPressed.push({
				button: button,
				callback: callback
			});
		}.bind(this));
	},
	getMain: function(){
		return this.getList()[0];
	}
};
["home", "square", "circle"].forEach(function(button){
	socket.on(button, function(id){
		Controllers.eventsPressed.forEach(function(event){
			if(event.button == button)
				event.callback(Controllers.getById(id));
		});
	});
});
socket.on("receiveControllers", function(controllers){
	var oldLength = Controllers.getNumber();
	Controllers.controllers = controllers;
	var newLength = Controllers.getNumber();
	var diff = newLength-oldLength;
	for(let i = 0; i < diff; ++i){
		Controllers.onJoin();
	}
	for(let i = 0; i > diff; --i){
		Controllers.onQuit();
	}
});