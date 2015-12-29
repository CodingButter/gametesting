define(['Class','Assets','Tile','Rectangle'],function(Class,Assets,Tile,Rectangle){
	var handler,x,y,width,height,tileMap,renderMap,drawMap,scaleX,scaleY;
	var MiniMap = Class.extend({
		init:function(_handler,_props){
			handler = _handler;
			renderMap = false;
			setProperties(_props);
		},
		click:function(_btn,_dir){
			if(_btn == "blue" && handler.getKeyManager().shift){
				var props = {width:width*1.5,height:height*1.5};
				setProperties(props);
			}
		},
		tick:function(){
			if(handler.getMouseManager().left){
				var pos = handler.getMouseManager().getMousePosition();
				var mouseBox = new Rectangle(pos.x,pos.y,2,2);
				var miniBox = new Rectangle(x,y,width,height);
				if(mouseBox.intersects(miniBox)){
					handler.canDrag = false;
					handler.getGameCamera().setxOffset((pos.x - x)/scaleX - handler.getWidth()/2);
					handler.getGameCamera().setyOffset((pos.y - y)/scaleY - handler.getHeight()/2);
				}else{
					handler.canDrag = true;
				}
			}
		},
		render:function(_g) {
			if (drawMap) {
				_g.fillStyle = "black";
				_g.fillRect(x - 10, y - 10, width + 20, height + 20);
				_g.drawImage(tileMap, x, y);
				ents = handler.getWorld().getEntityManager().getEntities();
				ents.forEach(function (e) {
					var ex = x + e.x * scaleX;
					var ey = y + e.y * scaleY;
					var ew = e.width * scaleX;
					var eh = e.height * scaleY;
					_g.fillStyle = "black";
					_g.fillRect(ex - 1, ey - 1, ew + 2, eh + 2);
					if (e.isStatic())
						_g.fillStyle = "green";
					else
						_g.fillStyle = "blue";
					_g.fillRect(ex, ey, ew, eh);
					_g.strokeRect(x + (handler.getGameCamera().getxOffset() * scaleX), y + (handler.getGameCamera().getyOffset() * scaleY), handler.getWidth() * scaleX, handler.getHeight() * scaleY);

				});
			}
		}
	});
	
	function setProperties(_props){
		var props = _props || {};
		x = props.x || 0;
		y = props.y || handler.getHeight() - handler.getHeight()/3;
		width = props.width || handler.getWidth()/3;
		height = props.height || handler.getHeight()/3;
		scaleX = width/(handler.getWorld().getWidth()*Tile.TILEWIDTH);
		scaleY = height/(handler.getWorld().getHeight()*Tile.TILEHEIGHT);
		drawMap = false;
		if(Assets.loaded == 100){
			tileMap = createTileMap();
			drawMap = true;
		}
	}
	
	function createTileMap(){
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		var g = canvas.getContext("2d");
		var w = handler.getWorld().getWidth();
		var h = handler.getWorld().getHeight();
		var tw = width/w;
		var th = height/h;
		for(var y=0;y<h;y++){
			for(var x=0;x<w;x++){
				handler.getWorld().getTile(x,y).render(g,x * tw,y * th ,tw,th);
			}
		}
		return canvas;
	}
	return MiniMap;
}); 		 	