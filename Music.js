import _ from 'lodash';
import { Interval, Scale, Chord } from '@tonaljs/tonal';
import maxMSP from './config.js'

let initScale = (tonic) => Scale.get(`${tonic} pentatonic`).notes


export default class Music {
    constructor(tonic) {
        this.tonic = tonic;
        this.scale = initScale(tonic)

        this.chordtypes = Scale.scaleChords("pentatonic");

        // Give a random chance to tranpose the scale and tonic down -- NOT IMPLEMENTED YET
        this.transposeRandomChance = true
    }

    // Set new notes for the scale
    updateScale() {
        console.log('updating scale');
        this.setScale(Scale.get(`${this.tonic} pentatonic`).notes)
        return this.scale
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
        if (newTonic.parseInt() >= 5) {
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
        let scale = this.getScale()
        switch (face) {
            case 'up':
                return scale[0]
            case 'front':
                return scale[1]
            case 'back':
                return scale[2]
            case 'left':
                return scale[3]
            case 'right':
                return scale[4]
            default:
                return _.sample(scale)
        }
    }

    update() {
        this.setNextTonic();
        this.updateScale();
    }
}
