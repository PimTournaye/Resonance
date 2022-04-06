import { room, start, music, playNote, scale } from "./resonance.js"
import _ from "lodash";

export default class Ball {
    constructor(face) {
        this.face = face
        this.x = start.x,
            this.y = start.y + 1,

        this.xspeed = _.random(-3, 3, true);
        this.yspeed = _.random(0.5, 6, true);;

        this.velocity = 10;

        this.massSpeed;
        this.maxMass;
        this.minMass = 0.5;
        this.massChange;
       
        // this.massSpeed = _.random(0.2, 0.3);
        // this.maxMass = 7;
        // this.minMass = 0.5;
        // this.massChange = 1.4
        // this.mass = this.maxMass;

        this.note = music.getNote(this.face)
        this.playNote = false;
        this.volume = 100;
        this.filter = 100;

        this.log = console.log(this)


        this.active = true;
        this.initplay = playNote(this.note, this.volume, this.filter)
        this.initProps = this.setProps()

        this.mass = this.maxMass;

        // Amount of bounces a ball can do in total
        this.lifetime = _.random(6, 8);
        this.lifetimeCounter = 0;
    }

    setProps(){
        switch (this.face) {
            case 'up':
                this.massSpeed = 0.3;
                this.maxMass = 7;
                this.massChange = 1.4;
                break;
        
            case 'front':
                this.massSpeed = 0.6;
                this.maxMass = 7;
                this.massChange = 1.2;
                break;
        
            case 'back':
                this.massSpeed = 0.2;
                this.maxMass = 3;
                this.massChange = 1.7;
                break;
        
            case 'left':
                this.massSpeed = 0.5;
                this.maxMass = 12;
                this.massChange = 1.05;
                break;
        
            case 'right':
                this.massSpeed = 0.25;
                this.maxMass = 9;
                this.massChange = 1.3;
                break;
        
            default:
                break;
        }
    }

    setNote(note) {
        this.note = note;
    }

    getNote() {
        return this.note
    }

    getParams() {
        return { vol: this.volume, fil: this.filter }
    }

    move() {
        this.x += this.xspeed * this.velocity;
        this.y += this.yspeed * (this.velocity * 1.5);
    }

    getDirection() {
        if (!this.active) return false;
        return {
            x: scale(this.x, -300, 300, 0, 100),
            y: scale(this.y, 0, 900, 0, 100)
        }
    }

    checkLifetime() {
        if (this.lifetimeCounter == this.lifetime) {
            this.active = false;
            console.log('ball stopped');
        }
    }

    invertVector(vec) {
        console.log(this.x, this.y);
        console.log(this.xspeed, this.yspeed);
        vec *= -1;
    }

    checkWallCollision() {
        if (this.x <= room.xmin) {
            // put ball back in bounds of room
            this.x = room.xmin + 5;
            // Invert x vector
            this.xspeed *= -1;
            console.log('bounced on x-axis');
        }

        if (this.x >= room.xmax) {
            // put ball back in bounds of room
            this.x = room.xmax - 5;
            // Invert x vector
            this.xspeed *= -1
            console.log('bounced on x-axis');
        }

        if (this.y >= room.ymin) {
            // put ball back in bounds of room
            this.y = room.ymin + 1;
            // Invert y vector
            this.yspeed *= -1
            console.log('bounced on y-axis');
        }
        if (this.y <= room.ymax) {
            // put ball back in bounds of room
            this.y = room.ymax - 1;
            // Invert y vector
            this.yspeed *= -1
            console.log('bounced on y-axis');
        }
    }

    changeMass() {
        this.maxMass *= this.massChange
        this.massSpeed += 0.2

        this.mass = this.maxMass

        this.filter *= 0.8
        this.volume *= 0.6

        //Increment the lifetime counter now trhat ball has bounced
        this.lifetimeCounter++;

        // diminish velocity maybe?
        this.velocity *= 0.8
    }

    _update() {
        // Check if ball is still active
        if (!this.active) return;

        // Check if ball is 'bouncing'
        if (this.mass <= this.minMass) {
            // Check the amount of bounces left
            this.checkLifetime();
            // Change the mass or inbetween bounces
            this.changeMass();
            // Set boolean to play a note
            this.playNote = true;
        } else this.playNote = false;

        // Decrease mass of ball / Z axis
        this.mass -= this.massSpeed;

        // Check if the ball has reached a wall
        this.checkWallCollision()

        // Move the ball to a new position
        this.move() 
    }
}