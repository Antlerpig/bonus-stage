'use strict';

client.title = Object.extend(driver, {
    setup: function (configuration){},
    command: function (command, options){
        var block = driver.command.call(this, command, options);
        if(block){ return block;}
        if(options && options.key == 'space'){ command = PRIMARY;}
        switch(command){
            case PRIMARY:
                this.newGame();
                return true;
        }
        return false;
    },
    newGame: function (){
        client.audio.playEffect('stageStart');
        game._new();
        client.focus(client.gameplay);
    },
    display: function (options){
        client.skin.drawGraphic('title', null, 0, 0);
        client.skin.touchScreen.display();
        return;
    },
    focused: function (){
        client.skin.touchScreen.clearButtons();
        client.skin.touchScreen.addButton('start', PRIMARY, DISPLAY_WIDTH/2-32, 16, 64);
    },
});




/*    
    display: function (options){
        // TODO: Document.
        var block = driver.display.apply(this, arguments);
        if(block){ return block;}
        client.skin.context.fillStyle = 'rgba(0,0,0,0.25)'//'#000';
        client.skin.drawGraphic('clientScreens', 'start', 0, 0);
        var cI = Math.floor(client.skin.graphicsTimer.time/3)%3;
        client.skin.drawString(92,DISPLAY_HEIGHT-67,'Adventure', (['#f00','#0f0','#00f'])[cI], '#000');
        client.skin.touchScreen.display();
        return false;
    }
});*/