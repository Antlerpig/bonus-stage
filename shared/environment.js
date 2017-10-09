'use strict';



/*==============================================================================
    Constants
==============================================================================*/

    // Misc. Configuration:
var debug = false;
var VERSION = 'Internal';
var MAP_WIDTH  = 6;
var MAP_HEIGHT = 8;
var TILE_SIZE = 16;
var DISPLAY_WIDTH = 16*TILE_SIZE;
var DISPLAY_HEIGHT = 9*TILE_SIZE;
var CLIENT_SPEED = 1000/30;
    // Directions:
var UP        = 1;
var DOWN      = 2;
var RIGHT     = 4;
var LEFT      = 8;
var UPRIGHT   = 5;
var UPLEFT    = 9;
var DOWNRIGHT = 6;
var DOWNLEFT  = 10;
var NORTH     = 1;
var SOUTH     = 2;
var EAST      = 4;
var WEST      = 8;
var NORTHEAST = 5;
var NORTHWEST = 9;
var SOUTHEAST = 6;
var SOUTHWEST = 10;
var KEY_UP    = 256;
    // Action Commands:
var PRIMARY     = 64;
var SECONDARY   = 65;
var TERTIARY    = 66;
var QUATERNARY = 67;
    // Factions:
var FACTION_PLAYER = 1<<0;
var FACTION_ENEMY  = 1<<1;
var FACTION_ENVIRONMENT = 1<<2;


/*==============================================================================
    Useful functions.
==============================================================================*/

/*=== Common tasks when dealing with arrays. =================================*/

var pick = function (){
    return arrayPick(arguments);
};
var arrayPick = function (sourceArray){
    // Returns a randomly chosen element from the source array.
    var randomIndex = Math.floor(Math.random()*sourceArray.length);
    var randomElement = sourceArray[randomIndex];
    if(!randomElement){
        console.log("Problem: "+randomIndex+'/'+sourceArray.length);
    }
    return randomElement;
};
var arrayRemove = function (sourceArray, element){
    // Removes element from sourceArray, if present. Returns undefined.
    var elementIndex = sourceArray.indexOf(element);
    if(elementIndex != -1){
        sourceArray.splice(elementIndex, 1);
    }
};

/*=== Math. ==================================================================*/

