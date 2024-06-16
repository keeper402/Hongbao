# Web3Project Hongbao 

## 主要功能
1. 拼手气口令红包
2. 猜数字游戏红包（未完成）
3. （准备中）

## 智能合约设计
### 背景
请求智能合约api的数据是全部公开的，可以在区块链浏览器中轻松查询。
因此发红包和领红包时，口令需要加密，防止交互合约后口令泄露。


### 设计
口令记为k
#### 发红包
合约把passwordHash=Poseidon(keccak(k))存到链上

#### 领红包
使用zk-SNARK技术来证明，领取人知道口令。
先简单解释一下原理，因为零知识证明SNARK的实际理论非常复杂， 我们简化一下来解释：
我是证明人，你是验证人，我要向你证明我知道密码。
1. 常规做法
把明文密码给你看，你看了对比发现一致就证明结束。
2. zk做法
而使用zk的情况下，可以让我把明文密码隐藏，通过一系列计算，得出证明内容。
根据证明内容，验证者可以通过计算得知你知道密码。
因为只有知道密码的人才可能得出这份证明。
对于当前场景，只看证明的内容不去考虑密码学上的加密的话，这个证明的内容是：
我知道Poseidon(keccak(k))=passwordHash。
zk-SNARK通过加密的方式隐藏了k，但是给出了计算过程。同时能从密码学的角度验证正确性。

这就解决了核心问题：我不想透露口令k，但是想让验证人确信我知道口令k。

额外的问题：
证明过程如果被别人复制，是不是也可以让验证者认为知道口令？
理论上是这样，所以我们要对证明内容进行改造。
我要证明的内容Poseidon(keccak(address+sub))=passwordHash。
注：其中address+sub=k。输入内容从单一的k，改为两个参数address和sub
由于每个领取人的address都不同，所以证明即使被盗用，也不能使用，因为证明只适用于固定地址。

项目使用hardhat搭建
```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/xxx.js
```
