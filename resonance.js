//const Max = require('max-api');

import { SimplexNoise } from 'simplex-noise';

import Music from './Music.js'
import Ball from './Ball.js'
import {WebMidi} from 'webmidi';

// import play from 'audio-play';
// import load from'audio-loader';

import readline from 'readline';

let channel, output, interactiveMode;

let active = true

WebMidi
.enable()
.then(onEnabled)
.catch(err => console.log(err));

interactiveMode = true;

//load('./C3.wav').then(play);


// Function triggered when WebMidi.js is ready
function onEnabled() {
    console.log('WebMIDI enabled!');
    output = WebMidi.getOutputByName("IAC Driver Bus 1");
    channel = output.channels[1];


    console.log(channel);
    channel.playNote('C5', {duration: 5000})
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
let music = new Music(tonic)

// Array for all the balls
let balls = [];

// Function that makes new balls
function getNewBall(face) {
    console.log('creating new ball');
    return new Ball(face);
}

function playNote(note) {
    console.log('playing note', note);
    channel.playNote(note, {duration: 2000});
    //load(`./${note}.wav`).then(play)
}

if (active) {
    setInterval(() => {
        balls.forEach(ball => {
            ball._update()
            if (ball.playNote == true) {
                playNote(ball.note)
            }
        });
    }, 50);
    
}


// setInterval(() => {
//     console.log(balls);
// }, 10000);
//let notes = ["C3", "D3", 'E3', 'G3', 'A3'];

function changeNotes() {
    music.update();
    let notes = music.getScale();

    balls.forEach(ball => {
        let note = _.sample(notes)
        ball.setNote(note)
    });
}

changeNotes()
if (interactiveMode) {
    readline.emitKeypressEvents(process.stdin);

    process.stdin.on('keypress', (ch, key) => {
        balls.push(getNewBall(ch))
        if (key && key.ctrl && key.name == 'c') {
            process.stdin.pause();
        }
        console.log('got "keypress"', ch, key);
        if (key && key.name == 'b') {
            changeNotes();
        }
    });

    process.stdin.setRawMode(true);
}


console.log(channel);