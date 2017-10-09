'use strict';


/*===========================================================================
 *
 *  !!!!!!!!!!!! Incorrect (copy/pasted) documentation) !!!!!!!!!!!!!!!!!!!!!
 *  TODO: Document.
 *  The gameplay driver is single point of contact between the game and
 *      the player once the game is running. It collects all input from the
 *      player, via keyboard, touch, and mouse, and displays the game state
 *      via a map and a menuing system.
 *  It is not a prototype, and should not be instanced.
 *      
  ===========================================================================*/

client.drivers.title = Object.create(driver, {
    drivers: {value: {}, writable: true},
    setup: {value: function (configuration){
        /**
            This function is called by client.setup as soon as the page loads.
            It configures the client to be able to display the menu.
            It does not return anything.
         **/
    }},
    command: {value: function (command, options){
        // TODO: Document.
        var block = driver.command.call(this, command, options);
        if(block){
            return block;
        }
        if(options && options.key){
            if(options.key == 'a' || options.key == 'A'){
                command = COMMAND_ENTER;}
            if(options.key == 'b' || options.key == 'B'){
                command = COMMAND_HELP;}
        }
        switch(command){
            case COMMAND_ENTER:
            case COMMAND_CANCEL:
                clearInterval(this.drawInterval);
                this.newGame();
                return true;
            case COMMAND_HELP:
                clearInterval(this.drawInterval);
                this.focus(this.drivers.about);
                return true;
        }
        return false;
    }},
    focused: {value: function (){
        this.display();
        //this.focus(client.drivers.gameplay.drivers.menu);
    }},
    blurred: {value: function (){
        this.focus(null);
    }},
    newGame: {value: function (){
        // TODO: Document.
        /**
         *  This function spawns a new hero when the game begins. It directs
         *      the memory to blank out and prep for new data, places the hero,
         *      and sets the game in motion.
         *  It does not return anything.
         **/
        this.focus(this.drivers.rollCharacter);
        /*clearInterval(this.drawInterval);
        var gameDriver = client.drivers.gameplay;
        gameDriver.memory.blank();
        client.networking.sendMessage(COMMAND_NEWGAME, {});
        client.focus(gameDriver);*/
    }},
    display: {value: function (options){
        // TODO: Document.
        var block = driver.display.apply(this, arguments);
        if(block){ return block;}
        client.skin.clearCommands();
        /*var picture = '';
        picture += '                     '+'\n';
        picture += '                     '+'\n';
        picture += '                     '+'\n';
        picture += '               /\\   '+'\n';
        picture += '              /D \\ _ '+'\n';
        picture += '____-----  __/   \\\\  '+'\n';
        picture += ' _ ____     /     \\\\ '+'\n';
        picture += '         /\\/        \\'+'\n';
        picture += '        /   \\     \\\\ '+'\n';
        picture += '       /   \\\\      \\'+'\n';
        picture += '     _/     \\ \\  /   '+'\n';
        picture += '    / \\      \\  /   \\'+'\n';
        picture += '  |/|\\ \\     \\\\/     '+'\n';
        picture += '||/|  | |  |  /      '+'\n';
        picture += 'T\\|T|| \\ |  |/     | '+'\n';
        picture += '||/T\\T ||  |    | /T\\'+'\n';
        picture += '/T|T/T\\ : |  | |.|/T\\'+'\n';
        picture += '//T\\/T\\~~~:.: . /T\\T|'+'\n';
        picture += '|/T:|:~-  ~~~: ./T\\/T'+'\n';
        picture += 'T\\:::~ -   - ~:  .:/T'+'\n';
        picture += 'T\\|: -  - -  ~ :. .::';*/
        var drawMountain = function (){
            client.skin.drawString(0,20,'                                          ','#008');
            client.skin.drawString(0,19,'                                          ','#008');
            client.skin.drawString(0,18,'                                          ','#008');
            client.skin.drawString(0,17,'                                    /\\    ','#008');
            client.skin.drawString(0,16,'                                   /D \\ _ ','#008');
            client.skin.drawString(0,15,'                     ____-----  __/   \\\\  ','#008');
            client.skin.drawString(0,14,'                      _ ____     /     \\\\ ','#008');
            client.skin.drawString(0,13,'                              /\\/        \\','#008');
            client.skin.drawString(0,12,'                             /   \\     \\\\ ','#008');
            client.skin.drawString(0,11,'                            /   \\\\      \\ ','#008');
            client.skin.drawString(0,10,'                          _/     \\ \\  /   ','#008');
            client.skin.drawString(0, 9,'                         / \\      \\  /   \\','#008');
            client.skin.drawString(0, 8,'\\                 _    |/|\\ \\     \\\\/     ','#008');
            client.skin.drawString(0, 7,' \\              _/ \\ ||/|  | |  |  /      ','#008');
            client.skin.drawString(0, 6,' \\\\___         /  \\ |T\\|T|| \\ |  |/     | ','#008');
            client.skin.drawString(0, 5,'\\ \\   \\_      /   |/T||/T\\T ||  |    | /T\\','#008');
            client.skin.drawString(0, 4,':\\|  \\ \\\\__|_/|  /T\\T/T|T/T\\ : |  | |.|/T\\','#008');
            client.skin.drawString(0, 3,'|:.\\|_\\__\\/T\\|_|_/T|\\//T\\/T\\~~~:.: . /T\\T|','#008');
            client.skin.drawString(0, 2,':.:.:. . ./T\\ /T\\//T\\|/T:|:~-  ~~~: ./T\\/T','#008');
            client.skin.drawString(0, 1,'.|  .   .:/T\\:/T\\:/T/T\\:::~ -   - ~:  .:/T','#008');
            client.skin.drawString(0, 0,': .   .  .::.:/T\\|::/T\\|: -  - -  ~ :. .::','#008');
            client.skin.drawCommand(8, 11, 'A', 'Start', COMMAND_ENTER);
            //client.skin.drawCommand(8, 10, 'B', 'About', COMMAND_HELP);
        };
        var maxCloud = 40;
        var cloudFalloff = 0;
        var drawClouds = function (){
            var clouds = '';
            clouds += '   **********          ';
            clouds += ' *** *     * * **    **';
            clouds += '**  *    *  * **    * *';
            clouds += '**         **        **';
            clouds += ' ** *    * ***        *';
            clouds += '   *  *** *            ';
            clouds += '  ****  **             ';
            clouds += '      ***              ';
            var cloudW = 23;
            var cloudH = 8;
            var cloudX = 19;
            var cloudY = displaySize-cloudH-3;
            var cloudFade = cloudFalloff/maxCloud;
            //var cloudRed = Math.round(80*cloudFade);
            var cloudGrey = Math.round(64*cloudFade);
            var cloudBack = 'rgb('+cloudGrey+','+cloudGrey+','+cloudGrey+')';
            for(var posY = 0; posY < cloudH; posY++){
                for(var posX = 0; posX < cloudW; posX++){
                    var fixedY = cloudH - posY;
                    var cloudI = posY*cloudW + posX;
                    var cloudC = clouds.charAt(cloudI);
                    if(cloudC === ' '){ continue;}
                    var cloudColor = cloudBack;
                    if(cloudC != '*'){
                        cloudColor = '#fff';
                    }
                    client.skin.drawCharacter(
                        posX+cloudX,
                        fixedY+cloudY,
                        cloudC,
                        cloudColor
                    );
                }
            }
        };
        var lightningStrike = function (){
            var lightning = '';
            lightning += '  \\      ';
            lightning += '   \\     ';
            lightning += '   |\\    ';
            lightning += '   | \\   ';
            lightning += '   /  \\  ';
            lightning += '       \\ ';
            lightning += '  | \\   \\';
            lightning += '  / /\\   ';
            lightning += ' /  \\    ';
            lightning += '/\\       ';
            lightning += '| \\      ';
            var lightningW = 9;
            var lightningH = 11;
            var lightningX = 24;
            var lightningY = displaySize-lightningH-1;
            cloudFalloff = maxCloud;
            for(var posY = 0; posY < lightningH; posY++){
                for(var posX = 0; posX < lightningW; posX++){
                    var fixedY = lightningH - posY;
                    var lightningI = posY*lightningW + posX;
                    var lightningC = lightning.charAt(lightningI);
                    if(lightningC === ' '){ continue;}
                    client.skin.drawCharacter(
                        posX+lightningX,
                        fixedY+lightningY,
                        lightningC,
                        '#ff0'
                    );
                }
            }
        };
        var colorTime = 256;
        var spectrumTime = colorTime*3;
        var currentTime = Math.round(colorTime/3); // Yellow
        this.drawInterval = setInterval(function (){
            client.skin.status('Version '+VERSION, '#008');
            drawMountain();
            currentTime++;
            var hue = currentTime%spectrumTime;
            var red = 0;
            var green = 0;
            var blue = 0;
            if(hue < spectrumTime/3){
                red = colorTime-hue;
                green = hue;
            } else if(hue < spectrumTime*2/3){
                green = colorTime-(hue-colorTime);
                blue = hue-colorTime;
            } else{
                blue = colorTime-(hue-(colorTime*2));
                red = hue-(colorTime*2);
            }
            red   = Math.floor(Math.sin((Math.PI/2)*(red  /colorTime))*256);
            blue  = Math.floor(Math.sin((Math.PI/2)*(blue /colorTime))*256);
            green = Math.floor(Math.sin((Math.PI/2)*(green/colorTime))*256);
            var color = 'rgb('+red+','+green+','+blue+')';
            if(cloudFalloff > 0){
                drawClouds();
                cloudFalloff--;
            }
            if(hue >= spectrumTime - 30 && hue < spectrumTime -25){
                lightningStrike();
            } else if(hue >= spectrumTime-15){
                lightningStrike();
            }
            client.skin.drawString(6, 13, 'Goblin-Like', color);
        }, 10);
        return true;
        //client.displayText(picture);
    }}
});
client.drivers.title.drivers.rollCharacter = Object.create(driver, {
    roll: {value: function (){
        client.skin.clearCommands();
        client.skin.fillRect(0, 0, displaySize*2, displaySize, '#000');
        client.skin.status('New Character');
        var statTotal = 28; // TODO: Magic Number!
        this.vitality = 1;
        this.strength = 1;
        this.wisdom = 1;
        this.charisma = 1;
        statTotal -= 4; // Total of innitial population of 1s.
        while(statTotal){
            switch(Math.floor(Math.random()*4)){
                case 0:
                    if(this.vitality >= 10){ continue;}
                    this.vitality++;
                    break;
                case 1:
                    if(this.strength >= 10){ continue;}
                    this.strength++;
                    break;
                case 2:
                    if(this.wisdom >= 10){ continue;}
                    this.wisdom++;
                    break;
                case 3:
                    if(this.charisma >= 10){ continue;}
                    this.charisma++;
                    break;
            }
            statTotal--;
        }
        this.display();
    }},
    display: {value: function (){
        client.skin.clearCommands();
        client.skin.fillRect(0, 0, displaySize*2, displaySize, '#000');
        client.skin.status('New Character');
        client.skin.drawString(14, 16, 'Character Stats');
        client.skin.drawString(16, 14, 'Vitality: '+this.vitality);
        client.skin.drawString(16, 13, 'Strength: '+this.strength);
        client.skin.drawString(16, 12, 'Wisdom  : '+this.wisdom  );
        client.skin.drawString(16, 11, 'Charisma: '+this.charisma);
        if(!this.name && this.name !== ''){
            client.skin.drawCommand(14,  9, 'A', 'Accept Stats', COMMAND_ENTER);
            client.skin.drawCommand(14,  8, 'B', 'Reroll Stats', COMMAND_CANCEL);
        } else{
            client.skin.drawString(14, 9, 'Enter Name:');
            client.skin.drawString(16, 7, this.name+'_');
            if(this.name.length >= 1){
                client.skin.drawCommand(14, 5, 'Enter', 'Finished', COMMAND_ENTER);
                client.skin.drawCommand(14, 4, 'Space', 'Reroll', COMMAND_CANCEL);
            }
        }
        return true;
    }},
    command: {value: function (command, options){
        // TODO: Document.
        var block = driver.command.call(this, command, options);
        if(block){
            return block;
        }
        if(!this.name && this.name !== ''){
            if(options && options.key){
                if(options.key == 'a' || options.key == 'A'){
                    command = COMMAND_ENTER;}
                if(options.key == 'b' || options.key == 'B'){
                    command = COMMAND_CANCEL;}
            }
            switch(command){
                case COMMAND_ENTER:
                    this.name = sWerd.name();
                    this.display();
                    return true;
                case COMMAND_CANCEL:
                    this.roll();
                    return true;
            }
        } else {
            if(options && options.key){
                var key = options.key;
                if(key.length === 1){
                    if(this.name.length == 8){
                        this.name = this.name.substring(0, 7);
                    }
                    this.name += key;
                    if(this.name.length == 1){
                        this.name = this.name.toUpperCase();
                    }
                } else if(key == 'backspace' || key == 'del'){
                    this.name = this.name.substring(0, this.name.length-1);
                }
                this.display();
            }
            if(command == COMMAND_ENTER){
                this.start();
            } else if(command == COMMAND_CANCEL){
                this.name = null;
                this.roll();
            }
        }
        return true;
    }},
    focused: {value: function (){
        this.roll();
        this.display();
        //this.focus(client.drivers.gameplay.drivers.menu);
    }},
    blurred: {value: function (){
        this.name = null;
        this.vitality = null;
        this.strength = null;
        this.wisdom   = null;
        this.charisma = null;
    }},
    start: {value: function (){
        // TODO: Document.
        /**
         *  This function spawns a new hero when the game begins. It directs
         *      the memory to blank out and prep for new data, places the hero,
         *      and sets the game in motion.
         *  It does not return anything.
         **/
        client.skin.clearCommands();
        client.skin.fillRect(0, 0, displaySize*2, displaySize, '#000');
        clearInterval(this.drawInterval);
        var gameDriver = client.drivers.gameplay;
        gameDriver.memory.blank();
        client.networking.sendMessage(COMMAND_NEWGAME, {
            name    : this.name,
            vitality: this.vitality,
            strength: this.strength,
            wisdom  : this.wisdom,
            charisma: this.charisma
        });
        client.focus(gameDriver);
        gameDriver.display();
    }}
});
client.drivers.title.drivers.about = Object.create(driver, {
    display: {value: function (){
        client.skin.clearCommands();
        client.skin.fillRect(0, 0, displaySize*2, displaySize, '#000');
        client.skin.status('About                Jacob A Brennan, 2015');
        var aboutText = "This is a Roguelike, a genre of games that are known for using letters as graphics. The example map on the right shows:";
        client.skin.drawParagraph(1, 17, aboutText, undefined, undefined, undefined, 27);
        client.skin.drawString(4, 11, "The player, a goblin.");
        client.skin.drawCharacter(2, 11, 'g', '#0f0');
        client.skin.drawString(4, 10, "Walls around a room.");
        client.skin.drawCharacter(2, 10, '#', '#fff', '#111');
        client.skin.drawString(4,  9, "The floor of the room.");
        client.skin.drawCharacter(2,  9, '.', '#444', '#111');
        client.skin.drawString(4,  8, "An enemy Giant Beetle.");
        client.skin.drawCharacter(2,  8, 'b', '#888');
        client.skin.drawString(4,  7, "Stairs to a deeper level.");
        client.skin.drawCharacter(2,  7, '>', '#000', '#fc0');
        client.skin.drawString(4,  6, "Doors to other rooms and halls.");
        client.skin.drawCharacter(2,  6, '+', '#fc0', '#111');
        client.skin.drawString(6,  5, "A Potion and a stack of Arrows.");
        client.skin.drawCharacter(2,  5, '¡ \\', '#963');
        var mapText = "#########";
        mapText    += "#.......#";
        mapText    += "#......b+";
        mapText    += "#.\\.....#";
        mapText    += "#¡......#";
        mapText    += "#...g...#";
        mapText    += "#..>....#";
        mapText    += "#.......#";
        mapText    += "######+##";
        var mapWidth = 9;
        for(var charI = 0; charI < mapText.length; charI++){
            var indexChar = mapText.charAt(charI);
            var xPos = charI % mapWidth;
            var yPos = Math.floor(charI/mapWidth);
            var charBack = '#111';
            var charColor = '#fff';
            switch(indexChar){
                case '.': charColor = '#444', charBack = '#111'; break;
                case 'b': charColor = '#888'; break;
                case 'g': charColor = '#0f0'; break;
                case '+': charColor = '#fc0'; charBack = '#111'; break;
                case '#': charBack = '#111'; break;
                case '>': charColor = '#000'; charBack = '#fc0'; break;
                case '\\': case '¡': charColor = "#963"; break;
            }
            client.skin.drawCharacter(
                30+xPos, 9+yPos, indexChar, charColor, charBack);
        }
        client.skin.drawCommand(1,  1, 'Enter', 'Back to Title Screen', COMMAND_ENTER);
        return true;
    }},
    command: {value: function (command, options){
        // TODO: Document.
        var block = driver.command.call(this, command, options);
        if(block){
            return block;
        }
        if(command == COMMAND_ENTER){
            client.drivers.title.focus(null);
            client.drivers.title.display();
        }
        return true;
    }},
    focused: {value: function (){
        this.display();
    }}
});