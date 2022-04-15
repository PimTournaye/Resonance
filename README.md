# Setup
Requirements:
- Ableton Live Suite or Max MSP
- Node.js
- TouchDesigner
  
## Configuration
This will install all the necessary packages to make the script work. Before we run the main script, let's take a look at the `config.js` file.

Here you can change the most important values to make the script work. Make sure you specify the name of the MIDI device you want to output to from the script. Also make sure that this MIDI has at least 5 channels (although this the case most of the time.) If you have no MIDI device, you can make use of a virtual MIDI port, such as [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html).

Also be sure to adjust the boolean values to fit however you will be using the script.

If you use Max MSP, please go directly to the next section, otherwise skip over it.

## Setup for Max MSP
If running this script through Max, please open the patch in this folder and be sure to add the following nodes:

```max-msp
(npm install)           //clickable box
|
----- (script start)    //clickable box
|
[node.script resonance.js]
```

The node.script box will accept one of the following messages and react accordingly:
- front
- up
- back
- left
- right

More info on setting up Node for Max can be found [here](https://cycling74.com/articles/node-for-max-intro-%E2%80%93-let%E2%80%99s-get-started).

Also make sure to add an envelope follower to each channel and send their value to TouchDesigner through OSC on port 8000. The address should be the same as the face being hit.

## Setup in Node.js
To setup the neccesarry packages for the script, open this folder in the terminal and run the following command:

```
npm install
```

## Setup in Ableton
Max4Live devices used:

- [OSC Receiver](https://maxforlive.com/library/device/7752/osc-receiver-osc-in)
- [ml.distance](https://maxforlive.com/library/device/7822/ml-distance-doppler)
- Envelope Follower
- OSC Send

Set up a track for every face and make sure it only receives MIDI signals from it's corresponding channel.
Add the listed M4L devices to each track before we can set them up. 

## OSC Messages
There's a range of OSC messages being sent.
Every ball that bounces sends its data the `/balls/` followed by its face, address. For example: `/balls/front/`. You have the following addresses for each face.

- vol
- fil
- panX
- panY

For example: `balls/front/panX`.

But Ableton or Max MSP also sends envelope follower data to TouchDesigner on port 8000. That data should be send on the address with same name as the face being used. For example: `/front`

### Messages to Ableton / Max MSP
Set up OSC Receiver to listen to the correct port and configure it as specified in the OSC Messages section.

Map those values to their corresponding operators in Ableton, or wherever you feel like. Make sure to play around with the Min and Max values in OSC Receiver, to fine tune mapping even more.

Once OSC Receiver, ml.distance and their values have been assigned, we need to configure the Envelope Follower and send its value with OSC Send on port 8000. Play around with the Envelope Follower rise, decay and other knobs to get the kind of figure you are looking for. Macro that value to an Audio Effect Rack and map that same knob in the rack to OSC send. Send to the address of the corresponding face. For example: `/front`.

### Messages to TouchDesigner
These messages should be imported with the OSC In CHOP, listening on the configured port as listed in `config.js`.
There is a second port listening on port 8000 that will help emulate lights.

## Running the script

If you are using Max MSP, click the `npm install` button (only need to be done once, not every time the patch needs to run or open), followed by the `script start` button.

If you are not using Max MSP, then open this folder in you terminal and enter the following command:
```
node resonance.js
```

The script should start running. If you are running interactive mode (keyboard input), double check what buttons will correspond to what faces and test that you can stop the script when pushing `Q` on your keyboard.



