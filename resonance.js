//const Max = require('max-api');

import Music from './Music.js'
import Ball from './Ball.js'
import { SimplexNoise } from 'simplex-noise';
import { WebMidi } from 'webmidi';
import { Scale } from '@tonaljs/tonal';
import _ from 'lodash';
import readline from 'readline';

let channel, output, interactiveMode, active;

///////////
// MIDI ///
///////////

WebMidi
    .enable()
    .then(() => {
        console.log('WebMIDI enabled!');
        //output = WebMidi.getOutputByName("loopMIDI");
        output = WebMidi.getOutputByName("IAC Driver Bus 1");
        channel = output.channels[1];
    })
    .catch(err => console.log(err));

// bools for startup / init
active = true
interactiveMode = true;


// Room dimensions
export const room = {
    xmin: -300,
    xmax: 300,
    ymin: 900,
    ymax: 0
}
// Starting position / place of the cube
export const start = {
    x: 0,
    y: 0
}

// Noise generator
export const simplex = new SimplexNoise();

// Music setup
let tonic = "C3";
export let music = new Music(tonic)

// Array for all the balls
let balls = [];

/////////////////////////
// HELPER FUNCTIONS /////
/////////////////////////

// Function that makes new balls
function getNewBall(face) {
    console.log('creating new ball');
    return new Ball(face);
}

export function playNote(note) {
    console.log('playing note', note);
    channel.playNote(note, { duration: 1000 });
}


function checkDeleteBall(obj) {
    if (!obj.active) {
        obj = null;
    } else return;
}

function changeNotes() {
    music.update();
    let notes = music.getScale();
    balls.forEach(ball => {
        let note = _.sample(notes)
        ball.setNote(note)
    });
}





// MAIN LOOP

if (active) {
    changeNotes()

    music.setScale(Scale.get(`${tonic} pentatonic`).notes);
    console.log(music);


    // MAIN LOOP
    setInterval(() => {
        balls.forEach(ball => {
            ball._update()
            checkDeleteBall(ball)
            
            if (ball.playNote && ball.active) {
                console.log('will play note right now');
                playNote(ball.note)
            }
        });
    }, 50);

}


// KEyBOARD CLI INPUT
if (interactiveMode) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.on('keypress', (ch, key) => {
        if (key && key.name == 'q') {
            process.stdin.pause();
            process.exit(0)
        }
        switch (key && key.name) {
            case 'y':
                balls.push(getNewBall('up'))
                break;
            case 'u':
                balls.push(getNewBall('front'))
                break;
            case 'i':
                balls.push(getNewBall('back'))
                break;
            case 'o':
                balls.push(getNewBall('left'))
                break;
            case 'p':
                balls.push(getNewBall('right'))
                break;
            default:
                break;
        }
        console.log('got "keypress"', ch, key);
        if (key && key.name == 'b') {
            changeNotes();
            playNote(music.getChord(), { duration: 10000 })
        }
    });

    process.stdin.setRawMode(true);
}