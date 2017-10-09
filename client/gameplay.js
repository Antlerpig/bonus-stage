'use strict';


/*==============================================================================

    The gameplay driver is single point of contact between the game and the
    player once the game is running. It collects all input from the player, via
    keyboard, touch, and mouse, and displays the game state via a map and a
    menuing system.

    It is not a prototype, and should not be instanced.

==============================================================================*/

client.gameplay = Object.extend(driver, {
    setup: function (configuration){},
    focused: function (options){},
    newGame: function (gameData){},
    gameOver: function (deathData){},
    handleClick: function (x, y, options){
        var block = driver.handleClick.apply(this, arguments);
        if(block){
            return block;
        }
        if(this.dead){
            return true;
        }
        return false;
    },/*
    command: {value: function (command, options){
        // TODO: Document.
        var block = driver.command.call(this, command, options);
        if(block){
            return block;
        }
        //game.character.command(command, options);
        return false;
    }},*/
    check: function (command){
        if(this.currentFocus && this.currentFocus.blocking){ return;}
        return client.keyCapture.check(command);
    },
    focused: function (){
        client.skin.touchScreen.showStandardButtons();
        this.focus(this.readyScreen);
        return driver.focused.apply(this, arguments);
    },
    tick: function (){
        var block = driver.tick.apply(this, arguments);
        if(block){ return block;}
        if(game.level){
            game.level.iterate();
        }
        return false;
    },
    display: function (options){
        // Draw Mapdraw: function (options){
        // Draw Tiles
        for(var posI = 0; posI < game.level.tileGrid.length; posI++){
            var tile = game.level.tileGrid[posI];
            var posX = posI%game.level.width;
            var posY = Math.floor(posI/game.level.width);
            var color = undefined;
            if(tile.color){
                color = tile.color;
            }
            client.skin.fillRect(
                posX*TILE_SIZE, posY*TILE_SIZE, TILE_SIZE, TILE_SIZE, color);
            if(tile.graphicState){
                client.skin.drawGraphic(tile.graphic, tile.graphicState, posX*TILE_SIZE, posY*TILE_SIZE);
            }
        }
        // Draw Movers
        game.level.movers.forEach(function (theMover){
            var displayY = theMover.y;
            var displayX = theMover.x;
            if(theMover.shaking){
                displayX += theMover.shaking%3
            }
            if(theMover.color){
                client.skin.fillRect(displayX, displayY, theMover.width, theMover.height, theMover.color);
            }
            client.skin.drawGraphic(theMover.graphic, theMover.graphicState, displayX, displayY);
        });
        // Phone Controller
        if(true){ // TODO: check for phone or keyboard
            client.skin.touchScreen.display();
        }
        var block = driver.display.apply(this, arguments);
        if(block){ return block;}
        return false;
    }
});

client.gameplay.readyScreen = Object.extend(driver, {
    focused: function (){
        this.time = 0;
        this.blocking = true;
        this.message = 'Ready?';
    },
    tick: function (){
        this.time++;
        if(this.time > 80){
            client.gameplay.focus(null);
        } else if(this.time > 60){
            this.message = 'Go!';
            this.blocking = false;
        }
    },
    display: function (){
        client.skin.drawString(4*TILE_SIZE, 6*TILE_SIZE, this.message);
        return true; // Block
    }
});

client.gameplay.clearScreen = Object.extend(driver, {
    focused: function (){
        this.time = 0;
        this.blocking = true;
        this.message = 'Perfect!';
    },
    tick: function (){
        this.time++;
        if(this.time > 80){
            this.message = '';
        }
    },
    display: function (){
        client.skin.drawString(4*TILE_SIZE, 6*TILE_SIZE, this.message);
        return true; // Block
    }
});