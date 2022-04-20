
// booleans for startup / init
export let interactiveMode, active, maxMSP, modeMIDI, keyChangeEvent;
active = true   // actives the main loop if true, mostly is here to see if everything sets up correctly
interactiveMode = true;   // if true, the balls will be created by the user with keyboard input, check which buttons in resonance.js near the bottom of the file
maxMSP = false; // if true, the program will function as if it's a Max MSP project
modeMIDI = true // if true, the program will function as if talking to a MIDI device
keyChangeEvent = true // if true, this will trigger a key change if there are no balls for a certain amount of time (configured in KEY_CHANGE_TIMER below)

// MIDI INPUT / OUTPUT DEVICE -- CHANGE TO THE DEVICE YOU WANT TO USE
export const MIDI_DEVICE_NAME = "IAC Driver Bus 1";
// Time needed to change the scale after inactivity
export const KEY_CHANGE_TIMER = 10000;

// Time between each loop update
export const INTERVAL_TIMER = 50;
// PORTS FOR OSC
export const TD_PORT = 9000;
export const ABLETON_PORT = 9001;

