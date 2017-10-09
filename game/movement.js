'use strict';

var game = {
    level: null,
    movers: [],
    character: null,
    camera: {
        x: 0,
        targetX: 0,
        focus: function (newX){
            if(newX){
                this.targetX = Math.max(this.targetX, newX);
            }
            var deltaX = this.targetX - this.x;
            if(deltaX < 0){ return;}
            if(deltaX > 2){
                deltaX = bound(1, Math.ceil(deltaX/10), 4);
            }
            this.x += deltaX;
        },
        borderLeft: function (){
            return this.x;
        },
        borderRight: function (){
            return this.x + DISPLAY_WIDTH;
        }
    }
};
var tile = {
    graphic: 'tiles',
    activate: function (posX, posY){}
};
var layout = {
    width: 16,
    height: 12,
    tileTypes: {
        ' ': Object.extend(tile, {color: '#488', dense: false}),
        '-': Object.extend(tile, {graphicState: 'sidewalk1', color: '#9c4', dense: false}),
        '=': Object.extend(tile, {graphicState: 'sidewalk2', color: '#9c4', dense: true}),
        '#': Object.extend(tile, {color: '#060', dense: true}),
        '.': Object.extend(tile, {color: '#080', dense: false, slope: {left:0, right:1/2}}),
        '/': Object.extend(tile, {color: '#080', dense: false, slope: {left:1/2, right:1}}),
        ',': Object.extend(tile, {color: '#080', dense: false, slope: {left:1/2, right:0}}),
        '|': Object.extend(tile, {color: '#080', dense: false, slope: {left:1, right:1/2}}),
        '*': Object.extend(tile, {color: '#488', dense: false, locking: true, activate: function (posX, posY){
            game.level.lockCamera();
            var anItem = Object.instantiate(enemy);
            //anItem.faction = 0;
            anItem.x = posX * TILE_SIZE;
            anItem.y = posY * TILE_SIZE;
        }})
    },
    tileGrid:
        '                '+
        '                '+
        '                '+
        '                '+
        '                '+
        '                '+
        '                '+
        '                '+
        '                '+
        '----------------'+
        '================'+
        '################'
};
var level = {
    tileGrid: undefined,
    tileTypes: undefined,
    movers: undefined,
    _new: function (layout){
        if(!layout){ layout = {};}
        this.width = layout.width || 128;
        this.height = layout.height || Math.ceil(DISPLAY_HEIGHT/16);
        this.tileGrid = [];
        this.tileGrid.length = this.width*this.height;
        this.movers = [];
        for(var posY = 0; posY < this.height; posY++){
            for(var posX = 0; posX < this.width; posX++){
                var compoundIndex = posY*this.width + posX;
                var stringIndex = (this.height-(posY+1))*this.width + posX;
                var indexedCharacter = layout.tileGrid.charAt(stringIndex);
                var tileType = layout.tileTypes[indexedCharacter];
                this.tileGrid[compoundIndex] = tileType;
            }
        }
    },
    registerMover: function (theMover, faction){
        this.movers.push(theMover);
    },
    cancelMover: function (theMover){
        this.movers.splice(this.movers.indexOf(theMover), 1);
    },
    getTile: function (x, y){
        if(x < 0 || x >= this.width || y < 0 || y >= this.height){ return null;}
        var compoundIndex = y*this.width + x;
        return this.tileGrid[compoundIndex];
    },
    tileAt: function (x, y){
        // Used to find the tile at a mover's coordinates, which are measured
        // more finely (by "pixels").
        var tileX = Math.floor(x/TILE_SIZE);
        var tileY = Math.floor(y/TILE_SIZE);
        return this.getTile(tileX, tileY);
    },
    start: function (){
        //this.populate();
        setInterval(this.iterate.bind(this), 1000/30);
    },
    lockCamera: function (){
        this.cameraLock = true;
    },
    iterate: function (){
        var releaseCameraLock = true;
        var moversCopy = this.movers.slice();
        for(var I = 0; I < moversCopy.length; I++){
            var indexedMover = moversCopy[I];
            indexedMover.takeTurn();
            if(releaseCameraLock && !(indexedMover.faction&FACTION_PLAYER)){
                releaseCameraLock = false;
            }
        }
        if(releaseCameraLock){
            this.cameraLock = false;
        }
        // Advance Camera
        var oldBorderLeft = game.camera.borderLeft();
        var oldBorderRight = game.camera.borderRight();
        if(this.cameraLock){
            game.camera.focus();
        } else{
            var focusX = bound(0, game.character.x-DISPLAY_WIDTH/2, this.width*TILE_SIZE-DISPLAY_WIDTH);
            game.camera.focus(focusX);
        };
        // Activate & Deactivate revealed landscape
        var newBorderLeft = game.camera.borderLeft();
        var newBorderRight = game.camera.borderRight();
        if(newBorderRight > oldBorderRight){
            var oldTileRight = tileCoord(oldBorderRight)//+1;
            var newTileRight = tileCoord(newBorderRight)//+1; // Activate ahead of player view
            if(newTileRight > oldTileRight && newTileRight < this.width){
                for(var newTileY = 0; newTileY < this.height; newTileY++){
                    var compoundIndex = newTileY*this.width + newTileRight;
                    this.tileGrid[compoundIndex].activate(newTileRight, newTileY);
                }
            }
        }
        client.skin.draw();
        /*
        moversCopy = this.movers.slice();
        for(I = 0; I < moversCopy.length; I++){
            var m1 = moversCopy[I];
            if(this.movers.indexOf(m1) == -1){
                continue;
            }
            for(var checkI = I+1; checkI < moversCopy.length; checkI++){
                var m2 = moversCopy[checkI];
                if(this.movers.indexOf(m2) == -1){
                    continue;
                }
                // This is it! The magic expression! Oh boy oh boy oh boy!
                if(    Math.abs(m1.x+m1.width /2 - (m2.x+m2.width /2)) < (m1.width +m2.width )/2){
                    if(Math.abs(m1.y+m1.height/2 - (m2.y+m2.height/2)) < (m1.height+m2.height)/2){
                        m1.collide(m2);
                    }
                }
            }
        }*/
    }
};
var mover = {
    x: 0,
    y: 0,
    z: 0,
    velX: 0,
    velY: 0,
    width:  TILE_SIZE,
    height: TILE_SIZE,
    color: 'grey',
    gravity: 0,
    direction: RIGHT,
    _new: function (){
        game.level.registerMover(this, this.faction);
    },
    dispose: function (){
        game.level.cancelMover(this);
    },
    takeTurn: function (){
        if(this.gravity){
            this.velY = bound(this.velY-this.gravity, -(TILE_SIZE-1), (TILE_SIZE-1));
        }
    },
    collisionCheck: function (m2){
        if(    Math.abs(this.x+this.width /2 - (m2.x+m2.width /2)) < (this.width +m2.width )/2){
            if(Math.abs(this.y+this.height/2 - (m2.y+m2.height/2)) < (this.height+m2.height)/2){
                return true;
            }
        }
        return false;
    },
    containsPoint: function (x, y){
        if(this.x <= x && this.x+this.width >= x && this.y <= y && this.y+this.height >= y){
            return true;
        }
        return false;
    },
    land: function (){},
    translate: function(deltaX, deltaY){
        //var success = false;
        // Determine if movement will cause the object's edge to cross a border between turfs.
        var checkX = false;
        var checkY = false;
        var poleX;
        var poleY;
        if(!deltaX){ poleX = 0;}
        else if(deltaX > 0){ poleX = 1;}
        else{ poleX = -1;}
        if(!deltaY){ poleY = 0;}
        else if(deltaY > 0){ poleY = 1;}
        else{ poleY = -1;}
        var baseY = Math.floor((this.y)/TILE_SIZE)*TILE_SIZE;
        if(poleX == 1){
            if(((this.x+this.width)-1)%TILE_SIZE + deltaX >= TILE_SIZE){
                // -1 because the Nth position pixel is at index N-1.
                checkX = true;
                var limitX = TILE_SIZE - (((this.x+this.width)-1)%TILE_SIZE);
                this.x += limitX-1;
                deltaX -= limitX-1;
            }
        }
        else if(poleX == -1){
            if((this.x%TILE_SIZE) + deltaX < 0){
                checkX = true;
                this.x = this.x - (this.x%TILE_SIZE);
                deltaX = deltaX + this.x%TILE_SIZE;
            }
        }
        if(poleY == 1){
            if(((this.y+this.height)-1)%TILE_SIZE + deltaY >= TILE_SIZE){
                // -1 because the Nth position pixel is at index N-1.
                checkY = true;
                var limitY = TILE_SIZE - (((this.y+this.height)-1)%TILE_SIZE);
                this.y += limitY-1;
                deltaY -= limitY-1;
            }
        }
        else if(poleY == -1){
            if((this.y%TILE_SIZE) + deltaY < 0){
                checkY = true;
                this.y = this.y - (this.y%TILE_SIZE);
                deltaY = deltaY + this.y%TILE_SIZE;
            }
        }
        // Determine size of border crossed, in tiles
            // If the object is centered in a turf and is less than or equal to game.TILE_SIZE, this number will be 1
            // If the object is 3x game.TILE_SIZE, then this number could be as much as 4.
        var sideHeight = Math.ceil(((this.y%TILE_SIZE)+this.height)/TILE_SIZE);
        var centerX;
        var destination;
        var destination2;
        var I;
        if(checkX){
            centerX = this.x + this.width/2;
            var currentBase = game.level.tileAt(centerX, this.y);
            if(poleX == 1){
                for(I = 0; I < sideHeight; I++){
                    destination = game.level.tileAt(((this.x+this.width)-1)+deltaX, this.y+(I*TILE_SIZE));
                    if(currentBase.slope && I == 0){
                        // MAGIC NUMBERS!
                    } else if(!destination || destination.dense){
                        deltaX = 0;
                        //this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.EAST});
                        this.x += (TILE_SIZE - (((this.x+this.width)-1)%TILE_SIZE)) -1;
                        break;
                    }
                }
            }
            else if(poleX == -1){
                for(I = 0; I < sideHeight; I++){
                    destination = game.level.tileAt(this.x+deltaX, this.y+(I*TILE_SIZE));
                    if(currentBase.slope && I == 0){
                        // MAGIC NUMBERS!
                    } else if(!destination || destination.dense){
                        deltaX = 0;
                        //this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.WEST});
                        this.x = this.x - this.x%TILE_SIZE;
                        break;
                    }
                }
            }
        }
        this.x += deltaX;
        var baseWidth  = Math.ceil(((this.x%TILE_SIZE)+this.width )/TILE_SIZE);
        if(poleY == -1){
            destination = game.level.tileAt(this.x+this.width/2, this.y+deltaY);
            destination2 = game.level.tileAt(this.x+this.width/2, this.y);
            if(destination.slope){
                centerX = ((this.x + this.width/2)%TILE_SIZE)/TILE_SIZE;
                var left  = destination.slope.left ;
                var right = destination.slope.right;
                var baseElevation = (right-left)*centerX+left; // y = mx+b
                baseElevation *= TILE_SIZE;
                baseElevation += 1;
                baseElevation += Math.floor((this.y+deltaY)/TILE_SIZE)*TILE_SIZE;
                this.y = Math.max((this.y+deltaY), baseElevation);
                deltaY = 0;
                checkY = false;
                this.velY = 0;
                this.land();
            } else if(destination2.slope){
                centerX = ((this.x + this.width/2)%TILE_SIZE)/TILE_SIZE;
                var left  = destination2.slope.left ;
                var right = destination2.slope.right;
                var baseElevation = (right-left)*centerX+left; // y = mx+b
                baseElevation *= TILE_SIZE;
                baseElevation += 1;
                baseElevation += Math.floor((this.y)/TILE_SIZE)*TILE_SIZE;
                this.y = Math.max((this.y+deltaY), baseElevation);
                deltaY = 0;
                checkY = false;
                this.velY = 0;
                this.land();
            } else if(destination.dense){
                var destinationElevation = baseY + TILE_SIZE;
                if(Math.abs(destinationElevation - this.y) < TILE_SIZE/4){
                    // MAGIC NUMBERS!
                    this.y = destinationElevation;
                    deltaY = 0;
                    checkY = false;
                    this.velY = 0;
                    this.land();
                }
            }
        }
        if(checkY){
            if(poleY == 1){
                for(I = 0; I < baseWidth; I++){
                    destination = game.level.tileAt(this.x+(I*TILE_SIZE), ((this.y+this.height)-1)+deltaY);
                    if(!destination || destination.dense){
                        deltaY = 0;
                        //this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.SOUTH});
                        this.y += (TILE_SIZE - (((this.y+this.height)-1)%TILE_SIZE)) -1;
                        this.velY = 0;
                        this.land();
                        break;
                    }
                }
            }
            else if(poleY == -1){
                for(I = 0; I < baseWidth; I++){
                    destination = game.level.tileAt(this.x+(I*TILE_SIZE), this.y+deltaY);
                    if(!destination || destination.dense){
                        deltaY = 0;
                        this.velY = 0;
                        //this.handle_event(this, {type: DM.EVENT_STOP, direction: DM.NORTH});
                        this.y = this.y - this.y%TILE_SIZE;
                        this.land();
                        break;
                    }
                }
            }
        }
        this.y += deltaY;
        //if(deltaX || deltaY){
        //    this.update_public({"x":this.x, "y":this.y});
        //}
    }
};
var item = Object.extend(mover, {
    faction: FACTION_ENVIRONMENT,
    takeTurn: function (){
        if(this.collisionCheck(game.character)){
            this.collide(game.character);
        }
    },
    collide: function (collider){
        if(collider != game.character){ return;}
        this.effect(collider);
        this.dispose();
    },
    effect: function (){}
});
var foob = Object.extend(item, {
    color: 'yellow',
    effect: function (collider){
        game.character.color = pick('red', 'blue', 'magenta', 'orange', 'brown', 'black');
    },
    _new: function (){
        if(item._new){ item._new.apply(this, arguments);}
        this.name = 'foob'+randomInterval(1000,9999);
        return this;
    }
});