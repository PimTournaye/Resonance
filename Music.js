import { Scale, Interval, transpose } from 'tonal';

export default class Music {
    constructor(tonic){
        this.tonic = tonic;
        this.scale = this.getScale(tonic)

        this.transposeNow = false
    }

    updateScale(tonic) {
        this.scale = Scale.notes(this.tonic, 'pentatonic')
        return this.scale
    }

    setNextTonic() {
        let next = transpose(this.tonic, 'P5');
        this.tonic = next;
    }

    getScale(){
        return this.scale
    }

    update(){
        this.setNextTonic();
        this.updateScale();
    }
}