var sign = function (theNum){
    if(theNum === 0){ return 0;}
    else if(theNum > 0){ return 1;}
    else if(theNum < 0){ return -1;}
    else {return NaN;}
}
var bound = function (value, min, max){
    return Math.min(max, Math.max(min, value));
};
var randomInterval = function (min, max){
    // Returns a randomly select integer between min and max, inclusive.
    if(!min){ min = 0;}
    if(!max){ max = min; min = 0;}
    var range = max-min;
    return min + Math.floor(Math.random()*(range+1));
};
var gaussRandom = function (mean, standardDeviation){
    /**
     *  Generates random integers with a gaussian (normal) distribution about
     *      the specified mean, with the specified standard deviation.
     *  Returns an integer.
     **/
    var leg1;
    var leg2;
    do{
        leg1 = Math.random();
        leg2 = Math.random();
    } while(!(leg1 && leg2));
    var normal = Math.cos(2*Math.PI*leg2) * Math.sqrt(-(2*Math.log(leg1)));
    var gaussian = mean + normal*standardDeviation;
    return Math.round(gaussian);
};
var distance = function (startX, startY, endX, endY){
    var deltaX = Math.abs(endX-startX);
    var deltaY = Math.abs(endY-startY);
    return Math.max(deltaX, deltaY);
};
var trigDistance = function (startX, startY, endX, endY){
    var deltaX = endX - startX;
    var deltaY = endY - startY;
    return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
};
var directionFlip = function (direction){
    return ((direction << 1) & SOUTHWEST) | ((direction&SOUTHWEST) >> 1)
}
var getStepCoords = function (startX, startY, direction){
    if(direction & NORTH){ startY++;}
    if(direction & SOUTH){ startY--;}
    if(direction & EAST ){ startX++;}
    if(direction & WEST ){ startX--;}
    return {x: startX, y: startY};
};
var directionTo = function (startX, startY, endX, endY){
    var deltaX = endX-startX;
    var deltaY = endY-startY;
    if(!deltaX && !deltaY){
        return 0;
    }
    var direction = 0;
    var angle = Math.atan2(deltaY, deltaX); // Reversed, don't know why.
    angle /= Math.PI;
    angle /= 2; // Convert to Tau.
    angle += 1/16;
    if(angle < 0){
        angle += 1;
    } else if(angle > 1){
        angle -= 1;
    }
    if     (angle >=   0 && angle < 1/8){ direction = EAST     ;}
    else if(angle >= 1/8 && angle < 2/8){ direction = NORTHEAST;}
    else if(angle >= 2/8 && angle < 3/8){ direction = NORTH    ;}
    else if(angle >= 3/8 && angle < 4/8){ direction = NORTHWEST;}
    else if(angle >= 4/8 && angle < 5/8){ direction = WEST     ;}
    else if(angle >= 5/8 && angle < 6/8){ direction = SOUTHWEST;}
    else if(angle >= 6/8 && angle < 7/8){ direction = SOUTH    ;}
    else if(angle >= 7/8 && angle < 8/8){ direction = SOUTHEAST;}
    return direction;
};
var cardinalTo = function (startX, startY, endX, endY){
    var deltaX = endX-startX;
    var deltaY = endY-startY;
    if(!deltaX && !deltaY){
        return 0;
    }
    var direction = 0;
    var angle = Math.atan2(deltaY, deltaX); // Reversed, don't know why.
    angle /= Math.PI;
    angle /= 2; // Convert to Tau.
    //angle += 1/16;
    if(angle < 0){
        angle += 1;
    } else if(angle > 1){
        angle -= 1;
    }
    if     (angle >=   0 && angle < 1/8){ direction = EAST ;}
    else if(angle >= 1/8 && angle < 3/8){ direction = NORTH;}
    else if(angle >= 3/8 && angle < 5/8){ direction = WEST ;}
    else if(angle >= 5/8 && angle < 7/8){ direction = SOUTH;}
    else if(angle >= 7/8 && angle < 8/8){ direction = EAST ;}
    return direction;
};
var tileCoord = function (fullCoord){
    return Math.floor(fullCoord/TILE_SIZE);
};

//==== Easing functions ======================================================//

var easeInSin  = function (start, end, percentage){
    var difference = end-start;
    return start + Math.floor(difference * Math.sin(percentage*(Math.PI*2)/4));
};
var easeOutSin = function (start, end, percentage){
    var difference = end-start;
    return start + Math.floor(difference * (1-Math.cos(percentage*(Math.PI*2)/4)));
};

/*===========================================================================
    Default Object Extentions
  ===========================================================================*/

if(Object.instantiate){
    console.log('Cannot attach method "instantiate" to Object.');
} else{
    Object.instantiate = function (aPrototype){
        if(!aPrototype){ return null;}
        if(aPrototype._new){
            // Create arguments, minus prototype, to pass to _new.
            var cleanArguments = [];
            for(var argI = 1; argI < arguments.length; argI++){
                cleanArguments.push(arguments[argI]);
            }
            // Call _new, return new object.
            var newObject = Object.create(aPrototype);
            aPrototype._new.apply(
                newObject,
                cleanArguments
            );
            return newObject;
        }
        return Object.extend(aPrototype);
    };
}
if(Object.extend){
    console.log('Cannot attach method "extend" to Object.');
} else{
    Object.extend = function (aPrototype, extention){
        var valueConfiguration = {};
        for(var key in extention){
            if(!extention.hasOwnProperty(key)){ continue;}
            var keyValue = extention[key];
            if(keyValue && keyValue.value){
                valueConfiguration[key] = keyValue;
                continue;
            }
            valueConfiguration[key] = {
                value: extention[key],
                configurable: true,
                enumerable: true,
                writable: true
            }
        }
        return Object.create(aPrototype, valueConfiguration);
    };
};
