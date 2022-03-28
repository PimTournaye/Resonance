import _ from 'lodash';
import pkg from '@tonaljs/tonal';
const {Chord, transpose } = pkg;;
import { Scale } from '@tonaljs/tonal';

let initScale = (tonic) => Scale.get(`${tonic} pentatonic`).notes


export default class Music {
    constructor(tonic){
        this.tonic = tonic;
        this.scale = initScale(tonic)

        this.chordtypes = Scale.scaleChords("pentatonic");

        this.transposeNow = false
    }

    updateScale() {
        console.log('updating scale');
        this.setScale(Scale.get(`${this.tonic} pentatonic`).notes)
        return this.scale
    }

    getScale(){
        return this.scale
    }
    
    setScale(scale){
        this.scale = scale;
    }
    
    setNextTonic() {
        // check for different transpositions, set in a check so it don't increase too much every time and moves around a bit
        let next = transpose(this.tonic, 'P5');
        this.tonic = next;
    }

    getChord(){
        let choice = _.sample(this.chordtypes);
        console.log(choice, this.tonic);
        let chord = Chord.getChord(choice, this.tonic)
        return chord.notes
    }

    getNote(face){
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

    update(){
        this.setNextTonic();
        this.updateScale();
    }
}
