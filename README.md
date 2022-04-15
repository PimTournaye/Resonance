# Setup

Requirements:

- Ableton Live Suite or Max MSP
- Node.js
- TouchDesigner

If you use Max MSP, please go directly to the next section, otherwise follow along.

## Configuration

This will install all the necessary packages to make the script work. Before we run the main script, let's take a look at the `config.js` file.

Here you can change the most important values to make the script work. Make sure you specify the name of the MIDI device you want to output to from the script. Also make sure that this MIDI has at least 5 channels (although this the case most of the time.) If you have no MIDI device, you can make use of a virtual MIDI port, such as [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html).

## Setup for Max MSP

If running this script through Max, please open the patch in this folder and be sure to add the following nodes:

```max-msp
(npm install)           //clickable box
|
----- (script start)    //clickable box
|
[node.script resonance.js]
```

## Setup in Node.js

To setup the neccesarry packages for the script, open this folder in the terminal and run the following command:

```
npm install
```

## Setup in Ableton

Max4Live devices used:

- [OSC Receiver](https://maxforlive.com/library/device/7752/osc-receiver-osc-in)
- [ml.distance](https://maxforlive.com/library/device/7822/ml-distance-doppler)