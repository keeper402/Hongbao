export default {
    'redPacketAddress': "0x9E7c5438B956f023809dA3fb656640b5a8516229",
    'redPacketABI': '[{"inputs":[{"internalType":"address","name":"verifierAddr","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"AddressInsufficientBalance","type":"error"},{"inputs":[{"internalType":"uint256","name":"passwordHash","type":"uint256"},{"internalType":"uint256[]","name":"proof","type":"uint256[]"}],"name":"claimHongbao","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"passwordHash","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"enum Hongbao.ReceiveType","name":"receiveType","type":"uint8"}],"name":"createHongbao","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"passwordHash","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"enum Hongbao.ReceiveType","name":"receiveType","type":"uint8"},{"internalType":"address","name":"token","type":"address"}],"name":"createHongbaoWithToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"FailedInnerCall","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"passwordHash","type":"uint256"},{"indexed":true,"internalType":"address","name":"claimer","type":"address"},{"indexed":false,"internalType":"uint256","name":"claimAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"remaining","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"remainingAmount","type":"uint256"}],"name":"HongbaoClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"passwordHash","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"total","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"enum Hongbao.ReceiveType","name":"receiveType","type":"uint8"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"HongbaoCreated","type":"event"},{"inputs":[],"name":"defaultVerifier","outputs":[{"internalType":"contract Verifier","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"keyHash","type":"uint256"}],"name":"getRemainingAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"idMap","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"passwordHash","type":"uint256"},{"internalType":"uint256","name":"total","type":"uint256"},{"internalType":"uint256","name":"remaining","type":"uint256"},{"internalType":"uint256","name":"totalAmount","type":"uint256"},{"internalType":"uint256","name":"remainingAmount","type":"uint256"},{"internalType":"enum Hongbao.ReceiveType","name":"receiveType","type":"uint8"},{"internalType":"address","name":"token","type":"address"}],"stateMutability":"view","type":"function"}]'
}