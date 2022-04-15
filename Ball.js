import { room, start, music, scale, TD_OSC_CLIENT, ABLETON_OSC_CLIENT, output } from "./resonance.js"
import _ from "lodash";
import { Bundle } from 'node-osc';

export default class Ball {
    constructor(face) {
        this.face = face;
        this.x = start.x,
        this.y = start.y + 1;

        this.xspeed = _.random(-3, 3, true);
        this.yspeed = _.random(0.5, 6, true);

        this.velocity = 10;

        // Most of these get values assigned later down the constructor chain
        this.massSpeed;
        this.maxMass;
        this.minMass = 0.5;
        this.massChange;
        // Amount of bounces a ball can do in total
        this.lifetime = _.random(6, 8);
        this.lifetimeCounter = 0;
        
        // this.massSpeed = _.random(0.2, 0.3);
        // this.maxMass = 7;
        // this.minMass = 0.5;
        // this.massChange = 1.4
        // this.mass = this.maxMass;
        
        this.note = music.getNote(this.face);
        this.volume = 100;
        this.filter = 100;
        
        
        // MIDI channel gets 
        this.channel;
        // Output for WebMIDI.js
        this.MIDIChannel;
        
        // Bool to see if ball has expired / is still active
        this.active = true;
        // Initial properties based on face of the cube
        this.initProps = this.setProps();
        //this.log = console.log(this);
        
        // Set mass after props are set
        this.mass = this.maxMass;
        // Play a note when hit
        this.initplay = this._playNote(this.note)

    }

    _playNote(note) {
        const bundle = new Bundle([`/balls/${this.face}/vol`, this.volume], [`/balls/${this.face}/fil`, this.filter]);
        TD_OSC_CLIENT.send(bundle);
        ABLETON_OSC_CLIENT.send(bundle, () => {
            this.MIDIChannel.playNote(note, { duration: 400 });
        });
    }

    sendPanData() {
        let mappedCoords = this.getDirection();
        // Raw data to TouchDesigner
        const rawBundle = new Bundle([`/balls/${this.face}/rawX`, this.x], [`/balls/${this.face}/rawY`, this.y])
        // Mapped values to use percentages in Ableton
        const mappedBundle = new Bundle([`/balls/${this.face}/panX`, mappedCoords.x], [`/balls/${this.face}/panY`, mappedCoords.y]);
        TD_OSC_CLIENT.send(rawBundle);
        ABLETON_OSC_CLIENT.send(mappedBundle);
    }
    
    // Set the properties for each individual ball based on the face
    // Feel free to change these values to your liking
    setProps(){
        switch (this.face) {
            case 'up':
                this.massSpeed = 0.3;
                this.maxMass = 7;
                this.massChange = 1.4;
                
                this.channel = 1;
                break;
                
                case 'front':
                this.massSpeed = 0.6;
                this.maxMass = 7;
                this.massChange = 1.2;

                this.channel = 2;
                break;
        
            case 'back':
                this.massSpeed = 0.2;
                this.maxMass = 3;
                this.massChange = 1.7;

                this.channel = 3;
                break;
        
            case 'left':
                this.massSpeed = 0.5;
                this.maxMass = 12;
                this.massChange = 1.05;

                this.channel = 4;
                break;
        
            case 'right':
                this.massSpeed = 0.25;
                this.maxMass = 9;
                this.massChange = 1.3;

                this.channel = 5;
                break;
        
            default:
                console.log('error in Ball setup');
                this.active = false;
                break;
        }
        this.MIDIChannel = this.setMIDIchannel();
    }

    // Give each face a MIDI individual channel
    setMIDIchannel(){
        let channels = output.channels;
        return channels[this.channel]
    }

    setNote(note) {
        this.note = note;
    }

    getNote() {
        return this.note;
    }

    move() {
        this.x += this.xspeed * this.velocity;
        this.y += this.yspeed * this.velocity;
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

    checkWallCollision() {
        if (this.x <= room.xmin) {
            // put ball back in bounds of room
            this.x = room.xmin + 5;
            // Invert x vector
            this.xspeed *= -1;
            console.log(this.face, 'bounced on x-axis');
        }

        if (this.x >= room.xmax) {
            // put ball back in bounds of room
            this.x = room.xmax - 5;
            // Invert x vector
            this.xspeed *= -1
            console.log(this.face,'bounced on x-axis');
        }

        if (this.y >= room.ymin) {
            // put ball back in bounds of room
            this.y = room.ymin + 1;
            // Invert y vector
            this.yspeed *= -1
            console.log(this.face,'bounced on y-axis');
        }
        if (this.y <= room.ymax) {
            // put ball back in bounds of room
            this.y = room.ymax - 1;
            // Invert y vector
            this.yspeed *= -1
            console.log(this.face,'bounced on y-axis');
        }
    }

    changeMass() {
        // Change the time inbetween bounces
        //this.maxMass *= this.massChange;
        
        // Speed up the bounce ever time it bounces
        //this.massSpeed += 0.2;

        // Reset the current mass to the max possible
        this.mass = this.maxMass;

        // Diminish values for audio effects
        this.filter *= 0.8;
        this.volume *= 0.6;

        //Increment the lifetime counter now trhat ball has bounced
        this.lifetimeCounter++;

        // Stop moving around as much, but still keep moving
        this.velocity *= 0.8
    }

    _update() {
        // Check if ball is still active
        if (!this.active) return;
        this.checkLifetime();

        //Send panning data
        this.sendPanData();
        // Check if ball is 'bouncing'
        if (this.mass <= this.minMass) {
            // Change the mass or inbetween bounces
            this.changeMass();
            // Set boolean to play a note
            this._playNote(this.note, this.vol, this.fil);
        }
        // Decrease mass of ball / Z axis
        this.mass -= this.massSpeed;

        // Check if the ball has reached a wall - invert vectors if needed
        this.checkWallCollision();

        // Move the ball to a new position
        this.move();
    }
}