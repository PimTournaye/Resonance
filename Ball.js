import { room, start, music, playNote } from "./resonance.js"
import _ from "lodash";

export default class Ball {
    constructor(face) {
        this.face = face
        this.x = start.x,
        this.y = start.y,

        this.xspeed = _.random(-3, 3, true);
        this.yspeed = _.random(0.5, 6, true);;

        this.velocity = 1;

        this.mass = 0.4;
        this.massSpeed = _.random(0.01, 0.05);
        this.maxMass = 1.2;
        this.minMass = 0.05;

        this.note = _.sample(music.getScale());
        this.playNote = false;
        this.initplay = playNote(this.note)

        this.active = true;

        // Amount of bounces a ball can do in total
        this.lifetime = _.random(3, 5);
        this.lifetimeCounter = 0;
    }

    setNote(note){
        this.note = note;
    }

    getNote(){
        return this.note
    }

    move(){
        this.x += this.xspeed * this.velocity;
        this.y += this.yspeed * this.velocity;
    }

    checkLifetime(){
        if (!this.active) return;
        if (this.lifetimeCounter == this.lifetime){ 
            this.active = false;
            console.log('ball stopped');
        } 
    }

    checkWallCollision(){
        if (this.x == room.xmin || this.x == room.xmax) {
            this.xspeed *= -1;
        }

        if (this.y == room.ymin -1 || this.y == room.ymax) {
            this.yspeed *= -1
        }
    }
    changeMass() {
        // let sameChance = -_.random(0, 2);
        // if (sameChance == 2) {
        //     this.mass = this.maxMass;
        //     return;
        // }

        this.maxMass *= 0.8
        this.massSpeed += 0.02

        this.mass = this.maxMass

        //Increment the lifetime counter now trhat ball has bounced
        this.lifetimeCounter++;

        // diminish velocity maybe?
        // if velocity is too low, splice Ball from list
    }

    _update() {
        // Check if ball is still active
        if (!this.active) return;
        if (this.mass <= this.minMass) {
            this.checkLifetime()
            console.log('bang!');
            this.playNote = true;
            this.changeMass();
        } else this.playNote = false;
        this.mass = this.mass - this.massSpeed;
        this.checkWallCollision()
        //change velocity
        //change timer a bit
    }





}