/**
 * Created by Jamie Nichols on 12/22/2015.
 */
define(['Class','Tile','Rectangle'],function(Class,Tile,Rectangle){
    //Private Variables
    var handler;
	var gatheringpath = 0;
    var Astar = Class.extend({
        init:function(_check_time,_handler,_size,_start,_goal,_maxpath){
            handler = _handler; 
            this.size = _size; //size of the nodes
            this.entity = _start; //reference to the parent entity
            this.check_time = _check_time; //The time in milliseconds between node checks 
            this.width = this.toNodes(handler.getWorld().getWidth() * Tile.TILEWIDTH); //number of nodes wide the world is
            this.height = this.toNodes(handler.getWorld().getHeight() * Tile.TILEHEIGHT); //number of nodes tall the world is
            this.closedList = new Array();  //Array of nodes that have been checked
            this.openedList = new Array();  //Array of nodes to check
            this.path = new Array(); //Array of waypoints (node positions in pixels) to get from goal to start node
            this.grid = new Array(); 
            this.maxpath = _maxpath; //The estimated longest path in nodes.
			this.start = this.goal = {}; //Starting and goal nodes
            this.pathfound = false; //Variable to let the render function know the path has been found
			this.findingpath = false;
        },
        //Rinse and repeat until goal node is found
        findPath:function(){
			if(!this.findingpath){
				this.findingpath = true;
				gatheringpath++;
			}
            this.pathfound = false;
            if(this.openedList.length>0){ //Make sure there are nodes in the opened list
                //Order the opened so nodes with the lowest fcost are first.
                this.openedList = this.openedList.sort(function (a, b) {
                    if (a.fcost < b.fcost)return -1;
                    else return 1;
                });
				//Keep only nodes that have the same fcost as the lowest fcost
                var opened = this.openedList;
                var lowests = this.openedList.filter(function (obj) {
                    return obj.fcost == opened[0].fcost;
                });

                //Order all the nodes remaining from lowest heuristic
                lowests = lowests.sort(function (a, b) {
                    if (a.heur < b.heur)return -1;
                    else return 1;
                });

                //Set the current node to the node with the lowest fcost and heuristic
                var current = lowests[0];
                //Remove the current node from the opened list and put it into the closed list
                this.openedList.splice(this.openedList.indexOf(current),1);
                this.closedList.push(current);

                //If the current node is not the goal node lets calculate the gcost and fcost for all the neighbors
                if(current.x != this.goal.x || current.y != this.goal.y){

                        //Loop through all of the neighbors around the current node
                        for (var i = current.x - 1; i <= current.x + 1; i++) {
                            for (var j = current.y - 1; j <= current.y + 1; j++) {
                                if(i >= 0 && i <= this.width && j >= 0 && j <= this.height) {
                                    if(!this.grid[i])this.grid[i] = [];
                                    //Set the local neighbor to the current neighbor we are checking
                                    if(!this.grid[i][j]) {
                                        var neighbor = {
                                            x: i, // Position on x in nodes
                                            y: j, // Position on y in nodes
                                            obs: this.isObs(i, j), //Boolean whether node is an obstacle or not
                                            parent: null, //Reference to the node which the character should come from to get to this node
                                            gcost: 0, //The distance traveled to get to that node from the start node
                                            fcost: 0 //The gcost + heuristic which will weigh the node for sorting when finding the path
                                        };
                                        this.grid[i][j] = neighbor;
                                    }else{
                                        neighbor = this.grid[i][j];
                                    }

                                    //getHeuristic requires a node object this is why it cannot be within the objects declaration
                                    neighbor.heur = getHeuristic(neighbor, this.goal, this.maxpath); // The distance to the goal node

                                    /*
                                     Make sure the neighbor is not the current node
                                     Make sure the neighbor is not an obstacle
                                     Make sure the neighbor is not in the closed list
                                     */

                                    if (neighbor != current && !neighbor.obs && this.closedList.indexOf(neighbor)==-1) {
                                        //Calculate the gcost of the current neighbor
                                        var gcost = getGCost(current, neighbor);
                                        //Check if the neighbor is already in the opened list
                                        if (this.openedList.indexOf(neighbor)!=-1) {
                                            /*
                                             If the neighbor is in the opened list calculate the new fcost
                                             and see if its less than the neighbors current fcost
                                             */
                                            if (neighbor.fcost > gcost + neighbor.heur) {
                                                //Since the fcost is less
                                                neighbor.parent = current; //Reset the parent to the current node
                                                neighbor.gcost = gcost; //Reset gcost
                                                neighbor.fcost = getFCost(neighbor); //Reset fcost
                                            }
                                        } else {//Since the neighbor is not in the opened list
                                            this.openedList.push(neighbor); //Add the neighbor node to the opened list
                                            neighbor.parent = current; //Set the parent of the neighbor node to the current node
                                            neighbor.gcost = gcost; //Set the gcost
                                            neighbor.fcost = getFCost(neighbor); //Set the fcost
                                        }// End "if in opened list"
                                    }// End "if not current obstacle closedlist"
                                }
                            }// End for j
                        }// End for i

                        //If the time before checks is greater than 0 milliseconds
                        if (this.check_time > 0) {
                            var t = this; //Set a temporary reference to this for use in the anonymous function
                            //Create a timeout for the amount of time passed in the constructor
                            setTimeout(function () {
                                t.findPath(); // Re-run the find path function at the set timing
                            }, this.check_time);
                        } else { //If time set is 0 then call the findPath function instantly
                            this.findPath();
                        }
                }else{ //else this node is the goal node
                    this.tracePath(current); //Run tracePath to find the path from goal to start
                }
            }else{
                //else there is no nodes in the opened list
                //there was no path found to the goal node so lets find the next closest node
                this.closedList.sort(function(a,b){ //order the closed list ascending by heuristic
                    if(a.heur < b.heur)return -1;
                    return 1;
                });
                this.tracePath(this.closedList[0]); //Pass the closest node to the goal node in as the node to trace from
            }
        }, //End the findPath function
        // tracePath will create the path from start node to the node passed into the function
        tracePath:function(node){
            //Reset all variables related to finding the path
            this.path = new Array();
            this.grid = new Array(); 
            this.pathfound = true; //Set pathfound to true (this variable is for the rendering function)
            var current = node; //Set the local current node to the node passed into the function
            while(current.x!=this.start.x || current.y!=this.start.y){ //While the current node is not the start node
                current.ispath = true; // Set ispath to true letting the renderer know this node is part of the path
                this.path.push({x:this.toPixels(current.x),y:this.toPixels(current.y)}); // Push the node position in pixels into the path array
                current = current.parent; // Reset the current node to the parent of the current node
				this.findingpath = false;
            } // End while loop
			gatheringpath--;
            this.entity.setPath(this.path.reverse()); //Set the enities path array equal to the revers of the path array created
            this.openedList = new Array(); //Array of nodes to check next;
            this.closedList = new Array(); //Array of nodes that have been checked.
        }, // End the tracePath function
        //Check if a node is overlapping an obstacle
        isObs:function(x,y){
            //Create a range of tiles that the node is overlapping
            var startX = Math.max(0,parseInt((this.toPixels(x)) / Tile.TILEWIDTH));
            var startY = Math.max(0,parseInt((this.toPixels(y)) / Tile.TILEHEIGHT));
            var endX =  Math.min(parseInt(handler.getWorld().getWidth()),parseInt((this.toPixels(x) + this.size) / Tile.TILEWIDTH));
            var endY =  Math.min(parseInt(handler.getWorld().getHeight()),parseInt((this.toPixels(y) + this.size) / Tile.TILEHEIGHT));

            //Loop through all of the tiles and check if any of them are solid tiles
            for(var i=startX; i <= endX; i++){
                for(var j=startY; j<=endY;j++){
                    if(handler.getWorld().getTile(i,j).isSolid())
                        return true; // If the any of the tiles are solid then return true
                }
            }

            //Check if node overlaps a static entity

            //Get a list of only static entities
            var entities = handler.getWorld().getEntityManager().getEntities();

            //Check if any of the static entities are intersecting the node
            for(var e=0;e<entities.length;e++){
                var ent = entities[e];
                if(ent != this.entity) {
                    if (ent.isStatic()) {
                        // Set local ent to the entity at the index of e
                        //Create two rectangles at the position and size of the node and entity
                        var entBox = new Rectangle(ent.x + ent.bounds.x, ent.y + ent.bounds.y, ent.bounds.width, ent.bounds.height);
                        var checkBox = new Rectangle(this.toPixels(x), this.toPixels(y), this.size, this.size);
                        //If the two rectangles intersect then return true
                        if (entBox.intersects(checkBox))return true;
                    }
                }
            }

            return false; //If the node doesn't overlap a solid tile or a static entity then return false
        }, // End isObs fucntion
        //Render Astar
        render: function (_g) {
            //If the path isn't found render the opened and closed list
            if (!this.pathfound) {
                // loop through the closedlist and render the nodes as red
                for (var i = 0; i < this.closedList.length; i++) {
                    var node = this.closedList[i];
                    _g.fillStyle = "red";
                    _g.fillRect(node.x * this.size - handler.getGameCamera().getxOffset(), node.y * this.size - handler.getGameCamera().getyOffset(), this.size, this.size);
                }
                // Loop through the opened list and render the nodes as grey
                for (var i = 0; i < this.openedList.length; i++) {
                    var node = this.openedList[i];
                    _g.fillStyle = "grey";
                    _g.fillRect(this.toPixels(node.x) - handler.getGameCamera().getxOffset(), this.toPixels(node.y) - handler.getGameCamera().getyOffset(), this.size, this.size);
                }
            }// End if paths found
            //Render a text box that displays how many nodes were checked to find the path
            _g.font = "italic 20px Calibri";
            _g.fillStyle = "black";
            _g.fillRect(20, 20, 120, 30);
            _g.fillStyle = "white";
            _g.fillText("checks:" + this.closedList.length, 25, 40)
        },//End render function
        //Convert node units to pixels
		toPixels:function(_v){
			return _v * this.size;
		},//End toPixels function
        //Convert pixel units to nodes
		toNodes:function(_v){
			return parseInt(_v / this.size);
		},//End toNodes function
        //Get the Size
        getSize:function(){
            return this.size;
        },//End getSize function
        //Update the starting node
        updateStart:function(_x,_y){
            var x = this.toNodes(_x);
            var y = this.toNodes(_y);
			this.start = {
				x:x, // Position on x in nodes
				y:y, // Position on y in nodes
				obs:this.isObs(x,y), //Boolean whether node is an obstacle or not
				parent:null, //Reference to the node which the character should come from to get to this node
				gcost:0, //The distance traveled to get to that node from the start node
				fcost:0 //The gcost + heuristic which will weigh the node for sorting when finding the path
			};
			this.openedList = new Array(this.start);

        },
        //Update the goal node
        updateGoal:function(_x,_y){
            var x = this.toNodes(_x);
            var y = this.toNodes(_y);
			var obs = this.isObs(x,y)
			if(!obs){
				this.goal = {
					x:x, // Position on x in nodes
					y:y, // Position on y in nodes
					obs:obs, //Boolean whether node is an obstacle or not
					parent:null, //Reference to the node which the character should come from to get to this node
					gcost:0, //The distance traveled to get to that node from the start node
					fcost:0 //The gcost + heuristic which will weigh the node for sorting when finding the path
				};
			}
        }
    });

    Astar.DEFAULT_SIZE = Tile.TILEWIDTH * 1.3; //Set the default node size
    Astar.LARGEST_PREDICTED_PATH = 100;
	Astar.getCurrentlyFinding = function(){
		return gatheringpath;
	}
    //Returns the distance (nodes) from the node to the gaol node
    function getHeuristic(node,goal,maxpath){
        if(maxpath == 0)
            return getDistance(node,goal);
        else
            return getDistance(node,goal) * (1+(10/maxpath));
    }

    //Returns the total distance traveled from start node to node2
    function getGCost(node1,node2){
        return node1.gcost + getDistance(node1,node2);
    }

    //Returns the fcost (gcost+heuristic)
    function getFCost(node){
        return node.gcost + node.heur;
    }

    //Returns the distance (nodes) between two nodes
    function getDistance(a,b){
        var distX = a.x - b.x;
        var distY = a.y - b.y;
        return Math.round(Math.sqrt(distX * distX + distY * distY)*10);
    }

    return Astar;
});
