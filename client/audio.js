'use strict';

client.audio = {
    effects: {
        /* to be populated from the below configuration data.
        Example:
        'soundId': {context: howlObject}
        */
    },
    testSongs: {},
    playTestSong: function (songId){
        if(this.currentTestSong){
            this.currentTestSong.stop();
        }
        var song = this.testSongs[songId];
        if(!song){ return;}
        this.currentTestSong = song;
        this.currentTestSong.play();
    },
    effectConfiguration: {
        'sound1': {urls: ['rsc/audio/perfect.mp3'], sprites:{
            'perfect': [0, 1000],
        }},
        'sound2': {urls: ['rsc/audio/big_hit.mp3'], sprites:{
            'hitBig': [0, 1000],
        }},
        'sound3': {urls: ['rsc/audio/little_hit.mp3'], sprites:{
            'hitSmall': [0, 1000],
        }},
        'sound4': {urls: ['rsc/audio/stage_start.mp3'], sprites:{
            'stageStart': [0, 4000],
        }},
    },
    playEffect: function (effectId, options){
        //return
        var effect = this.effects[effectId];
        if(!effect){ return null;}
        var instanceId = effect.context.play(effectId);
        return instanceId;
    },
    playSong: function (songId, options){
        return
//        var song = this.songs[songId];
//        if(!song){ return null;}
//        return this.chiptune2.play(song.buffer);
    },
    stopSong: function (){
        //this.chiptune2.stop();
    },
//============================================================================//
    setup: function (configuration, callback){
        // Setup sound effect player with howler library.
        for(var configurationName in this.effectConfiguration){
            if(!this.effectConfiguration.hasOwnProperty(configurationName)){ continue;}
            var soundConfiguration = this.effectConfiguration[configurationName];
            for(var key in soundConfiguration.sprites){
                var sprite = soundConfiguration.sprites[key];
                var start = sprite[0];
                var end = sprite[1];
                var duration = end-start;
                sprite[1] = duration;
            }
            var howlObject = new Howl({
                src: soundConfiguration.urls,
                sprite: soundConfiguration.sprites
            });
            for(var spriteId in soundConfiguration.sprites){
                if(!soundConfiguration.sprites.hasOwnProperty(spriteId)){ continue}
                this.effects[spriteId] = {
                    context: howlObject
                }
            }
        }
    }
}
