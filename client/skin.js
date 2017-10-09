'use strict';
// TODO: Document.
client.skin = Object.extend(driver, {
    container: undefined,
    context: undefined,
    setup: function (configuration){
        /**
            This function configures the map to display game data. It is called
            as soon as the client loads, in client.drivers.gameplay.setup It
            creates all the necessary DOM infrastructure needed by later calls
            to this.display.
            
            It should not be called more than once.
            
            It does not return anything.
        **/
        this.font = configuration.font || 'monospace';
        this.width = configuration.width || DISPLAY_WIDTH;
        this.height = configuration.height || DISPLAY_HEIGHT;
        var ownCanvas = document.createElement('canvas');
        ownCanvas.width = this.width;
        ownCanvas.height = this.height;
        ownCanvas.addEventListener('click', this.clickHandler);
        this.context = ownCanvas.getContext('2d');
        this.container = document.getElementById(configuration.containerId);
        this.container.tabIndex = 1;
        this.container.focus();
        this.container.appendChild(ownCanvas);
        // 
        this.context.fillStyle = 'gray';
        this.context.fillRect(0, 0, this.width, this.height);
        this.graphicsTimer.start();
    },
    clickHandler: function (clickEvent){
        // Extract coordinates of click from DOM mouse event.
        var correctedX = clickEvent.pageX - clickEvent.target.offsetLeft;
        var correctedY = clickEvent.pageY - clickEvent.target.offsetTop;
        // Correct Y coordinate for difference of coordinate systems.
        correctedY = this.height-correctedY;
        //var x = correctedX/TILE_SIZE;
        //var y = correctedY/TILE_SIZE;
        client.handleClick(correctedX, correctedY);
    },
    fillRect: function (x, y, width, height, color){
        this.context.fillStyle = color || '#000';
        y = (DISPLAY_HEIGHT) - y;
        y -= height;
        var offsetX = game.camera.x;
        var levelWidth = game.level.width * TILE_SIZE;
        offsetX = bound(offsetX, 0, levelWidth-DISPLAY_WIDTH);
        this.context.fillRect(x-offsetX, y, width, height);
    },
    drawGraphic: function (resourceId, stateName, x, y, options){
        var resource = client.resourceLibrary.resource('graphic', resourceId);
        if(!options){ options = {};}
        options.state = stateName;
        options.cameraX = game.camera.x;
        //options.time = this.graphicsTimer.time;
        if(!resource){ return null;}
        return resource.draw(x, y, options);
    },
    draw: function (options){
        this.context.fillStyle = 'rgba(0,0,0,0.25)'//'#000';
        this.context.fillRect(0,0,DISPLAY_WIDTH, DISPLAY_HEIGHT);
        for(var posI = 0; posI < game.level.tileGrid.length; posI++){
            var tile = game.level.tileGrid[posI];
            var posX = posI%game.level.width;
            var posY = Math.floor(posI/game.level.width);
            var color = undefined;
            if(tile.color){
                color = tile.color;
            }
            this.fillRect(
                posX*TILE_SIZE, posY*TILE_SIZE, TILE_SIZE, TILE_SIZE, color);
            if(tile.graphicState){
                this.drawGraphic(tile.graphic, tile.graphicState, posX*TILE_SIZE, posY*TILE_SIZE);
            }
        }
        game.level.movers.forEach(function (theMover){
            var displayY = theMover.y + theMover.z
            this.drawGraphic(theMover.graphic, theMover.graphicState, theMover.x, displayY);
            //this.fillRect(theMover.x, displayY, theMover.width, theMover.height, theMover.color);
        }, this);
        client.skin.fillRect(game.camera.x,0,1,400,'yellow')
    },
    graphicsTimer: {
        time: 0,
        speed: CLIENT_SPEED,
        interval: undefined,
        iterate: undefined,
        iterator: function (){
            this.time++;
            client.tick();
            /*client.skin.displayContext.drawImage(
                client.skin.context.canvas,
                0,0,
                displayWidth*client.skin.scale,
                displayHeight*client.skin.scale
            );*/
        },
        start: function (){
            this.iterate = this.iterator.bind(this);
            this.interval = setInterval(this.iterate, this.speed);
        },
        stop: function (){
            clearInterval(this.interval);
            this.iterate = null;
            this.time = 0;
        }
    }
});