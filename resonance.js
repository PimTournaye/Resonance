//const Max = require('max-api');

import Music from './Music.js'
import Ball from './Ball.js'
import { WebMidi } from 'webmidi';
import _ from 'lodash';
import readline from 'readline';

import { Client, Bundle } from 'node-osc';

const client = new Client('127.0.0.1', 9000);
const client1 = new Client('127.0.0.1', 9001);
//const client = new Client('localhost', 9000);


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
    const bundle = new Bundle(['/vol', vol], ['/fil', fil]);
    client.send(bundle);
    client1.send(bundle);

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

export function scale(number, fromLeft, fromRight, toLeft, toRight) {
    return toLeft + (number - fromLeft) / (fromRight - fromLeft) * (toRight - toLeft)
  }

function sendPanData(x, y) {
    if (x == undefined  || x == false || y == undefined || y == false) return;
    const bundle = new Bundle(['/panX', x], ['/panY', y]);
    client.send(bundle);
    client1.send(bundle);
}

function checkBallCollisions() {
    const radiusThreshold = 50
    balls.forEach(ball => {
        const current = ball;
        const currentCoords = ball.getDirection()
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

    
    // Get XY coords for panning
    let coords = ball.getDirection()
    sendPanData(coords.x, coords.y)
    
    // Send extra raw coords to TD
    const bundle = new Bundle([`/balls/${ball.face}/rawX`, ball.x], [`/balls/${ball.face}/rawY`, ball.y])
    client.send(bundle)

    // Check if balls are colliding
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
        balls = balls.filter(e => {
            return e.active !== false;
        })
        balls.forEach(ball => {
            ballUpdate(ball)
        });
    }, 50);

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
            playNote(music.getChord(), 100, 100)
        }
    });
    process.stdin.setRawMode(true);
}

setInterval(() => {
    console.log(balls);
}, 10000);