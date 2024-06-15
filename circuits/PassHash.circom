pragma circom 2.0.0;

include "./utils/poseidon.circom";

template Passcode() {
    signal input addr; // 输入明文
    signal input secret; // 输入密文
    signal output out; // 输出明文

    // hash用波塞冬:
    component hash = Poseidon(3);

    hash.x_in <== (addr + secret); // 输入为addr+secret
    hash.k <== 258741369; // 固定随机数
    out <== hash.out; // 输出为哈希结果
}

component main {public [addr]} = Passcode();