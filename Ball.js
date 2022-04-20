import { room, start, music, scale, TD_OSC_CLIENT, ABLETON_OSC_CLIENT, output} from "./resonance.js"
import _ from "lodash";
import { Bundle } from 'node-osc';
import { maxMSP, modeMIDI, keyChangeEvent } from "./config.js";
import { Note } from "@tonaljs/tonal";

// Check if Max MSP is needed
if (maxMSP) {
    const Max = require("max-api");
}

export default class Ball {
    constructor(face) {
        // Which face of the cube got activated
        this.face = face;
        // Start the ball in the horizontal middle of the room
        this.x = start.x,
            this.y = start.y + 1; // +1 to avoid collision with room walls

        // Randomize the starting x and y speeds
        this.xspeed = _.random(-3, 3, true);
        this.yspeed = _.random(0.5, 6, true);

        // How fast the ball will move through the simulated room
        this.velocity = 10;

        // Most of these get values assigned later down the constructor chain, this
        this.massSpeed;
        this.maxMass;
        this.minMass = 0.5;
        this.massChange;
        // Amount of bounces a ball can do in total
        this.lifetime = _.random(6, 8);
        this.lifetimeCounter = 0;

        // Get the appropriate note depending on the face
        this.note = music.getNote(this.face);
        // Initial percentages of volume and filter
        this.volume = 100;
        this.filter = 100;

        // MIDI channel gets assigned in the setProps function, defining the MIDI channel for each ball / face
        this.channel;
        // Output for WebMIDI.js, also assigned in the setProps function
        this.MIDIChannel;
        // Set a note durection for MIDI notes in milliseconds
        this.noteDurationMIDI = 400;

        // Bool to see if ball has expired / is still active
        this.active = true;
        // Initial properties based on face of the cube
        this.initProps = this.setProps();

        // Set mass after props are set
        this.mass = this.maxMass;
        // Play a note when making a ball!
        this.initplay = this._playNote(this.note)
    }

    _playNote(note) {
        // Get rid of eccecssive accidentals in the note string
        note = Note.simplify(note);

        // Send OSC messages for volume and filter`
        const bundle = new Bundle([`/balls/${this.face}/vol`, this.volume], [`/balls/${this.face}/fil`, this.filter]);
        TD_OSC_CLIENT.send(bundle);
        ABLETON_OSC_CLIENT.send(bundle);
        // Check if the note needs to be played through MIDI
        if (modeMIDI) {
            this.MIDIChannel.playNote(note, { duration: this.noteDurationMIDI });
        }
        // Check if the note needs to be played through Max
        if (maxMSP) {
            let output = note;
            Max.outlet(output);
        } else {
            console.log(`Playing note ${note}`);
        }

    }

    sendPanData() {
        let mappedCoords = this.getPosition();
        // Raw data to TouchDesigner
        const rawBundle = new Bundle([`/balls/${this.face}/rawX`, this.x], [`/balls/${this.face}/rawY`, this.y])
        // Mapped values to use percentages in Ableton
        const mappedBundle = new Bundle([`/balls/${this.face}/panX`, mappedCoords.x], [`/balls/${this.face}/panY`, mappedCoords.y]);

        // Send to the OSC clients
        TD_OSC_CLIENT.send(rawBundle);
        ABLETON_OSC_CLIENT.send(mappedBundle);
    }

    /* 
    Set the properties for each individual ball based on the face
    Feel free to change these values to your liking

    massSpeed: gravity of the ball
    maxMass: The height from which the ball will bounce
    massChange: How much the height / delay of the ball will change when bouncing

    do leave the channel as is, it's used to set the MIDI channel for each ball
    */
    setProps() {
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
                // destroy ball immediately if something goes wrong during setup to avoid further issues
                this.active = false;
                break;
        }
        // Set the MIDI channel
        if (modeMIDI) {
            this.MIDIChannel = this.setMIDIchannel();
        }
    }

    // Give each face a MIDI individual channel
    setMIDIchannel() {
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

    // Return the position of the ball but in percentages
    getPosition() {
        if (!this.active) return false;
        return {
            x: scale(this.x, -300, 300, 0, 100),
            y: scale(this.y, 0, 900, 0, 100)
        }
    }

    // Checks how many bounces a ball has left
    checkLifetime() {
        if (this.lifetimeCounter == this.lifetime) {
            this.active = false;
            console.log(`${this.face} - my ball stopped`);
        }
    }


    // Bounce the ball back if colliding with the walls
    checkWallCollision() {
        if (this.x <= room.xmin) {
            // put ball back in bounds of room
            this.x = room.xmin + 5;
            // Invert x vector
            this.xspeed *= -1;
            console.debug(this.face, 'bounced on x-axis');
        }

        if (this.x >= room.xmax) {
            // put ball back in bounds of room
            this.x = room.xmax - 5;
            // Invert x vector
            this.xspeed *= -1
            console.debug(this.face, 'bounced on x-axis');
        }

        if (this.y >= room.ymin) {
            // put ball back in bounds of room
            this.y = room.ymin + 1;
            // Invert y vector
            this.yspeed *= -1
            console.debug(this.face, 'bounced on y-axis');
        }
        if (this.y <= room.ymax) {
            // put ball back in bounds of room
            this.y = room.ymax - 1;
            // Invert y vector
            this.yspeed *= -1
            console.debug(this.face, 'bounced on y-axis');
        }
    }

    // Changing values of the ball when bouncing / playing a note
    changeMass() {
        // Change the time inbetween bounces
        //this.maxMass *= this.massChange;

        // Speed up the bounce every time it bounces
        //this.massSpeed += 0.2;

        // Reset the current mass to the max possible
        this.mass = this.maxMass;

        // Diminish values for audio effects
        this.filter *= 0.8;
        this.volume *= 0.6;

        //Increment the lifetime counter now that ball has bounced
        this.lifetimeCounter++;

        // Stop moving around as much, but still keep moving
        this.velocity *= 0.8
    }

    // Main loop for a ball
    _update() {
        // Check if ball is still active
        if (!this.active) return;
        this.checkLifetime();

        //Send panning data
        this.sendPanData();
        // Check if ball is 'bouncing' / needs to play a note
        if (this.mass <= this.minMass) {
            // Change the mass and properties of the ball
            this.changeMass();
            // Play your note!
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
