import Music from './Music.js'
import Ball from './Ball.js'
import { TD_PORT, ABLETON_PORT, active, interactiveMode, maxMSP, MIDI_DEVICE_NAME, INTERVAL_TIMER, KEY_CHANGE_TIMER, modeMIDI, keyChangeEvent } from './config.js';

import { WebMidi } from 'webmidi';
import _ from 'lodash';
import readline from 'readline';
import { Client } from 'node-osc';

if (maxMSP) {
    const Max = require('max-api');
}

// Set up OSC clients to send data to
export const TD_OSC_CLIENT = new Client('127.0.0.1', TD_PORT);
export const ABLETON_OSC_CLIENT = new Client('127.0.0.1', ABLETON_PORT);

// export these variables for the Ball.js class so it has it's own channel
export let channel, output

// Somehow, this made OSC work at start, I'm leaving it here for now
let test = () => {
    TD_OSC_CLIENT.send('/test', 100, () => {
        //TD_OSC_CLIENT.close();
    });
}
test();

// Room dimensions to simulate the church
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

// Music class setup
let tonic = "C3";
export let music = new Music(tonic)

// Array for all the balls
export let balls = [];

// Allow the key to change after some time has passed
let keyChangeTrigger = true;

export let timeout;

///////////
// MIDI ///
///////////

if (modeMIDI) {
WebMidi
    .enable()
    .then(() => {
        console.log('WebMIDI enabled!');
        output = WebMidi.getOutputByName(MIDI_DEVICE_NAME);
        channel = output.channels[1];
    })
    .catch(err => console.log(err));
}
///////////////////////
// HELPER FUNCTIONS ///
///////////////////////

// enable the key change event countdown
export function enableKeyChangeCountdown() {
    timeout = setTimeout(() => {
        changeNotes();
        console.log('key change triggered, changed notes');
    } , KEY_CHANGE_TIMER);
}
// Function that makes new balls
function getNewBall(face) {
    console.log('creating new ball - ', face);
    //
    if (keyChangeEvent) {
        console.log('key change countdown stopped');
        clearTimeout(timeout);
        keyChangeTrigger = true;
    }
    return new Ball(face);
}

// Extra function to check if a ball is out of bounces and delete it if it is, it could help with performance
function checkDeleteBall(obj) {
    if (!obj.active) {
        obj = null;
    } else return;
}

// Function that changes the notes of the music
function changeNotes() {
    music.update();
    let notes = music.getScale();
    balls.forEach(ball => {
        // set the note of a ball depending on what face it is on in a switch case --- refactor this to use the music object methods
        switch (ball.face) {
            case 'top':
                ball.setNote(notes[0])
                break;
            case 'right':
                ball.setNote(notes[1])
                break;
            case 'bottom':
                ball.setNote(notes[2]);
                break;
            case 'left':
                ball.setNote(notes[3]);
                break;
            case 'front':
                ball.setNote(notes[4]);
                break;
        }

    });
}

// Function that scales a number from one range to another
export function scale(number, fromLeft, fromRight, toLeft, toRight) {
    return toLeft + (number - fromLeft) / (fromRight - fromLeft) * (toRight - toLeft)
}

// This function is called every time a balls collide, but this doesn't work for some reason, maybe for the better
function checkBallCollisions() {
    const radiusThreshold = 50
    balls.forEach(ball => {
        const current = ball;
        const currentCoords = ball.getPosition();

        balls.forEach(ball => {
            if (ball == current) return;
            if (ball.x == currentCoords.x + radiusThreshold || ball.x == currentCoords.x - radiusThreshold) {
                changeNotes();
                ball.xspeed *= -1;
                current.xspeed *= -1;
                console.log('balls collided');
            } else if (ball.y == currentCoords.y + radiusThreshold || ball.y == currentCoords.y - radiusThreshold) {
                changeNotes();
                ball.yspeed *= -1;
                current.yspeed *= -1;
                console.log('balls collided');
            }
        });
    });
}

// UPDATE LOOP FOR EVERY BALL
function ballUpdate(ball) {
    ball._update()
    checkDeleteBall(ball)
}

// MAIN LOOP FOR THE WHOLE SCRIPT
if (active) {
    // MAIN LOOP
    setInterval(() => {
        balls = balls.filter(e => {
            return e.active !== false;
        })
        if (balls.length != 0) {
            balls.forEach(ball => {
                ballUpdate(ball)
            }); 
            checkBallCollisions();
        } else if (keyChangeEvent && keyChangeTrigger) {
            if (balls.length == 0) {
                console.log('All balls stopped, starting key change countdown');
                keyChangeTrigger = false;
                // Start the key change event
                timeout = enableKeyChangeCountdown();
                
            }
        }
    }, INTERVAL_TIMER);
}

// KEYBOARD CLI INPUT
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
            playNote(music.getChord(), 100, 100, 1)
        }
    });
    process.stdin.setRawMode(true);
}

// Max MSP INPUT
if (maxMSP) {
    Max.addHandler('input', (command) => {
        switch (command) {
            case 'up':
                balls.push(getNewBall('up'))
                break;
            case 'front':
                balls.push(getNewBall('front'))
                break;
            case 'back':
                balls.push(getNewBall('back'))
                break;
            case 'left':
                balls.push(getNewBall('left'))
                break;
            case 'right':
                balls.push(getNewBall('right'))
                break;
            default:
                console.log('Max MSP input error');
                break;
        }
    });
}