"use strict";
var canvas = $("<canvas>")[0];
var canvasColor = $("<canvas>")[0];
var Screen = {
	canvas: canvas,
	ctx: canvas.getContext("2d"),
	canvasColor: canvasColor,
	ctxColor: canvasColor.getContext("2d"),
	needResize: false,
	images: {},
	dimensions: {
		width: 1920,
		height: 1080
	},
	fps: 60,
	loop: function(){},
	setOpacity: function(alpha){
		this.ctx.globalAlpha = alpha;
	},
	getOuterRect: function(){
		var ratio = {
			all: this.canvas.width/this.canvas.height,
			screen: this.dimensions.width/this.dimensions.height
		};
		var rect = {x1: 0, y1: 0, x2: 0, y2: 0};
		if(ratio.all > ratio.screen){
			rect.y2 = this.canvas.height;
			var w = this.canvas.height*ratio.screen;
			rect.x1 = (this.canvas.width-w)/2;
			rect.x2 = (this.canvas.width+w)/2;
		}else{
			rect.x2 = this.canvas.width;
			var h = this.canvas.width/ratio.screen;
			rect.y1 = (this.canvas.height-h)/2;
			rect.y2 = (this.canvas.height+h)/2;
		}
		return rect;
	},
	clearAll: function(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	autoresize: function(){
		$(this.canvas).attr({
			width: window.innerWidth,
			height: window.innerHeight
		});
		this.clearAll();
		this.needResize = false;
	},
	setColor: function(color){
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
	},
	getPoint: function(x, y){
		var rect = this.getOuterRect();
		var ratio = {
			w: (rect.x2-rect.x1)/this.dimensions.width,
			h: (rect.y2-rect.y1)/this.dimensions.height
		};
		return {
			x: rect.x1+x*ratio.w,
			y: rect.y1+y*ratio.h
		};
	},
	getScale: function(){
		var rect = this.getOuterRect();
		return (rect.x2-rect.x1)/this.dimensions.width;
	},
	Rect: function(x, y, width, height, action){
		if(x < 0){
			width = Math.max(x+width, 0);
			x = 0;
		}
		if(y < 0){
			height = Math.max(y+height, 0);
			y = 0;
		}
		var coords = this.getPoint(x, y);
		var scale = this.getScale();
		switch(action){
			case "draw":
				this.ctx.fillRect(coords.x, coords.y, width*scale, height*scale);		
				break;
			case "clear":
				this.ctx.clearRect(coords.x, coords.y, width*scale, height*scale);
				break;
		}
	},
	drawBlackBars: function(){
		var rect = this.getOuterRect();
		var backupColor = this.ctx.fillStyle;
		this.setColor("#000");
		if(rect.x1 == 0){
			this.ctx.fillRect(0, 0, this.canvas.width, rect.y1);
			this.ctx.fillRect(0, rect.y2, this.canvas.width, this.canvas.height);
		}else{
			this.ctx.fillRect(0, 0, rect.x1, this.canvas.height);
			this.ctx.fillRect(rect.x2, 0, this.canvas.width, this.canvas.height);
		}
		this.setColor(backupColor);
	},
	drawRect: function(x, y, width, height){
		this.Rect(x, y, width, height, "draw");
	},
	clearRect: function(x, y, width, height){
		this.Rect(x, y, width, height, "clear");
	},
	drawCircle: function(x, y, radius){
		var coords = this.getPoint(x, y);
		this.ctx.beginPath();
		this.ctx.arc(coords.x, coords.y, radius*this.getScale(), 0, 6.4);
		this.ctx.closePath();
		this.ctx.fill();
	},
	drawText: function(x, y, text, params){
		var coords = this.getPoint(x, y);
		var font = this.getScale()*(params.size || 30);
		font += "px ";
		font += params.font || "Arial";
		this.ctx.font = font;
		this.ctx.textAlign = params.align || "start";
		this.ctx.fillText(text, coords.x, coords.y);
	},
	drawLine: function(x1, y1, x2, y2){
		var coords1 = this.getPoint(x1, y1);
		var coords2 = this.getPoint(x2, y2);
		this.ctx.beginPath();
		this.ctx.moveTo(coords1.x, coords1.y);
		this.ctx.lineTo(coords2.x, coords2.y);
		this.ctx.closePath();
		this.ctx.stroke();
	},
	loadImages: function(images, onLoad){
		if(images == undefined)
			onLoad();
		if(images.length == 0)
			onLoad();
		images.forEach(function(image){
			var img = new Image;
			img.src = image.url;
			this.images[image.name] = {
				img: img,
				loaded: false
			};
			img.onload = function(){
				this.images[image.name].width = img.width;
				this.images[image.name].height = img.height;
				var origin = {x: 0, y: 0};
				if(image.origin != undefined){
					if(image.origin == "center"){
						origin = {
							x: img.width/2,
							y: img.height/2
						};
					}else if(image.origin.x != undefined && image.origin.y != undefined){
						origin = image.origin;
					}
				}
				this.images[image.name].origin = origin;
				this.images[image.name].loaded = true;
				var countLoaded = 0;
				images.forEach(function(image2){
					if(this.images[image2.name].loaded)
						countLoaded++;
				}.bind(this));
				if(countLoaded == images.length)
					onLoad();
			}.bind(this);
		}.bind(this));
	},
	drawImage: function(x, y, imageName, params){
		const img = this.images[imageName];
		if(!img){
			console.error("Trying to draw an unexisting image \""+imageName+"\"");
			return;
		}
		if(img.loaded){
			var scale = this.getScale();
			var xscale = 1, yscale = 1, angle = 0;
			var colorize = false;
			var color = "#FFF";
			var value = 0;
			if(!params)
				params = {};
			if(params.xscale != undefined)
				xscale = params.xscale;
			if(params.yscale != undefined)
				yscale = params.yscale;
			if(params.angle != undefined)
				angle = params.angle;
			if(params.colorize){
				if(params.colorize.color)
					color = params.colorize.color;
				if(params.colorize.value)
					value = params.colorize.value;
				colorize = true;
			}
			var coords = this.getPoint(x, y);
			this.ctx.save();
			this.ctx.translate(coords.x, coords.y);
			this.ctx.rotate(-angle);
			this.ctx.scale(xscale*scale, yscale*scale);
			if(colorize){
				this.canvasColor.width = img.img.width;
				this.canvasColor.height = img.img.height;
				this.ctxColor.clearRect(0, 0, img.img.width, img.img.height);
				this.ctxColor.fillStyle = color;
				this.ctxColor.fillRect(0, 0, img.img.width, img.img.height);
				this.ctxColor.globalCompositeOperation = "destination-atop";
				this.ctxColor.drawImage(img.img, 0, 0);
			}
			this.ctx.drawImage(img.img, -img.origin.x, -img.origin.y);
			if(colorize){
				var backupAlpha = this.ctx.globalAlpha;
				this.ctx.globalAlpha *= value;
				this.ctx.drawImage(this.canvasColor, -img.origin.x, -img.origin.y);
				this.ctx.globalAlpha = backupAlpha;
			}
			this.ctx.restore();
		}
	},
	setup: function(){
		$("body").append(this.canvas);
		this.autoresize();
		window.onresize = function(){
			this.needResize = true;
		}.bind(this);
		setInterval(function(){
			if(this.needResize)
				this.autoresize();
			this.loop();
			var backupAlpha = this.ctx.globalAlpha;
			this.ctx.globalAlpha = 1;
			this.drawBlackBars();
			this.ctx.globalAlpha = backupAlpha;
		}.bind(this), 1000/this.fps);
	}
};

