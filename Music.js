import _ from 'lodash';
import { Interval, Scale, Chord } from '@tonaljs/tonal';

export default class Music {
    constructor(tonic) {
        this.tonic = tonic;
        this.scale = () => Scale.get(`${tonic} pentatonic`).notes

        this.chordtypes = Scale.scaleChords("pentatonic");

        // Give a random chance to tranpose the scale and tonic down -- NOT IMPLEMENTED YET
        this.transposeRandomChance = true
    }

    // Set new notes for the scale
    updateScale() {
        console.log('updating scale');
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
        let currentScale = this.getScale();
        switch (face) {
            case 'up':
                return currentScale[0]
            case 'front':
                return currentScale[1]
            case 'back':
                return currentScale[2]
            case 'left':
                return currentScale[3]
            case 'right':
                return currentScale[4]
            default:
                return _.sample(currentScale)
        }
    }

    update() {
        this.setNextTonic();
        this.updateScale();
    }
}
