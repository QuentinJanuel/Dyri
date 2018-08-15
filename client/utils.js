if(!Array.prototype.forEach){
	Array.prototype.forEach = function(fun){
		for(var i = 0; i < this.length; ++i){
			if(fun.length == 0)
				fun();
			if(fun.length == 1)
				fun(this[i]);
			if(fun.length == 2)
				fun(this[i], i);
		}
	}
}
if(!Array.prototype.map){
	Array.prototype.map = function(fun){
		var newArray = [];
		for(var i = 0; i < this.length; ++i){
			newArray.push(fun(this[i]));
		}
		return newArray;
	}
}
if(!Array.prototype.filter){
	Array.prototype.filter = function(fun){
		var newArray = [];
		for(var i = 0; i < this.length; ++i){
			if(fun(this[i]))
				newArray.push(this[i]);
		}
		return newArray;
	}
}
