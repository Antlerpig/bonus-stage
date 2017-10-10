'use strict';






// Dependant on client.js
(function (){
//== OPEN NAMESPACE ==========================================================//
var resourcePath = 'rsc'
var resource = {};
var graphicResource = Object.extend(resource, {
    url: null,
    width: undefined,
    height: undefined,
    effect: function (which, image, offsetX, offsetY, width, height){
        var drawEffect = this.effects[which];
        if(!drawEffect){ return image;}
        return drawEffect.call(this, image, offsetX, offsetY, width, height);
    },
    effects: {
        draw: function (image, offsetX, offsetY, width, height){
            client.skin.scrapBoard.drawImage(
                image,
                offsetX, offsetY, width, height,
                0, 0, width, height
            );
            return client.skin.scrapBoard;
        },
        flash: function (image, offsetX, offsetY, width, height){
            var scrapBoard = client.skin.scrapBoard;
            switch(Math.floor(Math.random()*4)){
                case 0: {scrapBoard.fillStyle = "rgb(255,   0,   0)"; break;}
                case 1: {scrapBoard.fillStyle = "rgb(  0,   0,   0)"; break;}
                case 2: {scrapBoard.fillStyle = "rgb(  0,   0, 255)"; break;}
                case 3: {scrapBoard.fillStyle = "rgb(255, 255, 255)"; break;}
            }
            scrapBoard.save();
            scrapBoard.globalCompositeOperation = "copy";
            scrapBoard.fillRect(0, 0, scrapBoard.canvas.width, scrapBoard.canvas.height);
            scrapBoard.globalCompositeOperation = "destination-in";
            scrapBoard.drawImage(
                image,
                offsetX, offsetY, width, height,
                0, 0, width, height
            );
            scrapBoard.restore();
            return scrapBoard.canvas;
        }
    }
});
var graphic = (function (){
    var drawFunction = function (x, y, options){
        if(!options){ options = {};}
        var direction = options.direction || SOUTH;
        var cameraX = options.cameraX || 0;
        var offsetX = this.offsetX || 0;
        var offsetY = this.offsetY || 0;
        var width  = this.width  || this.image.width;
        var height = this.height || this.image.height;
        var adjustX = Math.round(x);
        var adjustY = Math.round((DISPLAY_HEIGHT)-(y+height));
        if(this.nudgeX){ adjustX += this.nudgeX;}
        if(this.nudgeY){ adjustY -= this.nudgeY;}
        if(options.center){
            adjustX -= Math.floor(width/2);
            adjustY += Math.floor(height/2);
        }
        if(cameraX){
            adjustX -= cameraX;
        }
        if(this.frames){
            var frame = 0;
            if(options.frame !== undefined){
                frame = Math.min(options.frame, this.frames-1);
            } else if(options.time){
                var delay = this.frameDelay || ANIMATION_FRAME_DELAY;
                frame = (Math.floor(options.time/delay) % this.frames);
            }
            offsetY += height*frame;
        }
        //
        if(this.directions === 4){
            switch(direction){
                case SOUTH: break;
                case NORTH: offsetX += width; break;
                case SOUTHEAST:
                case NORTHEAST:
                case EAST : offsetX += width*2; break;
                case SOUTHWEST:
                case NORTHWEST:
                case WEST : offsetX += width*3; break;
            }
        } else if(this.directions === 8){
            switch(direction){
                case SOUTH: break;
                case NORTH: offsetX += width; break;
                case EAST : offsetX += width*2; break;
                case WEST : offsetX += width*3; break;
                case SOUTHEAST: offsetX += width*4; break;
                case SOUTHWEST: offsetX += width*5; break;
                case NORTHEAST: offsetX += width*6; break;
                case NORTHWEST: offsetX += width*7; break;
            }
        }
        //
        var drawImage = client.resourceLibrary.images[this.url];
        if(options.effects){
            for(var effectIndex = 0; effectIndex < options.effects.length; effectIndex++){
                var indexedEffect = options.effects[effectIndex];
                drawImage = this.effect(indexedEffect, drawImage, offsetX, offsetY, width, height);
                offsetX = 0;
                offsetY = 0;
            }
        }
        client.skin.context.drawImage(
            drawImage,
            offsetX, offsetY, width, height,
            adjustX, adjustY, width, height
        );
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };
    return function (url, width, height, offsetX, offsetY, options){
        if(!options){ options = {};}
        options.draw = drawFunction;
        if(url    ){ options.url     = url    ;}
        if(width  ){ options.width   = width  ;}
        if(height ){ options.height  = height ;}
        if(offsetX){ options.offsetX = offsetX;}
        if(offsetY){ options.offsetY = offsetY;}
        return Object.extend(graphicResource, options);
    };
})();
var spriteSheet = (function (){
    var drawFunction = function (x, y, options){
        if(!options){ options = {};}
        var state = options.state || 'default';
        var graphicState = this.states[state];
        if(!graphicState){ graphicState = this.states['default'];}
        if(!graphicState){ return false;}
        return graphicState.draw(x, y, options);
    };
    return function (url, mapping, options){
        if(!options){ options = {};}
        if(!mapping){ mapping = {};}
        var width  = options.width  || TILE_SIZE;
        var height = options.height || TILE_SIZE;
        var sheet = Object.extend(graphicResource, {
            url: url,
            anchorX: options.anchorX || 0,
            anchorY: options.anchorY || 0,
            draw: drawFunction
        });
        if(options.directions){ sheet.directions = options.directions;}
        if(options.frames){ sheet.frames = options.frames;}
        if(options.frameDelay){ sheet.frameDelay = options.frameDelay;}
        sheet.states = {};
        if(!mapping['default']){
            mapping['default'] = {}
        }
        for(var key in mapping){
            if(!mapping.hasOwnProperty(key)){
                continue;
            }
            var stateMap = mapping[key];
            var fullOffsetX = (stateMap.offsetX || 0) + sheet.anchorX;
            var fullOffsetY = (stateMap.offsetY || 0) + sheet.anchorY;
            var state = graphic(
                url,
                (stateMap.width  || width),
                (stateMap.height || height),
                fullOffsetX,
                fullOffsetY,
                stateMap
            );
            state.directions = stateMap.directions || sheet.directions;
            state.frames = stateMap.frames || sheet.frames;
            state.frameDelay = stateMap.frameDelay || sheet.frameDelay;
            sheet.states[key] = state;
        }
        return sheet;
    }
})();
var event = (function (){
    var eventResource = {
        finished: false,
        timeLimit: null,
        width: 0,
        height: 0,
        setup: function (){},
        iterate: function (){
            this.time++;
            if(this.timeLimit && this.time >= this.timeLimit){
                this.finish();
            }
            return this.finished;
        },
        _new: function (options){
            this.time = -1; // Iterate is called before draw,
            // Time when drawing first frame should be 0.
            this.options = options;
            this.setup();
            return this;
        },
        draw: function (){},
        finish: function (){
            this.finished = true;
        },
        // Helpful functions:
        center: function (movableId, offsetDirection){
            var centerMover = client.gameplay.memory.getContainable(movableId);
            if(!centerMover){ return null;}
            var centerX = centerMover.x+(centerMover.width -this.width )/2;
            var centerY = centerMover.y+(centerMover.height-this.height)/2;
            if(offsetDirection){
                switch(offsetDirection){
                    case NORTH: centerY = centerMover.y+centerMover.height; break;
                    case SOUTH: centerY = centerMover.y-       this.height; break;
                    case EAST : centerX = centerMover.x+centerMover.width ; break;
                    case WEST : centerX = centerMover.x-       this.width ; break;
                }
            }
            return {x: centerX, y: centerY};
        }
    };
    return function (options){
        var newEvent = Object.extend(eventResource, options);
        return newEvent;
    };
})();
client.resource = function (category, identifier){
	return this.resourceLibrary.resource(category, identifier);
}
client.resourceLibrary = {
	resourceLoadReady: false,
	resourceLoadingIds: [],
	resource: function (category, identifier, fragment){
		if(this.library[category]){
            var resource = this.library[category][identifier];
            if(fragment && fragment.states){
                resource = fragment.states[resource];
            }
            return resource;
		}
        return null;
	},
    /*
        Animations
            Variable Number of Frames
            Variable Frame Rate
            Looping or One Time
    */
	images: {},
	library: {
		graphic: {
            title: graphic('img/title.png', 256, 144),
            controller: spriteSheet('img/buttons.png', {
                'left': {},
                'leftDown': {offsetY: 32},
                'right': {offsetX: 32},
                'rightDown': {offsetX: 32, offsetY: 32},
                'up': {offsetX: 64},
                'upDown': {offsetX: 64, offsetY: 32},
                'primary': {offsetX: 128},
                'primaryDown': {offsetX: 128, offsetY: 32},
                'start': {offsetY: 64, width: 64},
                'startDown': {offsetY: 96, width: 64},
            }, {width: 32, height: 32}),
            statue: graphic('img/statue.png', 32, 52, 0, 0, {nudgeX: -9}),
            base: graphic('img/base.png', 32, 48, 0, 0),
            test: spriteSheet('img/test.png', {
                "walk1": {},
                "walk2": {offsetX: 16},
                "walk3": {offsetX: 32},
                "punch1": {offsetX: 48, width: 32},
                "punch2": {offsetX: 80, width: 32},
                "punch3": {offsetX: 160, width: 32},
                "punch4": {offsetX: 192, width: 32},
                "jump": {offsetX: 224, width: 24},
                "jumpKick": {offsetX: 252, width: 36},
                "kneel": {offsetX: 288},
                "down": {offsetX: 304, width: 32, nudgeX: -8},
                "trip": {offsetX: 336, width: 32, nudgeX: -8},
                "hurt1": {offsetX: 368},
                "hurt2": {offsetX: 384},
                "hurt3": {offsetX: 400, width: 32},
            }, {width: 16, height: 48}),
            testLeft: spriteSheet('img/test.png', {
                "walk1": {},
                "walk2": {offsetX: 16},
                "walk3": {offsetX: 32},
                "punch1": {offsetX: 48, width: 32, nudgeX: -16},
                "punch2": {offsetX: 80, width: 32, nudgeX: -16},
                "punch3": {offsetX: 160, width: 32, nudgeX: -16},
                "punch4": {offsetX: 192, width: 32, nudgeX: -16},
                "jump": {offsetX: 224, width: 32, nudgeX: -16},
                "jumpKick": {offsetX: 124, width: 36, nudgeX: -16},
                "kneel": {offsetX: 288},
                "down": {offsetX: 304, width: 32, nudgeX: -8},
                "trip": {offsetX: 336, width: 32, nudgeX: -8},
                "hurt1": {offsetX: 368},
                "hurt2": {offsetX: 384},
                "hurt3": {offsetX: 400, width: 32, nudgeX: -16},
            }, {width: 16, height: 48, anchorY: 48}),
            tiles: spriteSheet('img/sprites.png', {
                "sidewalk1": {},
                "sidewalk2": {offsetY: 16}
            }),
            bits: spriteSheet('img/bits.png', {
                "1_1": {offsetX: 0, offsetY: 0}, "1_2": {offsetX: 8, offsetY: 0},
                "1_3": {offsetX: 0, offsetY: 8}, "1_4": {offsetX: 8, offsetY: 8},
                "1_5": {offsetX: 0, offsetY:16}, "1_6": {offsetX: 8, offsetY:16},
                "1_7": {offsetX: 0, offsetY:24}, "1_8": {offsetX: 8, offsetY:24},
                "2_1": {offsetX:16, offsetY: 0}, "2_2": {offsetX:24, offsetY: 0},
                "2_3": {offsetX:16, offsetY: 8}, "2_4": {offsetX:24, offsetY: 8},
                "2_5": {offsetX:16, offsetY:16}, "2_6": {offsetX:24, offsetY:16},
                "2_7": {offsetX:16, offsetY:24}, "2_8": {offsetX:24, offsetY:24}
            }, {width: 8, height: 8})
		},
		event: {
            'empty': event({}),
            'animate': event({
                setup: function (){
                    var options = this.options;
                    var graphicResource = client.resourceLibrary.resource('graphic', options.graphic);
                    if(graphicResource && options.graphicState){
                        graphicResource = graphicResource.states[options.graphicState];
                    }
                    if(!graphicResource){
                        this.finish();
                        return;
                    }
                    this.frames = graphicResource.frames || 1;
                    this.frameDelay = graphicResource.frameDelay || ANIMATION_FRAME_DELAY;
                    var repeat = options.repeat || 1;
                    this.width = graphicResource.width;
                    this.height = graphicResource.height;
                    this.timeLimit = options.timeLimit || this.frames * this.frameDelay * repeat;
                },
                draw: function (){
                    var fullX;
                    var fullY;
                    if(this.options.attachId){
                        var center = this.center(this.options.attachId, this.options.offsetDirection);
                        if(!center){ this.finish(); return;}
                        fullX = center.x;
                        fullY = center.y;
                    } else{
                        fullX = this.options.x;
                        fullY = this.options.y;
                    }
                    var drawOptions = {
                        frame: Math.floor(this.time/this.frameDelay)%this.frames,
                        center: this.options.center
                    };
                    if(this.options.offsetDirection){
                        drawOptions.direction = this.options.offsetDirection;
                    }
                    client.skin.drawGraphic(
                        this.options.graphic, this.options.graphicState,
                        fullX, fullY,
                        drawOptions
                    );
                }
            }),
            'flick': event({
                setup: function (){
                    var options = this.options;
                    var owner = client.gameplay.memory.getContainable(options.attachId);
                    if(!owner){
                        this.finish();
                        return;
                    }
                    owner.flickState = options.graphicState;
                    owner.flickTime = 0;
                    this.finish();
                },
            }),
            'test': event({
                setup: function (){
                    var options = this.options;
                    this.time = 16;
                    this.x = options.x;
                    this.y = options.y;
                },
                iterate: function (){
                    this.time--;
                    if(this.time <= 0){
                        this.finish();
                    }
                },
                draw: function (){
                    var fullX = this.x;
                    var fullY = this.y;
                    client.skin.drawCircle(fullX, fullY, this.time);
                }
            }),
            'smokey': event({
                setup: function (){
                    var options = this.options;
                    this.time = 16;
                    this.attachId = options.attachId;
                },
                iterate: function (){
                    this.time--;
                    if(this.time <= 0){
                        this.time = 16;
                    }
                },
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(this.attachId);
                    if(!attachment){
                        this.finish();
                        return;
                    }
                    var fullX = attachment.x + Math.floor(attachment.width /2);
                    var fullY = attachment.y + Math.floor(attachment.height/2);
                    client.skin.drawCircle(fullX, fullY, this.time);
                }
            }),
            healAOE: event({
                timeLimit: 10,
                setup: function (){
                    var options = this.options;
                    this.radius = this.options.radius;
                    this.attachId = options.attachId;
                },
                draw: function (){
                    if(this.finished){ console.log('problem');}
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(this.attachId);
                    if(!attachment){
                        this.finish();
                        return;
                    }
                    var fullX = attachment.x + Math.floor(attachment.width /2);
                    var fullY = attachment.y + Math.floor(attachment.height/2);
                    //
                    var radius = Math.floor(this.radius * Math.sin((this.time/this.timeLimit)*(Math.PI*2)/4));
                    //
                    client.skin.drawCircle(fullX, fullY, this.radius, null, null, 'rgba(0,0,0,0.125)');
                    client.skin.drawCircle(fullX, fullY,      radius, null, null, 'rgba(0,255,0,0.25)');
                }
            }),
            repelAOE: event({
                timeLimit: 10,
                setup: function (){
                    var options = this.options;
                    this.radius = this.options.radius;
                    this.attachId = options.attachId;
                },
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(this.attachId);
                    if(!attachment){ this.finish(); return;}
                    var fullX = attachment.x + Math.floor(attachment.width /2);
                    var fullY = attachment.y + Math.floor(attachment.height/2);
                    var radius = Math.floor(this.radius * Math.sin((this.time/this.timeLimit)*(Math.PI*2)/4));
                    client.skin.drawCircle(fullX, fullY, this.radius, null, null, 'rgba(0,0,0,0.125)');
                    client.skin.drawCircle(fullX, fullY,      radius, null, null, 'rgba(255,255,0,0.25)');
                }
            }),
            reviveAOE: event({
                timeLimit: 10,
                setup: function (){
                    var options = this.options;
                    this.radius = this.options.radius;
                    this.attachId = options.attachId;
                },
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(this.attachId);
                    if(!attachment){ this.finish(); return;}
                    var fullX = attachment.x + Math.floor(attachment.width /2);
                    var fullY = attachment.y + Math.floor(attachment.height/2);
                    var radius = Math.floor(this.radius * Math.sin((this.time/this.timeLimit)*(Math.PI*2)/4));
                    client.skin.drawCircle(fullX, fullY, this.radius, null, null, 'rgba(0,0,0,0.125)');
                    client.skin.drawCircle(fullX, fullY,      radius, null, null, 'rgba(255,255,255,0.25)');
                }
            }),
            smallExplosion: event({
                timeLimit: 10,
                setup: function (){
                    var options = this.options;
                    this.radius = this.options.radius;
                    this.attachId = options.attachId;
                },
                draw: function (){
                    var options = this.options;
                    var fullX = options.x;
                    var fullY = options.y;
                    var radius = Math.floor(this.radius * Math.sin(((this.time)/this.timeLimit)*(Math.PI*2)/4));
                    var P = Math.max(0, (this.time-4)/(this.timeLimit-5));
                    var innerRadius = Math.floor(this.radius * Math.sin(P*(Math.PI*2)/4));
                    client.skin.drawCircle(fullX, fullY,      radius, innerRadius, null, 'rgba(255,0,0,0.25)');
                }
            }),
            largeExplosion: event({
                timeLimit: 10,
                setup: function (){
                    var options = this.options;
                    this.radius = this.options.radius;
                    this.attachId = options.attachId;
                },
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(this.attachId);
                    if(!attachment){ this.finish(); return;}
                    var fullX = attachment.x + Math.floor(attachment.width /2);
                    var fullY = attachment.y + Math.floor(attachment.height/2);
                    var radius = Math.floor(this.radius * Math.sin(((this.time)/this.timeLimit)*(Math.PI*2)/4));
                    var P = Math.max(0, (this.time-4)/(this.timeLimit-5));
                    var innerRadius = Math.floor(this.radius * Math.sin(P*(Math.PI*2)/4));
                    //client.skin.drawCircle(fullX, fullY, this.radius, innerRadius, null, 'rgba(0,0,0,0.125)');
                    client.skin.drawCircle(fullX, fullY,      radius, innerRadius, null, 'rgba(255,0,0,0.25)');
                }
            }),
            wind: event({
                timeLimit: 10,
                draw: function (){
                    var options = this.options;
                    var fullX = options.x;
                    var fullY = options.y;
                    var radius = Math.floor(options.radius * Math.sin(((this.time)/this.timeLimit)*(Math.PI*2)/4));
                    var P = Math.max(0, (this.time-4)/(this.timeLimit-5));
                    client.skin.drawCircle(fullX, fullY, radius, null, null, 'rgba(255,255,255,'+(1-P)/2+')');
                }
            }),
            shields: event({
                timeLimit: 16,
                width: 8,
                height: 8,
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(options.attachId);
                    if(!attachment){ this.finish(); return;}
                    var center = this.center(options.attachId);
                    if(!center){ this.finish(); return;}
                    var fullX = center.x;
                    var fullY = center.y;
                    var P = this.time/this.timeLimit;
                    var radius = TILE_SIZE * (1-P);
                    var angle = P*(Math.PI*1.3);
                    client.skin.drawGraphic(
                        'items', 'shield',
                        fullX+Math.cos(angle)*radius, fullY+Math.sin(angle)*radius
                    ); angle += Math.PI*2/3;
                    client.skin.drawGraphic(
                        'items', 'shield',
                        fullX+Math.cos(angle)*radius, fullY+Math.sin(angle)*radius
                    ); angle += Math.PI*2/3;
                    client.skin.drawGraphic(
                        'items', 'shield',
                        fullX+Math.cos(angle)*radius, fullY+Math.sin(angle)*radius
                    );
                }
            }),
            shieldsAOE: event({
                timeLimit: 16,
                width: 8,
                height: 8,
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(options.attachId);
                    if(!attachment){ this.finish(); return;}
                    var center = this.center(options.attachId);
                    if(!center){ this.finish(); return;}
                    var fullX = center.x;
                    var fullY = center.y;
                    var P = this.time/this.timeLimit;
                    var radius = options.radius * (P);
                    var angle = P*(Math.PI*0.75);
                    var shieldNumber = 7;
                    for(var shieldIndex = 0; shieldIndex < shieldNumber; shieldIndex++){
                        client.skin.drawGraphic(
                            'items', 'shield',
                            fullX+Math.cos(angle)*radius, fullY+Math.sin(angle)*radius
                        );
                        angle += Math.PI*2/shieldNumber;
                    }
                }
            }),
            pirateTalk: event({
                timeLimit: 16,
                width: 16,
                height: 16,
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(options.attachId);
                    if(!attachment){ this.finish(); return;}
                    var center = this.center(options.attachId);
                    if(!center){ this.finish(); return;}
                    var fullX = center.x;
                    var fullY = center.y+attachment.height;
                    client.skin.drawGraphic(
                        'projectiles', 'pirateTalk',
                        fullX, fullY
                    );
                }
            }),
            lance: event({
                timeLimit: 6,
                draw: function (){
                    this.width = 8;
                    this.height = 8;
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(options.attachId);
                    if(!attachment){ this.finish(); return;}
                    var length;
                    var offsetX = 0;
                    var offsetY = 0;
                    switch(this.time){
                        case 0: case 5: length = 11; break;
                        case 1: case 4: length = 22; break;
                        case 2: case 3: length = 32; break;
                    }
                    switch(options.offsetDirection){
                        case NORTH: offsetY += length-8;
                        case SOUTH: this.height = length; break;
                        case EAST : offsetX += length-8;
                        case WEST : this.width  = length; break;
                    }
                    var center = this.center(options.attachId, options.offsetDirection);
                    if(!center){ this.finish(); return;}
                    switch(options.offsetDirection){
                        case NORTH: case SOUTH: this.width  = 2; break;
                        case EAST : case WEST : this.height = 2; break;
                    }
                    var shaftCenter = this.center(options.attachId, options.offsetDirection); 
                    if(!shaftCenter){ this.finish(); return;}
                    client.skin.fillRect(shaftCenter.x, shaftCenter.y, this.width, this.height, '#fff');
                    client.skin.drawGraphic(
                        'smallProjectiles', 'spearTip',
                        center.x+offsetX, center.y+offsetY,
                        {direction: options.offsetDirection}
                    );
                }
            }),
            axe: event({
                timeLimit: 6,
                width: 16,
                height: 16,
                draw: function (){
                    var options = this.options;
                    var attachment = client.gameplay.memory.getContainable(options.attachId);
                    if(!attachment){ this.finish(); return;}
                    var offsetX = 0;
                    var offsetY = 0;
                    var position = 0;
                    switch(attachment.direction){
                        case EAST : position = 7; break;
                        case NORTH: position = 1; break;
                        case WEST : position = 3; break;
                        case SOUTH: position = 5; break;
                    }
                    position += Math.floor(this.time/2);
                    var wP = attachment.width  - (attachment.width -this.width )/2;
                    var hP = attachment.height - (attachment.height-this.height)/2;
                    var drawDirection;
                    var C = 4;
                    switch(position%8){
                        case 0: offsetX += wP  ;                  drawDirection = EAST     ; break;
                        case 1: offsetX += wP-C; offsetY += hP-C; drawDirection = NORTHEAST; break;
                        case 2:                  offsetY += hP  ; drawDirection = NORTH    ; break;
                        case 3: offsetX -= wP-C; offsetY += hP-C; drawDirection = NORTHWEST; break;
                        case 4: offsetX -= wP  ;                  drawDirection = WEST     ; break;
                        case 5: offsetX -= wP-C; offsetY -= hP-C; drawDirection = SOUTHWEST; break;
                        case 6:                  offsetY -= hP  ; drawDirection = SOUTH    ; break;
                        case 7: offsetX += wP-C; offsetY -= hP-C; drawDirection = SOUTHEAST; break;
                    }
                    var center = this.center(options.attachId);
                    if(!center){ this.finish(); return;}
                    client.skin.drawGraphic(
                        'projectiles', 'axe',
                        center.x+offsetX, center.y+offsetY,
                        {direction: drawDirection}
                    );
                }
            }),
            /*
			"heal_sparkles": {
				finished: false,
				sprites: undefined,
				setup: function (data){
					this.x = data.x;
					this.y = data.y;
					this.time = 0;
					this.sprites = Object.create(DM.list);
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
				},
				iterate: function (){
					this.time++;
					var expand_rate = 3;
					this.sprites[0].x = this.x+this.time*expand_rate;
					this.sprites[0].y = this.y+this.time*expand_rate;
					this.sprites[1].x = this.x+this.time*expand_rate;
					this.sprites[1].y = this.y-this.time*expand_rate;
					this.sprites[2].x = this.x-this.time*expand_rate;
					this.sprites[2].y = this.y-this.time*expand_rate;
					this.sprites[3].x = this.x-this.time*expand_rate;
					this.sprites[3].y = this.y+this.time*expand_rate;
					if(this.time > 5){ this.finished = true}
				}
			},
			"heal_sparkle": {
				finished: false,
				sprites: undefined,
				setup: function (data){
					this.x = data.x;
					this.y = data.y;
					this.time = 0;
					this.sprites = Object.create(DM.list);
					this.sprites.add({x: this.x, y: this.y, graphic: 'green_sparkles', width: 0, height: 0});
				},
				iterate: function (){
					this.time++;
					if(this.time > 5){ this.finished = true}
				}
			},
			"aura_sparkle": {
				finished: false,
				sprites: undefined,
				setup: function (data){
					this.x = data.x;
					this.y = data.y;
					this.time = 0;
					this.sprites = Object.create(DM.list);
					this.sprites.add({x: this.x, y: this.y, graphic: 'blue_sparkles', width: 0, height: 0});
				},
				iterate: function (){
					this.time++;
					if(this.time > 5){ this.finished = true}
				}
			}*/
		},
        theme: {
            plains: {
                tileGraphic: 'plains',
                song: undefined
            },
            castle: {
                tileGraphic: 'castle',
                song: undefined
            },
            wastes: {
                tileGraphic: 'wastes',
                song: undefined
            },
            desert: {
                tileGraphic: 'desert',
                song: undefined
            },
            ruins: {
                tileGraphic: 'ruins',
                song: undefined
            },
            inferno: {
                tileGraphic: 'inferno',
                song: undefined
            }
        }
    },
	setup: function (configuration, callback){
		this.setupGraphics(callback);
	},
	setupGraphics: function (callback){
        var loadCaller = function (loopResource){
            return function (){
                var rIndex = client.resourceLibrary.resourceLoadingIds.indexOf(loopResource.url);
                client.resourceLibrary.resourceLoadingIds.splice(rIndex,1);
                if(client.resourceLibrary.resourceLoadReady){
                    if(!client.resourceLibrary.resourceLoadingIds.length){
                        callback();
                    }
                }
            }
        };
		for(var key in this.library.graphic){
			var resource = this.library.graphic[key];
			if(!(resource.url in this.images)){
				var newImage = new Image();
				this.resourceLoadingIds.push(resource.url);
				newImage.addEventListener("load", loadCaller(resource), false)
				newImage.src = resourcePath+'/'+resource.url;
				this.images[resource.url] = newImage;
			}
			resource.image = this.images[resource.url];
		}
		this.resourceLoadReady = true;
		if(!this.resourceLoadingIds.length){
			callback();
		}
	}
}
//== CLOSE NAMESPACE =========================================================//
})();