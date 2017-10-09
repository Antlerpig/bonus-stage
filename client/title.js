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
        game._new();
        client.focus(client.gameplay);
    },
    display: function (options){
        client.skin.drawString(0, 0, client.skin.graphicsTimer.time)
        return;
    }
});