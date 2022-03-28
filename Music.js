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
        let next = transpose(this.tonic, 'P5');
        this.tonic = next;
    }

    getChord(){
        let choice = _.sample(this.chordtypes);
        console.log(choice, this.tonic);
        let chord = Chord.getChord(choice, this.tonic)
        return chord.notes
    }

    update(){
        this.setNextTonic();
        this.updateScale();
    }
}
