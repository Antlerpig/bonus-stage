'use strict';

var sequence = {
    init: function (owner){},
    takeTurn: function (owner){},
    land: function (owner){},
    interrupt: function (owner, newSequence){
        if(!newSequence){ newSequence = 'hurt1';}
        owner.sequence(newSequence);
        return true;
    }
};
var sequences = {
    'stand': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'walk3';
        },
        takeTurn: function (owner){
            var directionX = 0;
            var directionY = 0;
            if(owner.order('punch', PRIMARY)){
                owner.sequence('punch');
                return;
            }
            if(owner.order('jump', SECONDARY)){
                owner.sequence('jump');
                return;
            }
            if(owner.order('walkRight' , RIGHT)){ directionX =  1;}
            if(owner.order('walkLeft'  , LEFT )){ directionX = -1;}
            owner.walk(directionX);
            /*} else if(this.state === STATE_STANDING|STATE_PUNCHING){
                //this.punch(2)
            }*/
        },
        
    }),
    'punch': Object.extend(sequence, {
        init: function (owner){
            this.graphicState = 'walk3';
            owner.graphicState = this.graphicState;
            this.time = 7;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
                return;
            }
            if(this.time < 2 && owner.order('punch', PRIMARY)){
                owner.sequence('punch2');
                return;
            }
            if(this.time < 5){
                this.graphicState = 'punch1';
                if(owner.direction === RIGHT){
                    owner.attack(owner.x+owner.width+14, owner.y+32);
                } else{
                    owner.attack(owner.x-14, owner.y+32);
                }
            }
            owner.graphicState = this.graphicState;
        }
    }),
    'punch2': Object.extend(sequence, {
        init: function (owner){
            this.graphicState = 'walk3';
            owner.graphicState = this.graphicState;
            this.time = 7;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
                return;
            }
            if(this.time < 2 && owner.order('punch', PRIMARY)){
                owner.sequence('punch3');
                return;
            }
            if(this.time < 5){
                this.graphicState = 'punch2';
                if(owner.direction === RIGHT){
                    owner.attack(owner.x+owner.width+14, owner.y+32);
                } else{
                    owner.attack(owner.x-14, owner.y+32);
                }
            }
            owner.graphicState = this.graphicState;
        }
    }),
    'punch3': Object.extend(sequence, {
        init: function (owner){
            this.graphicState = 'walk3';
            owner.graphicState = this.graphicState;
            this.time = 8;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
                return;
            }
            if(this.time < 6){ this.graphicState = 'punch3';}
            if(this.time < 4){
                this.graphicState = 'punch4';
                if(owner.direction === RIGHT){
                    owner.attack(owner.x+owner.width+14, owner.y+32, true);
                } else{
                    owner.attack(owner.x-14, owner.y+32, true);
                }
            }
            owner.graphicState = this.graphicState;
        }
    }),
    'hurt1': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'hurt1';
            this.time = 8;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
            }
        }
    }),
    'hurt2': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'hurt2';
            this.time = 8;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
            }
        }
    }),
    'hurt3': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'hurt3';
            this.time = 12;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
            }
        }
    }),
    'trip': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'trip';
            owner.y += 12;
        },
        takeTurn: function (owner){
            var velX = (owner.direction === RIGHT)? -2 : 2;
            owner.translate(velX, 0, 0);
        },
        land: function (owner){
            owner.sequence('down');
        },
        interrupt: function (owner){}
    }),
    'down': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'down';
            this.time = 32;
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                owner.sequence('stand');
                return;
            }
            if(this.time < 8){
                owner.die();
                //owner.graphicState = 'kneel';
            }
        },
        interrupt: function (owner){}
    }),
    'jump': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'kneel';
            this.time = 2;
            this.directionX = 0;
            if(owner.order('walkRight', RIGHT)){ this.directionX =  1;}
            if(owner.order('walkLeft',  LEFT )){ this.directionX = -1;}
        },
        takeTurn: function (owner){
            if(!(this.time--)){
                if(!this.landed){
                    this.jumped = true;
                    owner.graphicState = 'jump';
                    owner.velY = 12;
                } else{
                    owner.sequence('stand')
                }
            }
            if(this.jumped && !this.landed){
                owner.translate(this.directionX*4, 0, 0);
                if(owner.velY <= 4 && owner.order('punch', PRIMARY)){
                    owner.sequence('jumpKick');
                    owner.currentSequence.directionX = this.directionX;
                }
            }
        },
        land: function (owner){
            if(!this.jumped || this.landed){ return;}
            owner.graphicState = 'kneel';
            this.landed = true;
            this.time = 4;
        },
        interrupt: function (owner){
            owner.sequence('trip');
            return true;
        }
    }),
    'jumpKick': Object.extend(sequence, {
        init: function (owner){
            owner.graphicState = 'jumpKick';
            // directionX is set by the jump sequence
            this.time = 0;
        },
        takeTurn: function (owner){
            if(this.landed){
                if(!(this.time--)){
                    owner.sequence('stand')
                }
            } else{
                owner.translate(this.directionX*4, 0, 0);
                if(owner.direction === RIGHT){
                    owner.attack(owner.x+owner.width+14, owner.y);
                } else{
                    owner.attack(owner.x-14, owner.y);
                }
            }
        },
        land: function (owner){
            if(this.landed){ return;}
            owner.graphicState = 'kneel';
            this.landed = true;
            this.time = 4;
        },
        interrupt: function (owner){
            owner.sequence('trip');
            return true;
        }
    }),
};
var character = Object.extend(mover, {
    x: 16,
    y: 96,
    height: 32,
    name: 'character',
    graphic: 'test',
    graphicState: 'walk1',
    faction: FACTION_PLAYER,
    speed: 2,
    gravity: 2,
    order: function (description, command){
        return client.keyCapture.check(command);
    },
    die: function (){
        
    },
    takeTurn: function (){
        mover.takeTurn.apply(this, arguments);
        this.translate(0, this.velY, 0);
        if(!this.currentSequence){ this.sequence('stand');}
        this.currentSequence.takeTurn(this);
    },
    sequence: function (sequenceName){
        var sequenceModel = sequences[sequenceName]
        if(!sequenceModel){ return;}
        this.currentSequence = Object.create(sequenceModel);
        this.currentSequence.init(this);
    },
    walk: function (direction){
        var deltaX = 0;
        if(direction){
            this.direction = (direction > 0)? RIGHT : LEFT;
            deltaX = direction * this.speed;
            if(this.direction === LEFT){ this.graphic = 'testLeft';}
            else{ this.graphic = 'test';}
            if(deltaX > 0){
                var borderRight = game.camera.borderRight();
                if(this.x+this.width+deltaX > borderRight){
                    deltaX = borderRight-(this.x+this.width);
                }
            } else if(deltaX < 0){
                var borderLeft = game.camera.borderLeft();
                if(this.x+deltaX < borderLeft){
                    deltaX = -(this.x - borderLeft);
                }
            }
        }
        if(deltaX){
            this.translate(deltaX, 0);
            var frame = Math.floor((client.skin.graphicsTimer.time%24)/6)+1;
            if(frame === 4){ frame = 2;}
            this.graphicState = 'walk'+frame;
        }
    },
    land: function (){
        if(this.currentSequence){
            this.currentSequence.land(this);
        }
    },
    base: function (){
        
    },
    attack: function (x, y, tripping){
        game.level.movers.forEach(function (theMover){
            if(theMover.faction & this.faction){ return;}
            if(!theMover.hurt){ return;}
            if(theMover.containsPoint(x, y)){
                theMover.hurt(1, this, tripping);
            }
        }.bind(this));
    },
    hurt: function (amount, attacker, tripping){
        var damaged = false;
        if(tripping){
            damaged = this.currentSequence.interrupt(this, 'trip');
        } else{
            damaged = this.currentSequence.interrupt(this);
        }
        //
    }
});
var enemy = Object.extend(character, {
    speed: 1,
    faction: FACTION_ENEMY,
    dead: false,
    die: function (){
        this.dead = true;
        game.level.cancelMover(this);
    },
    order: function (description, command){
        /*switch (description){
            case 'walkRight':
                if(game.character.x - this.x > 14){ return true;}
                if(this.direction === LEFT && game.character.x > this.x){ return true;}
                break;
            case 'walkLeft':
                if(game.character.x - this.x < -14){ return true;}
                if(this.direction === RIGHT && game.character.x < this.x){ return true;}
                break;
            case 'punch':
                if(Math.random()*8 > 1){ return false;}
                if(Math.abs(game.character.x - this.x) <= 14+12){ return true;}
        }*/
        return false;
    },
});
var statue = Object.extend(enemy, {
    height: 40,
    color: 'goldenrod',
    _new: function (){
        var result = enemy._new.apply(this, arguments);
        this.x = 12*TILE_SIZE;
        this.y = 5*TILE_SIZE;
        this.base = Object.instantiate(base);
        this.base.x = this.x+(this.width-this.base.width)/2;
        this.base.y = 2*TILE_SIZE;
        return result;
    },
    hurt: function (amount, attacker, tripping){
        //shake
        //
    },
    translate: function (deltaX, deltaY){
        if(this.base && !this.base.dead){ deltaY = 0;}
        return enemy.translate.call(this, deltaX, deltaY);
    }
});
var base = Object.extend(enemy, {
    width: 32,
    height: 48,
    color: 'white'
});
var hero = Object.extend(character, {
    translate: function (deltaX, deltaY){
        deltaX = Math.min(this.x+deltaX, 11*TILE_SIZE) - this.x;
        return character.translate.call(this, deltaX, deltaY);
    }
})