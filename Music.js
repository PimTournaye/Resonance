import _ from 'lodash';
import { Interval, Scale, Chord } from '@tonaljs/tonal';

export default class Music {
    constructor(tonic) {
        this.tonic = tonic;
        this.scale = this.updateScale()

        this.chordtypes = Scale.scaleChords("pentatonic");

        // Give a random chance to tranpose the scale and tonic down -- NOT IMPLEMENTED YET
        this.transposeRandomChance = true
    }

    // Set new notes for the scale
    updateScale() {
        const newScale = Scale.get(`${this.tonic} pentatonic`).notes ;
        this.setScale(newScale);
    }

    getScale() {
        return this.scale
    }

    setScale(scale) {
        this.scale = scale;
    }

    // Generate a new tonic
    setNextTonic() {
        // Get a random note from the current scale
        let newTonic = _.sample(this.scale)

        // If the new tonic is too high in the register, transpose it down
        if (parseInt(newTonic) >= 5) {
            let distance = Interval.distance(this.tonic, newTonic)
            let next = Interval.transpose(this.tonic, Interval.invert(distance))
            this.tonic = next
        } else {
            this.tonic = newTonic;
        }
    }

    getChord() {
        let choice = _.sample(this.chordtypes);
        let chord = Chord.getChord(choice, this.tonic)
        return chord.notes
    }

    getNote(face) {
        if (this.scale == undefined) {
            this.updateScale();
        }
        switch (face) {
            case 'up':
                return this.scale[0]
            case 'front':
                return this.scale[1]
            case 'back':
                return this.scale[2]
            case 'left':
                return this.scale[3]
            case 'right':
                return this.scale[4]
            default:
                return _.sample(this.scale)
        }
    }

    update() {
        this.setNextTonic();
        this.updateScale();
    }
}
