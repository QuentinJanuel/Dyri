"use strict";

let canvas = $("<canvas>")[0];
let Screen = {
	canvas: canvas,
	ctx: canvas.getContext("2d"),
	needResize: false,
	images: {},
	dimensions: {
		width: 1920,
		height: 1080
	},
	fps: 60,
	loop: () => {},
	getOuterRect(){
		const ratio = {
			all: this.canvas.width/this.canvas.height,
			screen: this.dimensions.width/this.dimensions.height
		};
		let rect = {x1: 0, y1: 0, x2: 0, y2: 0};
		if(ratio.all > ratio.screen){
			rect.y2 = this.canvas.height;
			const w = this.canvas.height*ratio.screen;
			rect.x1 = (this.canvas.width-w)/2;
			rect.x2 = (this.canvas.width+w)/2;
		}else{
			rect.x2 = this.canvas.width;
			const h = this.canvas.width/ratio.screen;
			rect.y1 = (this.canvas.height-h)/2;
			rect.y2 = (this.canvas.height+h)/2;
		}
		return rect;
	},
	clearAll(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	autoresize(){
		$(this.canvas).attr({
			width: window.innerWidth,
			height: window.innerHeight
		});
		this.clearAll();
		this.needResize = false;
	},
	setColor(color){
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
	},
	getPoint(x, y){
		const rect = this.getOuterRect();
		const ratio = {
			w: (rect.x2-rect.x1)/this.dimensions.width,
			h: (rect.y2-rect.y1)/this.dimensions.height
		};
		return {
			x: rect.x1+x*ratio.w,
			y: rect.y1+y*ratio.h
		};
	},
	getScale(){
		const rect = this.getOuterRect();
		return (rect.x2-rect.x1)/this.dimensions.width;
	},
	Rect(x, y, width, height, action){
		if(x < 0){
			width = Math.max(x+width, 0);
			x = 0;
		}
		if(y < 0){
			height = Math.max(y+height, 0);
			y = 0;
		}
		const coords = this.getPoint(x, y);
		const scale = this.getScale();
		const params = [
			coords.x,
			coords.y,
			width*scale,
			height*scale
		];
		switch(action){
			case "draw":
				this.ctx.fillRect(...params);		
				break;
			case "clear":
				this.ctx.clearRect(...params);
				break;
		}
	},
	drawBlackBars(){
		const rect = this.getOuterRect();
		const backupColor = this.ctx.fillStyle;
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
	drawRect(x, y, width, height){
		this.Rect(x, y, width, height, "draw");
	},
	clearRect(x, y, width, height){
		this.Rect(x, y, width, height, "clear");
	},
	drawCircle(x, y, radius){
		const coords = this.getPoint(x, y);
		this.ctx.beginPath();
		this.ctx.arc(coords.x, coords.y, radius*this.getScale(), 0, 6.4);
		this.ctx.closePath();
		this.ctx.fill();
	},
	drawText(x, y, text, params){
		const coords = this.getPoint(x, y);
		let font = this.getScale()*(params.size || 30);
		font += "px ";
		font += params.font || "Arial";
		this.ctx.font = font;
		this.ctx.textAlign = params.align || "start";
		this.ctx.fillText(text, coords.x, coords.y);
	},
	drawLine(x1, y1, x2, y2){
		const coords1 = this.getPoint(x1, y1);
		const coords2 = this.getPoint(x2, y2);
		this.ctx.beginPath();
		this.ctx.moveTo(coords1.x, coords1.y);
		this.ctx.lineTo(coords2.x, coords2.y);
		this.ctx.closePath();
		this.ctx.stroke();
	},
	loadImages(images, onLoad){
		images.forEach(image => {
			let img = new Image;
			img.src = image.url;
			this.images[image.name] = {
				img: img,
				loaded: false
			};
			img.onload = () => {
				this.images[image.name].width = img.width;
				this.images[image.name].height = img.height;
				let origin = {x: 0, y: 0};
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
				let countLoaded = 0;
				images.forEach(image2 => {
					if(this.images[image2.name].loaded)
						countLoaded++;
				});
				if(countLoaded == images.length)
					onLoad();
			}
		});
	},
	drawImage(x, y, imageName, params = {}){
		const img = this.images[imageName];
		if(!img){
			console.error("Trying to draw unexisting image \""+imageName+"\"");
			return;
		}
		if(img.loaded){
			const scale = this.getScale();
			let xscale = 1, yscale = 1, angle = 0;
			if(params.xscale != undefined)
				xscale = params.xscale;
			if(params.yscale != undefined)
				yscale = params.yscale;
			if(params.angle != undefined)
				angle = params.angle;
			const coords = this.getPoint(x, y);
			this.ctx.save();
			this.ctx.translate(coords.x, coords.y);
			this.ctx.rotate(-angle/2);
			this.ctx.scale(xscale*scale, yscale*scale);
			this.ctx.drawImage(img.img, -img.origin.x, -img.origin.y);
			this.ctx.restore();
		}
	},
	setup(){
		$("body").append(this.canvas);
		this.autoresize();
		window.onresize = () => {this.needResize = true;};
		setInterval(() => {
			if(this.needResize)
				this.autoresize();
			this.loop();
			this.drawBlackBars();
		}, 1000/this.fps);
	}
};
