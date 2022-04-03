import { room, start, music, playNote } from "./resonance.js"
import _ from "lodash";

export default class Ball {
    constructor(face) {
        this.face = face
        this.x = start.x,
        this.y = start.y + 1,

        this.xspeed = _.random(-3, 3, true);
        this.yspeed = _.random(0.5, 6, true);;

        this.velocity = 3;

        this.massSpeed = _.random(0.2, 0.3);
        this.maxMass = 7;
        this.minMass = 0.5;
        this.massDecay = 0.95
        this.mass = this.maxMass;
        
        this.note = music.getNote(this.face)
        this.playNote = false;
        this.volume = 100;
        this.filter = 100;
        
        this.log = console.log(this)
        
        
        this.active = true;
        this.initplay = playNote(this.note, this.volume, this.filter)

        // Amount of bounces a ball can do in total
        this.lifetime = _.random(6, 8);
        this.lifetimeCounter = 0;
    }

    setNote(note){
        this.note = note;
    }

    getNote(){
        return this.note
    }

    getParams(){
        return {vol: this.volume, fil: this.filter}
    }

    move(){
        this.x += this.xspeed * this.velocity;
        this.y += this.yspeed * this.velocity;
        console.log('moving', this.x, this.y);
    }

    getDirection(){
        if (!this.active) return false;
        console.log(this.x, 'mapped:', this.x /3);
        return {
            x: this.x / 3,
            y: this.y / 9
        }

    }

    checkLifetime(){
        if (!this.active) return;
        if (this.lifetimeCounter == this.lifetime){ 
            this.active = false;
            console.log('ball stopped');
        } 
    }

    checkWallCollision(){
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
            this.xspeed *= -1;
            console.log('bounced on x-axis');
        }

        if (this.y >= room.ymin) {
            // put ball back in bounds of room
            this.y = room.ymin + 1;
            // Invert y vector
            this.yspeed *= -1;
            console.log('bounced on y-axis');
        }
        if (this.y <= room.ymax) {
            // put ball back in bounds of room
            this.y = room.ymax - 1;
            // Invert y vector
            this.yspeed *= -1;
            console.log('bounced on y-axis');
        }
    }

    changeMass() {
        // let sameChance = -_.random(0, 2);
        // if (sameChance == 2) {
        //     this.mass = this.maxMass;
        //     return;
        // }

        this.maxMass *= this.massDecay
        this.massSpeed += 0.2

        this.mass = this.maxMass

        this.filter *= 0.8
        this.volume *= 0.8

        //Increment the lifetime counter now trhat ball has bounced
        this.lifetimeCounter++;

        // diminish velocity maybe?
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

    
        
        

        //change velocity
        //change timer a bit
    }





}