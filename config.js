// PORTS FOR OSC
export const TD_PORT = 9000;
export const ABLETON_PORT = 9001;

// Time between each loop update
export const INTERVAL_TIMER = 50;

// MIDI INPUT / OUTPUT DEVICE -- CHANGE TO THE DEVICE YOU WANT TO USE
export const MIDI_DEVICE_NAME = 'loopMIDI';

// booleans for startup / init
export let interactiveMode, active, maxMSP;
active = true   // actives the main loop if true
interactiveMode = true;   // if true, the balls will be created by the user with keyboard input
maxMSP = false; // if true, the program will function as if it's a Max MSP project