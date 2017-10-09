'use strict';
// TODO: Document.
var client = Object.extend(driver, {
    drivers: {},
    setup: function (configuration){
        this.resourceLibrary.setup(configuration, function (){
            console.log(this)
            
            this.keyCapture.setup(configuration);
            this.skin.setup(configuration);
            this.gameplay.setup(configuration);
            this.focus(this.gameplay);
            //this.skin.draw();
            
            game.level = Object.instantiate(level, layout);
            game.character = Object.instantiate(character);
            game.level.start();
            /*this.drivers.title.setup(configuration);
            this.drivers.gameplay.setup(configuration);
            this.focus(this.drivers.title);*/
        }.bind(this));
    }
});
driver.handleClick = function (x, y, options){
    if(!(this.currentFocus && this.currentFocus.handleClick)){ return false;}
    return this.currentFocus.handleClick(x, y, options);
};
/*
client.preferences = {
    / * Special Key Names: backspace, tab, enter, return, capslock, esc, escape,
       space, pageup, pagedown, end, home, left, up, right, down, ins, del,
       plus.* /
    // COMMAND_NONE needed to register alphabet keypresses with Mousetrap.
    // Uppercase aliases generated automatically by the client.
    "up"      : UP,
	"down"    : DOWN,
	"left"    : LEFT,
	"right"   : RIGHT,
    "home"    : NORTHWEST,
    "end"     : SOUTHWEST,
    "pageup"  : NORTHEAST,
    "pagedown": SOUTHEAST
};
*/


client.keyCapture = {
	keyState: {},
    bindings: {
        "up": UP,
        "down": DOWN,
        "left": LEFT,
        "right": RIGHT,
        "space": PRIMARY,
        "z": SECONDARY,
        "x": TERTIARY,
        "c": QUATERNARY
    },
    bindingsLookup: {},
	setup: function (configuration){
		// See note in skin.js about tabindex and focus.
		var container = document.body; //client.skin.canvas;
        this.mousetrap = Mousetrap(container);
        var trapCreatorDown = function (key, command){
            return function(event){
                client.keyCapture.keyDown(command, {'key': key});
                event.preventDefault();
            };
        };
        var trapCreatorUp = function (key, command){
            return function(event){
                client.keyCapture.keyUp(command, {'key': key});
                event.preventDefault();
            };
        };
        for(var key in this.bindings){
            if(this.bindings.hasOwnProperty(key)){
                var command = this.bindings[key];
                this.bindingsLookup[command] = key;
                this.mousetrap.bind(key, trapCreatorDown(key, command));
                this.mousetrap.bind(key, trapCreatorUp(key, command), 'keyup');
                var upperKey = key.toUpperCase();
                if(upperKey !== key){
                    this.mousetrap.bind(upperKey, trapCreatorDown(upperKey, command));
                    this.mousetrap.bind(upperKey, trapCreatorUp(upperKey, command), 'keyup');
                }
            }
        }
	},
    check: function (command){
        var binding = this.bindingsLookup[command];
        if(!binding){ return false;}
        return this.keyState[binding.toString()];
    },
    keyDown: function (command, options){
		// Start key_down repeat work-around.
        if(this.check(command)){
            return;
        }
		this.keyState[options.key] = true;
			// End key_down repeat work-around.
		client.command(command);
	},
	keyUp: function (command, options){
		// Start key_down repeat work-around.
		delete this.keyState[options.key];
			// End key_down repeat work-around.
		client.command((command|KEY_UP));
	}
}