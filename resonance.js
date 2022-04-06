//const Max = require('max-api');

import Music from './Music.js'
import Ball from './Ball.js'
import { SimplexNoise } from 'simplex-noise';
import { WebMidi } from 'webmidi';
import { Scale } from '@tonaljs/tonal';
import _ from 'lodash';
import readline from 'readline';

import { Client, Bundle } from 'node-osc';

//const client = new Client('127.0.0.1', 9000);
const client = new Client('localhost', 9000);


let test = () => {
client.send('/test', 100, () => {
  //client.close();
});
}
let channel, output, interactiveMode, active;

test();
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

export function playNote(note, vol, fil) {
    test()
    console.log('playing note', note);
    const bundle = new Bundle(['/vol', vol], ['/fil', fil]);
    client.send(bundle);
    // client.send('/vol', vol, () => {
    //     client.close();
    //   });
    // client.send('/fil', fil, () => {
    //     client.close();
    //   });
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

function sendPanData(x, y) {
    if (x == false || y == false) {
        return;
    }
    const bundle = new Bundle(['/panX', x], ['/panY', y]);
    client.send(bundle);
}

function checkBallCollisions(params) {
    const radiusThreshold = 15
    balls.forEach(ball => {
        const current = ball;
        const currentCoords = ball.getDirection()
        balls.forEach(ball => {
            if (ball == current) return;
            if (ball.x == currentCoords.x + radiusThreshold || ball.x == currentCoords.x - radiusThreshold){
                changeNotes();
                ball.invertVector(ball.xspeed)
            } else if (ball.y == currentCoords.y + radiusThreshold || ball.y == currentCoords.y - radiusThreshold) {
                changeNotes();
                ball.invertVector(ball.yspeed)
            }
        });  
    });
}


// UPDATE LOOP FOR EVERY BALL
function ballUpdate(ball) {
    ball._update()
    checkDeleteBall(ball)

    // Get XY coords for panning
    let coords = ball.getDirection()
    sendPanData(coords.x, coords.y)
    checkBallCollisions();
    // Check to see if ball plays a note
    if (ball.playNote && ball.active) {
        const params = ball.getParams();
        playNote(ball.note, params.vol, params.fil)
    }
}


// MAIN LOOP

if (active) {
    changeNotes()
    // MAIN LOOP
    setInterval(() => {
        balls.forEach(ball => {
            ballUpdate(ball)
        });
        balls = balls.filter(e  => {
            return e !== null;
        })
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
            playNote(music.getChord(), { duration: 10000 }, 100, 100)
        }
    });

    process.stdin.setRawMode(true);
}