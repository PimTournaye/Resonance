import { room, start, music } from "./resonance.js"
import _ from "lodash";

export default class Ball {
    constructor(face) {
        this.face = face
        this.x = start.x,
        this.y = start.y,

        this.mass = 0.4;
        this.massSpeed = 0.01;
        this.maxMass = 1;
        this.minMass = 0.05;

        this.note = _.sample(music.getScale());
        this.playNote = false;

        this.active = true;

        // Amount of bounces a ball can do in total
        this.lifetime = _.random(8, 15);
        this.lifetimeCounter = 0;

    }

    setNote(note){
        this.note = note;
    }

    getNote(){
        return this.note
    }

    checkLifetime(){
        if (!this.active) return;
        if (this.lifetimeCounter == this.lifetime){ 
            this.active = false;
            console.log('ball died');
        } 
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
        //change velocity
        //change timer a bit
    }

    changeMass() {
        let sameChance = -_.random(0, 2);
        if (sameChance == 2) {
            this.mass = this.maxMass;
            return;
        }
        this.massSpeed = _.random(0.01, 0.05);
        this.mass = this.maxMass;

        //Increment the lifetime counter now trhat ball has bounced
        this.lifetimeCounter++;

        // diminish velocity maybe?
        // if velocity is too low, splice Ball from list
    }




}