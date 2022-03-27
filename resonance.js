//const Max = require('max-api');

import Music from './Music.js'
import Ball from './Ball.js'
import { SimplexNoise } from 'simplex-noise';
import {WebMidi} from 'webmidi';
import { Scale } from '@tonaljs/tonal';
import _ from 'lodash';
import readline from 'readline';

let channel, output, interactiveMode;

WebMidi
.enable()
.then(onEnabled)
.catch(err => console.log(err));

let active = true
interactiveMode = true;

// Function triggered when WebMidi.js is ready
function onEnabled() {
    console.log('WebMIDI enabled!');
    output = WebMidi.getOutputByName("loopMIDI");
    //output = WebMidi.getOutputByName("IAC Driver Bus 1");
    channel = output.channels[1];

    //active = true;
    //interactiveMode = true;
}

// Room dimensions
export let room = {
    xmin: -300,
    xmax: 300,
    ymin: 900,
    ymax: 0
}

// Noise generator
export const simplex = new SimplexNoise();

// Starting position / place of the cube
export let start = {
    x: 0,
    y: 0
}

// Music setup
let tonic = "C3";
export let music = new Music(tonic)

// Array for all the balls
let balls = [];

// Function that makes new balls
function getNewBall(face) {
    console.log('creating new ball');
    return new Ball(face);
}

function playNote(note) {
    console.log('playing note', note);
    channel.playNote(note, {duration: 10000});
}

if (active) {
    changeNotes()

    music.setScale(Scale.get(`${tonic} pentatonic`).notes);
    console.log(music);

    setInterval(() => {
        balls.forEach(ball => {
            ball._update()
            if (ball.playNote && ball.active) {
                console.log('will play note right now');
                playNote(ball.note)
            }
        });
    }, 50);
    
}

function changeNotes() {
    music.update();
    let notes = music.getScale();
    balls.forEach(ball => {
        let note = _.sample(notes)
        ball.setNote(note)
    });
}
if (interactiveMode) {
    readline.emitKeypressEvents(process.stdin);

    process.stdin.on('keypress', (ch, key) => {
        if (key && key.name == 'q') {
            process.stdin.pause();
        }
        balls.push(getNewBall(ch))
        console.log('got "keypress"', ch, key);
        if (key && key.name == 'b') {
            changeNotes();
            playNote(music.getChord(), {duration: 10000})
        }
    });

    process.stdin.setRawMode(true);
}