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
    display: function (options){
        // TODO: Document.
        var block = driver.display.apply(this, arguments);
        if(block){ return block;}
        return false;
    }
});