pragma circom 2.0.0;

include "./utils/poseidon.circom";

template Passcode() {
    signal input addr;
    signal input secret;
    signal output out; 

    
    component hash = Poseidon(2);

    hash.inputs[0] <== (addr + secret);
    hash.inputs[1] <== 258741369;
    out <== hash.out; 
}

component main {public [addr]} = Passcode();