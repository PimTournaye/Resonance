//const Max = require('max-api');

//const { SimplexNoise } = require('simplex-noise');
import {WebMidi} from "webmidi";

WebMidi
    .enable()
    .then(onEnabled)
    .catch(err => alert(err));
// Function triggered when WebMidi.js is ready
function onEnabled() {

    output = WebMidi.getOutputByName("IAC Driver Bus 1");
    channel = output.channels[1];
}

import Music from './Music.js'
import Ball from './Ball.js'
import { WebMidi } from 'webmidi';

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


let tonic = "C3";

let balls = [];

let ball1 = new Ball('1');
let ball2 = new Ball('1');
let ball3 = new Ball('1');
let music = new Music(tonic)

setInterval(() => {
    ball1.update()
    if (ball1.playNote == true) {
        WebMidi.play(ball1.getNote())
    }
    console.log(ball1.mass);
}, 50);

function changeNotes() {
    music.update();
    
}


