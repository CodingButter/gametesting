/**
 * Created by Jamie Nichols on 12/27/2015.
 */
define(['Class'],function(Class){
    var friction = .77;
    var ease = 10;
    var gravity = 0;
    var elasticity = .89;
    var PhysicsResponse = Class.extend({
       init:function(_entity){
           this.entity = _entity;
           this.xMove = 0;
           this.yMove = 0;
           this.rot = 0;
           this.ease = ease;
           this.ga = gravity;
           this.r = Math.max(this.entity.width,this.entity.height)/2;
           this.m = this.r;
           this.friction = friction;
           this.physobj = true;
           this.colchecked = false;
           this.elast = elasticity;
       },
        newVelocity:function(colObj){
            moveBack(this.phsyics,colObj.physics);
            newVelocity(this.physics,colObj.physics);

        }
    });

    function getNewVelocity(colObj1,colObj2){
        var dx = colObj1.x-colObj2.x;
        var dy = colObj1.y-colObj2.y;
        var collisions_angle = Math.atan2(dy, dx);
        var magnitude_1 = Math.sqrt(Math.abs(colObj1.xMove*colObj1.xMove+colObj1.yMove*colObj1.yMove));
        var magnitude_2 = Math.sqrt(Math.abs(colObj2.xMove*colObj2.xMove+colObj2.yMove*colObj2.yMove));
        var direction_1 = Math.atan2(colObj1.yMove, colObj1.xMove);
        var direction_2 = Math.atan2(colObj2.yMove, colObj2.xMove);
        var new_xs_1 = magnitude_1*Math.cos(direction_1-collisions_angle);
        var new_ys_1 = magnitude_1*Math.sin(direction_1-collisions_angle);
        var new_xs_2 = magnitude_2*Math.cos(direction_2-collisions_angle);
        var new_ys_2 = magnitude_2*Math.sin(direction_2-collisions_angle);
        var final_xs_1 = ((colObj1.m-colObj2.m)*new_xs_1+(colObj2.m+colObj2.m)*new_xs_2)/(colObj1.m+colObj2.m);
        var final_xs_2 = ((colObj1.m+colObj1.m)*new_xs_1+(colObj2.m-colObj1.m)*new_xs_2)/(colObj1.m+colObj2.m);
        var final_ys_1 = new_ys_1;
        var final_ys_2 = new_ys_2;
        var colObj1.xMove = Math.cos(collisions_angle)*final_xs_1+Math.cos(collisions_angle+Math.PI/2)*final_ys_1;
        var colObj1.yMove = Math.sin(collisions_angle)*final_xs_1+Math.sin(collisions_angle+Math.PI/2)*final_ys_1;
        var colObj2.xMove = Math.cos(collisions_angle)*final_xs_2+Math.cos(collisions_angle+Math.PI/2)*final_ys_2;
        var colObj2.yMove = Math.sin(collisions_angle)*final_xs_2+Math.sin(collisions_angle+Math.PI/2)*final_ys_2;
    }

    function newMomentum(vel1,vel2,m1,m2) {
        //Takes one component of a vector1 and vector2 and the mes of both objects
        return (vel1 * (m1 - m2) + (2 * m2 * vel2)) / (m1 + m2);
    }
    function moveBack(B1,B2){
        var dx = B1.x-B2.x;
        var dy = B1.y-B2.y;
        var dist = Math.sqrt((dx*dx)+(dy*dy));
        var col_point = B1.r + B2.r;
        var past_point = col_point - dist;
        var col_ang = Math.atan2(dy,dx);
        B1.x += Math.cos(col_ang)*(past_point+.1);
        B1.y += Math.sin(col_ang)*(past_point+.1);
        dx = B1.x-B2.x;
        dy = B1.y-B2.y;
    }
    function getNormal(V1,V2){
        return {x:V2.x-V1.x,y:V2.y-V1.y};
    }
    function addV(V1,V2){
        return {x:V1.x+V2.x,y:V1.y+V2.y};
    }
    function DP(V1,V2){
        var dp = (V1.x*V2.x)+(V1.y*V2.y);
        var lenx = V1.x-V2.x;
        var leny = V1.y-V2.y;
        var length = Math.sqrt(lenx*lenx+leny*leny);
        return {x:dp/length,y:dp/length};
    }
    function unitfy(V){
        var length = Math.sqrt((V.x*V.x)+(V.y*V.y));
        return {x:V.x/length,y:V.y/length};
    }

    return PhysicsResponse;
});