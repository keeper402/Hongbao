<script>
import { chains } from "@/assets/js/chains";
import { ethers } from "ethers";
import { getWeb3Provider } from "@/utils/WalletUtil";
import { groth16 } from "snarkjs";
import Consts from "@/utils/Consts";

export default {
  data() {
    return {
      account: null,
      chainId: "",
      tokenAmount: "1.0",
      total: 7,
      bonusType: "0", // 0=Identical, 1=Random
      password: "",
      CREATE_TOPIC:
        "0xf526b6d6ff0fac13f7e16aeea0f08bc8f0789c188dc429de0ea4b56bc06e82c6",
    };
  },
  computed: {
    ready() {
      return this.account && this.chainId > 0;
    },
    networkName() {
      // if (this.account) {
      //   let c = this.BLOCKCHAINS[this.chainId];
      //   if (c) {
      //     return c.name;
      //   }
      //   return "Unsupported Chain (0x" + this.chainId.toString(16) + ")";
      // }
      // return "Not connected";
      if (this.account) {
        const chainName =
          Consts.SUPPORTED_CHAINS_NAMES[this.chainId] ?? "Chain";
        return chainName + " (0x" + this.chainId.toString(16) + ")";
      }
      return "Not connected";
    },
    wrongNetwork() {
      // return this.account && !this.BLOCKCHAINS[this.chainId];
      return !this.account;
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {},
    keccak(str) {
      let arr = new TextEncoder().encode(str);
      return ethers.keccak256(arr);
    },

    async prove(addrBN, secretBN) {
      return groth16.fullProve(
        {
          addr: addrBN.toString(),
          secret: secretBN.toString(),
        },
        "circuits/passhash.wasm",
        "circuits/passhash_0001.zkey"
      );
    },

    toBN(s, decimals) {
      try {
        return ethers.parseUnits(s.trim(), decimals);
      } catch (e) {
        return null;
      }
    },

    isValidBN(s, decimals) {
      let bn = this.toBN(s, decimals);
      return bn !== null && bn !== 0n && bn >= 0n;
    },

    isValidAddress(s) {
      try {
        ethers.getAddress(s);
        return true;
      } catch (e) {
        return false;
      }
    },
    showAlert(title, message) {
      // let m = $("#alertModal");
      // m.find(".x-title").text(title);
      // m.find(".x-message").text(message);
      // let myModal = new bootstrap.Modal(m.get(0), {
      //   backdrop: "static",
      //   keyboard: false,
      // });
      // myModal.show();
      alert(title + " _ " + message);
    },

    showInfo(title, message) {
      /*let m = $("#infoModal");
      m.find(".x-title").text(title);
      if (message.startsWith("<")) {
        m.find(".x-message").html(message);
      } else {
        m.find(".x-message").text(message);
      }
      let myModal = new bootstrap.Modal(m.get(0), {
        backdrop: "static",
        keyboard: false,
      });
      myModal.show();*/
      alert(title + " _ " + message);
    },

    showLoading(title, message) {
      /*let m = $("#loadingModal");
      let myModal = new bootstrap.Modal(m.get(0), {
        backdrop: "static",
        keyboard: false,
      });
      let obj = {
        setTitle: (t) => {
          m.find(".x-title").text(t);
        },
        setMessage: (t) => {
          m.find(".x-message").text(t);
        },
        close: () => {
          setTimeout(() => {
            myModal.hide();
          }, 500);
        },
      };
      obj.setTitle(title);
      obj.setMessage(message);
      myModal.show();
      return obj;*/
      alert(title + " _ " + message);
      let obj = {
        setTitle: (t) => {
          // m.find(".x-title").text(t);
        },
        setMessage: (t) => {
          // m.find(".x-message").text(t);
        },
        close: () => {
          setTimeout(() => {
            // myModal.hide();
          }, 500);
        },
      };
      return obj;
    },

    translateError(err) {
      window.err = err;
      if (typeof err === "string") {
        return err;
      }
      /*if (err.error && err.error.code && err.error.message) {
        return `Error (${err.error.code}): ${err.error.message}`;
      }
      if (err.code && err.message) {
        return `Error (${err.code}): ${err.message}`;
      }*/
      return err.message || err.toString();
    },
    async createRedPacket() {
      // check:
      let chainId = this.chainId,
        tokenAmount,
        decimals,
        total,
        bonusType,
        password,
        account,
        passcode,
        passcodeHash,
        value,
        redPacketId = 0;
      if (!this.ready) {
        return this.showAlert("Error", "Please connect to wallet first!");
      }
      if (this.wrongNetwork) {
        return this.showAlert(
          "Error",
          "The connected network is not supported!"
        );
      }
      // check tokenAmount:
      if (!this.isValidBN(this.tokenAmount, decimals)) {
        return this.showAlert("Error", "Bonus amount is invalid!");
      }
      tokenAmount = this.toBN(this.tokenAmount, decimals);
      total = parseInt(this.total);
      if (isNaN(total) || total < 0 || total > 100000) {
        return this.showAlert("Error", "Max perticipates is invalid!");
      }
      bonusType = parseInt(this.bonusType);
      // check password:
      password = this.password.trim();
      if (password === "") {
        return this.showAlert("Error", "Password must be set!");
      }

      // now generate password hash:
      // passcode = BigInt(this.keccak(account + password));
      passcode = BigInt(this.keccak(password));
      let { proof, publicSignals } = await this.prove(BigInt("0"), passcode);
      console.log(publicSignals);
      passcodeHash = BigInt(publicSignals[0]);
      console.log(
        "keccak(" + (account + password) + ") = " + passcode.toString()
      );
      console.log("passcode hash = ", passcodeHash.toString());

      let loading = this.showLoading("Create", "Check balance...");
      // @SEE：https://github.com/ethers-io/ethers.js/discussions/3752#discussioncomment-4996797
      const signer = await getWeb3Provider().getSigner();
      const redPacket = new ethers.Contract(
        Consts.redPacketAddress,
        Consts.redPacketABI,
        signer
      );
      try {
        // 检查用户是否有足够的代币余额，并确保用户已经授权某个合约（例如一个红包合约）可以代表用户花费这些代币。
        // if (tokenAddress === this.ETH_ADDRESS) {
        //   let eth_balance = await getWeb3Provider().getBalance(account);
        //   if (eth_balance.lt(tokenAmount)) {
        //     throw "You don't have enough " + this.nativeToken + ".";
        //   }
        // } else {
        //   let erc = new ethers.Contract(
        //           tokenAddress,
        //           this.ERC20_ABI,
        //           getWeb3Provider().getSigner(),
        //       ),
        //       erc_symbol = await erc.symbol(),
        //       erc_balance = await erc.balanceOf(account);
        //   if (erc_balance.lt(tokenAmount)) {
        //     throw "You don't have enough " + erc_symbol + ".";
        //   }
        //   console.log("check allowance...");
        //   loading.setMessage("Check allowance...");
        //   let erc_allowance = await erc.allowance(
        //       account,
        //       this.RED_PACKET_ADDR,
        //   );
        //   console.log("allowance = " + erc_allowance);
        //   if (erc_allowance.lt(tokenAmount)) {
        //     console.log("must increase allowance.");
        //     loading.setMessage(
        //         "Please approve the Red Packet contract to spend your " +
        //         erc_symbol +
        //         " in MetaMask...",
        //     );
        //     let tx_approve = await erc.approve(
        //         this.RED_PACKET_ADDR,
        //         ethers.parseUnits("1000000000000000000", 18),
        //     );
        //     loading.setMessage("Please wait for blockchain confirmation...");
        //     await tx_approve.wait(1);
        //   }
        // }
        loading.setMessage("Please sign transaction in MetaMask...");
        // value = tokenAddress === this.ETH_ADDRESS ? tokenAmount : 0;
        value = tokenAmount;
        console.log(
          "tokenAmount = " +
            tokenAmount +
            ", type = " +
            typeof tokenAmount +
            "\n" +
            "total = " +
            total +
            "\n" +
            "bonusType = " +
            bonusType +
            "\n" +
            "passcodeHash = " +
            passcodeHash +
            "\n" +
            "value = " +
            value
        );
        let tx = await redPacket.createHongbao(
          passcodeHash,
          total,
          tokenAmount,
          bonusType,
          {
            value: value,
          }
        );
        loading.setMessage("Please wait for blockchain confirmation...");
        await tx.wait(1);
        loading.setMessage("Get transaction logs...");
        // get red packet id from log:
        let receipt = await getWeb3Provider().getTransactionReceipt(tx.hash);
        let logs = receipt.logs;
        for (let i = 0; i < logs.length; i++) {
          let log = logs[i];
          if (log.topics && log.topics[0] === this.CREATE_TOPIC) {
            redPacketId = parseInt(log.data.substring(0, 66), 16);
            console.log("red packet id: " + redPacketId);
            break;
          }
        }
        loading.close();
        // 显示结果，跳转到列表页
        let url =
          location.protocol +
          "//" +
          location.host +
          "/rp.html?chain=" +
          chainId +
          "&id=" +
          redPacketId;
        this.showInfo(
          "Success",
          "<p>Red packet created successfully!</p><p>Password: " +
            password +
            '</p><p>You can share this red packet:</p><p><a target="_blank" href="' +
            url +
            '">' +
            url +
            ' <i class="bi bi-box-arrow-up-right" /></a></p>'
        );
      } catch (err) {
        loading.close();
        return this.showAlert("Error", this.translateError(err));
      }
    },
    abbrAddress(addr) {
      if (!addr) {
        return "";
      }
      let s = addr.toString();
      if (s.indexOf("0x") === 0 && s.length === 42) {
        let addr = ethers.getAddress(s.substring(0));
        return addr.substring(0, 6) + "..." + addr.substring(38);
      }
      return s;
    },
    gotoScanUrl() {
      // let c = this.BLOCKCHAINS[this.chainId];
      // if (c) {
      //   window.open(c.scan + "/address/" + this.account);
      // } else {
      //   console.error("Invalid chain id: ", this.chainId);
      // }
    },
    displayBN(bn, decimals) {
      let BN100 = ethers.parseUnits("100", 0),
        B = ethers.parseUnits("1000000000", decimals),
        M = ethers.parseUnits("1000000", decimals),
        K = ethers.parseUnits("1000", decimals);
      if (bn.gte(B)) {
        return ethers.formatUnits(bn.mul(BN100).div(B), 2) + " B";
      }
      if (bn.gte(M)) {
        return ethers.formatUnits(bn.mul(BN100).div(M), 2) + " M";
      }
      if (bn.gte(K)) {
        return ethers.formatUnits(bn.mul(BN100).div(K), 2) + " K";
      }
      // ##.###
      let s = ethers.formatUnits(bn, decimals),
        n = s.indexOf("."),
        pad;
      if (n === -1) {
        return s + ".000";
      }
      pad = 3 - (s.length - n - 1);
      if (pad > 0) {
        return s + "0".repeat(3 - (s.length - n - 1));
      }
      return s.substring(0, n + 4);
    },
    formatBN(bn, decimals) {
      let s = ethers.formatUnits(bn, decimals),
        n = s.indexOf(".");
      if (n == -1) {
        s = s + "." + "0".repeat(decimals);
      } else {
        s = s + "0".repeat(decimals - (s.length - n - 1));
      }
      return s;
    },
    accountChanged(accounts) {
      console.log(
        "wallet account changed:",
        accounts.length === 0 ? null : accounts[0]
      );
      if (accounts.length === 0) {
        this.disconnected();
      } else {
        this.account = accounts[0];
        document.cookie = "__account__=" + this.account + ";max-age=1296000";
      }
    },
    async disconnected() {
      console.warn("wallet disconnected.");
      this.account = null;
    },
    chainChanged(chainId) {
      console.log(
        "wallet chainId changed: " + chainId + " = " + parseInt(chainId, 16)
      );
      this.chainId = parseInt(chainId, 16);
    },
    async connectWallet() {
      console.log("try connect wallet...");
      if (getWeb3Provider() === null) {
        console.error("there is no web3 provider.");
        return false;
      }
      console.log("enter 2");
      try {
        this.accountChanged(
          await window.ethereum.request({
            method: "eth_requestAccounts",
          })
        );
        this.chainChanged(
          await window.ethereum.request({
            method: "eth_chainId",
          })
        );
        window.ethereum.on("disconnect", this.disconnected);
        window.ethereum.on("accountsChanged", this.accountChanged);
        window.ethereum.on("chainChanged", this.chainChanged);
      } catch (e) {
        console.error("could not get a wallet connection.", e);
        return false;
      }
      console.log("wallet connected.");
      return true;
    },
  },
};
</script>

<template>
  <div data-bs-theme="dark">
    <!-- Loading Modal -->
    <div
      id="loadingModal"
      aria-hidden="true"
      aria-labelledby="loadingLabel"
      class="modal fade"
      role="dialog"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header align-items-center d-flex">
            <h4 id="loadingLabel" class="modal-title x-title">&nbsp;</h4>
          </div>
          <div class="modal-body">
            <div class="float-start">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div class="ms-5 ps-4 float-none">
              <p class="x-message">&nbsp;</p>
            </div>
          </div>
          <!-- <div class="modal-footer">
              <button class="btn btn-outline-primary" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
          </div> -->
        </div>
      </div>
    </div>
    <!-- Alert Modal -->
    <div
      id="alertModal"
      aria-hidden="true"
      aria-labelledby="alertLabel"
      class="modal fade"
      role="dialog"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header align-items-center d-flex">
            <h4 id="alertLabel" class="modal-title x-title">&nbsp;</h4>
            <button
              aria-label="Close"
              class="btn-close"
              data-bs-dismiss="modal"
              type="button"
            >
              <span aria-hidden="true"><i class="fe fe-x-circle"></i></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="float-start">
              <i class="fs-2 text-danger fe fe-alert-triangle"></i>
            </div>
            <div class="ms-5 ps-4 float-none">
              <p class="x-message">&nbsp;</p>
            </div>
          </div>
          <div class="modal-footer">
            <button
              aria-label="Close"
              class="btn btn-outline-primary"
              data-bs-dismiss="modal"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Modal -->
    <div
      id="infoModal"
      aria-hidden="true"
      aria-labelledby="infoLabel"
      class="modal fade"
      role="dialog"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header align-items-center d-flex">
            <h4 id="infoLabel" class="modal-title x-title">&nbsp;</h4>
            <button
              aria-label="Close"
              class="btn-close"
              data-bs-dismiss="modal"
              type="button"
            >
              <span aria-hidden="true"><i class="fe fe-x-circle"></i></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="float-start">
              <i class="fs-2 fe fe-info"></i>
            </div>
            <div class="ms-5 ps-4 float-none">
              <p class="x-message">&nbsp;</p>
            </div>
          </div>
          <div class="modal-footer">
            <button
              aria-label="Close"
              class="btn btn-outline-primary"
              data-bs-dismiss="modal"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <div id="vm" class="container">
      <nav
        class="navbar navbar-expand-lg nav-dark-style"
        style="position: fixed; top: 0; left: 0; right: 0; z-index: 99"
      >
        <div class="container">
          <a class="navbar-brand" href="#0"
            ><i class="bi bi-envelope-paper" /> Red Packet</a
          >
          <ul class="mr-2 navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/receive">
                <i class="bi bi-list-ul" />
                Receive
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/faucet">
                <i class="bi bi-list-ul" />
                Faucet
              </a>
            </li>
          </ul>
          <ul
            id="wallet"
            class="mr-2 navbar-nav navbar-right-wrap"
            style="flex-direction: row !important"
          >
            <li class="nav-item">
              <span class="nav-link"
                ><i class="bi bi-globe" /> <span v-text="networkName"></span
              ></span>
            </li>
            <li v-if="account === null" class="nav-item">
              <button
                class="btn btn-light"
                type="button"
                v-on:click="connectWallet"
              >
                Connect Wallet
              </button>
            </li>
            <li v-if="account !== null" class="nav-item">
              <a class="nav-link" href="#0" v-on:click="gotoScanUrl"
                ><i class="bi bi-wallet" />
                <span v-text="abbrAddress(account)"></span>
                <i class="fe fe-external-link"></i
              ></a>
            </li>
            <!-- <li v-if="wrongNetwork" class="ms-2 d-inline-block">
              <span class="nav-link"
                >Unsupported chain (<span v-text="chainId"></span>)</span
              >
            </li> -->
          </ul>
        </div>
      </nav>

      <div style="padding-top: 80px">
        <!-- create red packet -->
        <div class="row mt-4">
          <div class="col">
            <div class="container" style="width: 480px">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Create a Red Packet</h5>
                  <hr />
                  <form onsubmit="return false">
                    <div class="mb-3">
                      <label class="form-label" for="bonus-amount"
                        >Bonus Amount:</label
                      >
                      <input
                        id="bonus-amount"
                        v-model="tokenAmount"
                        class="form-control"
                        maxlength="42"
                        type="text"
                      />
                      <div class="form-text">
                        The amount of bonus you want to sent.
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label" for="bonus-amount"
                        >Max Participates:</label
                      >
                      <input
                        id="bonus-amount"
                        v-model:number="total"
                        class="form-control"
                        max="100000"
                        min="1"
                        type="number"
                      />
                      <div class="form-text">
                        The max participates who can get the bonus.
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Bonus Mode:</label>
                      <div class="form-check">
                        <label class="form-check-label">
                          <input
                            id="bonus-type-identical"
                            v-model="bonusType"
                            class="form-check-input"
                            name="bonusType"
                            type="radio"
                            value="0"
                          />
                          Identical for Each
                        </label>
                      </div>
                      <div class="form-check">
                        <label class="form-check-label">
                          <input
                            id="bonus-type-random"
                            v-model="bonusType"
                            class="form-check-input"
                            name="bonusType"
                            type="radio"
                            value="1"
                          />
                          Random for Each
                        </label>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label" for="bonus-password"
                        >Password:</label
                      >
                      <input
                        id="bonus-password"
                        v-model="password"
                        class="form-control"
                        maxlength="100"
                        placeholder="e.g. Bitcoin is awesome!"
                        type="text"
                      />
                      <div class="form-text">
                        The case-sensitive password to open the red packet.
                      </div>
                    </div>
                    <!-- <div class="mb-3">
                      <label class="form-label" for="condition-address"
                        >Validator Address:</label
                      >
                      <input
                        id="condition-address"
                        v-model="conditionAddress"
                        class="form-control"
                        maxlength="42"
                        placeholder="0x"
                        type="text"
                      />
                      <div class="form-text">
                        You can specify a validator contract, or just leave it
                        blank.
                      </div>
                      <div class="form-text">
                        <a
                          href="https://github.com/michaelliao/red-packet-contract/blob/master/docs/validator.md"
                          target="_blank"
                        >
                          What is validator?</a
                        >
                      </div>
                    </div> -->
                    <div class="mb-2 text-center">
                      <button
                        class="btn btn-primary ps-5 pe-5"
                        type="button"
                        v-on:click="createRedPacket"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <footer class="p-5 mt-5 bg-light border-top">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="mb-4">
              <i class="bi bi-envelope-paper" /> Red Packet, copyleft 2023
            </div>
            <ul class="list-unstyled small text-muted">
              <li class="mb-2">
                Designed and built by
                <a href="https://github.com/michaelliao" target="_blank"
                  >Michael Liao <i class="bi bi-box-arrow-up-right" /></a
                >.
              </li>
              <li class="mb-2">
                Check the source code on
                <a
                  href="https://github.com/michaelliao/red-packet-contract"
                  target="_blank"
                  >Github <i class="bi bi-box-arrow-up-right"></i
                ></a>
              </li>
              <li class="mb-2">
                Code licensed
                <a
                  href="https://github.com/michaelliao/red-packet-contract/blob/master/LICENSE"
                  target="_blank"
                  >GPLv3 <i class="bi bi-box-arrow-up-right"></i
                ></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer> -->
  </div>
</template>

<style scoped>
.x-border {
  border: 1px solid #ced4da;
  border-left: 0.25rem solid #5bc0de;
  border-radius: 0.25rem;
  padding: 1rem;
}

a {
  text-decoration: none;
}
</style>
