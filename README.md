# Web3Project Hongbao 

## 主要功能
1. 拼手气口令红包
2. 猜数字游戏红包（未完成）
3. （准备中）

## 智能合约设计
### 背景
请求智能合约api的数据是全部公开的，可以再浏览器中轻松查询，因此口令需要加密，防止交易后口令泄露。
红包有发和领两个动作，发红包需要加密，且领红包时的口令不仅要加密而且有几份红包就需要有几个不同的口令，防止同一口令被轻松复制重入。

### 设计
<img src="./images/design_hash.png" alt="icon"/>

#### 发红包
传入参数
1. hash(口令)
2. n个二次hash的值，为[hash(hash(口令+1)), hash(hash(口令+2)),...,hash(hash(口令+n))]

#### 领红包
传入参数
1. hash(口令)
2. hash(口令+k) k为1~n中任意一个数

这种设计下口令不会在链上被泄露，能保障安全。
同时前端需要额外处理这部分hash的转换。
而因为k不能重复使用，需要一个可并发的接口来获取k的最新值，每次获取后k+1。
因为链上写入成本高体验差，k的处理需要引入后端。
关键部分的红包发和领取是在链上的，保证安全可靠。

项目使用hardhat搭建
```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/xxx.js
```
