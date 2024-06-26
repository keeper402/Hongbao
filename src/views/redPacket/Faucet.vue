<script>
import { getWeb3Provider } from "@/utils/WalletUtil";
import { chains } from "@/assets/js/chains";
import { RedPacket } from "@/utils/RedPacket";
import { ethers, JsonRpcProvider } from "ethers";
import { groth16 } from "snarkjs";
import $ from "jquery";
import { Modal as BootstrapModal } from "bootstrap";
import Consts from "@/utils/Consts";

// 先改文本
const text = `This faucet is used to receive test tokens. You can receive 100eth tokens here every day. Then fill in this token address [${process.env.VUE_APP_COIN_ADDRESS}] when sending out Hongbao, and you can try it out and send out red envelopes.`
$(document).ready(function (){
  document.getElementById("intro").innerText=text;
})
// var p = document.getElementById("showText");
export default {
  data() {
    return {
      account: null,
      chainId: 0,
      loading: false,
      opened: false,
      bonusBN: null,
      toAddress: "",
      password: "",
      token: null,
      redPacket: new RedPacket(),
      version: 0, // just used to update computed property
    };
  },
  computed: {
    creatorName() {
      let addr = this.redPacket.creator;
      if (!addr) {
        return "";
      }
      return this.redPacket.getRpCreator(addr);
    },
    greeting() {
      return this.redPacket.getRpGreeting() || "Best Wishes!";
    },
    amount() {
      if (this.token) {
        return this.redPacket.abbrBN(
          this.redPacket.amount,
          this.token.decimals
        );
      }
    },
    amountLeft() {
      if (this.token) {
        return this.redPacket.abbrBN(
          this.redPacket.amountLeft,
          this.token.decimals
        );
      }
    },
    bonus() {
      if (this.token && this.bonusBN) {
        return this.redPacket.abbrBN(this.bonusBN, this.token.decimals);
      }
    },
    tokenIconUrl() {
      // const icon = this.redPacket.getRpIconImage();
      // if (icon) {
      //   return icon;
      // }
      // if (this.token && this.token.address) {
      //   let ch = this.BLOCKCHAINS[this.redPacket.chain];
      //   if (ch) {
      //     const t = ch.tokens.find(
      //       (t) => t.address === this.token.address.toLowerCase()
      //     );
      //     if (t) {
      //       return t.icon;
      //     }
      //   }
      // }
      return require("@/assets/icons/default.svg");
    },
    displayOpenInfo() {
      return this.redPacket.getRpDisplayOpenInfo();
    },
    coverImage() {
      let i = this.redPacket.getRpCoverImage();
      if (i) {
        return "url(" + i + ")";
      }
      return "none";
    },
    openImage() {
      let i = this.redPacket.getRpOpenImage();
      if (i) {
        return i;
      }
      return require("@/assets/img/open-1.svg");
    },
    canCustomize() {
      return (
        this.account &&
        this.redPacket.creator &&
        this.account.toLowerCase() === this.redPacket.creator.toLowerCase()
      );
    },
    invalid() {
      // return isNaN(this.redPacket.chain) || isNaN(this.redPacket.id);
      return false;
    },
    ready() {
      // return !!this.account && this.chainId === this.redPacket.chain;
      return !!this.account;
    },
    networkName() {
      // if (this.account) {
      //   if (this.chainId === this.redPacket.chain) {
      //     let c = this.BLOCKCHAINS[this.chainId];
      //     if (c) {
      //       return c.name;
      //     }
      //   }
      //   return "Unsupported Network (0x" + this.chainId.toString(16) + ")";
      // }
      // return "Not Connected";
      if (this.account) {
        const chainName =
          Consts.SUPPORTED_CHAINS_NAMES[this.chainId] ?? "Chain";
        return chainName + " (0x" + this.chainId.toString(16) + ")";
      }
      return "Not connected";
    },
    correctNetworkName() {
      // let c = this.BLOCKCHAINS[this.redPacket.chain];
      // if (c) {
      //   return c.name;
      // }
      // return "Chain (0x" + this.redPacket.chain.toString(16) + ")";
      return "Chain (0x" + this.chainId.toString(16) + ")";
    },
  },
  created() {
    this.init();
  },
  methods: {
    async claimFaucet() {
      // <!-- 领水逻辑   -->
      try {
        const signer = await getWeb3Provider().getSigner();
        const faucet = new ethers.Contract(
          Consts.faucetAddress,
          Consts.faucetABI,
          signer
        );
        let tx = await faucet.requestTokens();
        this.showAlert("Success", "you have claimed 10 hong!");
      } catch (err) {
        return this.showAlert("Error", this.translateError(err));
      }
    },

    async init() {
      await this.connectWallet();
    },
    // preview() {
    //   this.connectWallet();
    //   this.loadRedPacket();
    // if (this.redPacket.preview) {
    //   // show customize:
    //   let $customize = $("#customize"),
    //     $chain = $customize.find("input[name=chain]"),
    //     $id = $customize.find("input[name=id]"),
    //     $rpGreeting = $customize.find("input[name=rpGreeting]"),
    //     $rpCreator = $customize.find("input[name=rpCreator]"),
    //     $rpCoverImage = $customize.find("input[name=rpCoverImage]"),
    //     $rpOpenImage = $customize.find("input[name=rpOpenImage]"),
    //     $rpIconImage = $customize.find("input[name=rpIconImage]"),
    //     $rpDisplayOpenInfo = $customize.find("input[name=rpDisplayOpenInfo]");
    //   $chain.val(this.redPacket.chain);
    //   $id.val(this.redPacket.id);
    //   $rpGreeting.val(this.redPacket.getRpGreeting());
    //   $rpCreator.val(this.redPacket.getRpCreator(this.redPacket.creator));
    //   $rpCoverImage.val(this.redPacket.getRpCoverImage());
    //   $rpOpenImage.val(this.redPacket.getRpOpenImage());
    //   $rpIconImage.val(this.redPacket.getRpIconImage());
    //   $rpDisplayOpenInfo.prop(
    //     "checked",
    //     !this.redPacket.getRpDisplayOpenInfo()
    //   );
    //   $("#customize").show();
    // }
    // },
    async prove(addrBN, secretBN) {
      return await groth16.fullProve(
        {
          addr: addrBN.toString(),
          secret: secretBN.toString(),
        },
        "circuits/passhash.wasm",
        "circuits/passhash_0001.zkey"
      );
    },
    keccak(str) {
      let arr = new TextEncoder().encode(str);
      return ethers.keccak256(arr);
    },

    getRpcProvider(rpcUrl) {
      new JsonRpcProvider({
        url: rpcUrl,
        timeout: 20000,
      });
    },
    showAlert(title, message) {
      let m = $("#alertModal");
      m.find(".x-title").text(title);
      m.find(".x-message").text(message);
      let myModal = new BootstrapModal(m.get(0), {
        backdrop: "static",
        keyboard: false,
      });
      myModal.show();
      // alert(title + " _ " + message);
    },

    showInfo(title, message) {
      let m = $("#infoModal");
      m.find(".x-title").text(title);
      if (message.startsWith("<")) {
        m.find(".x-message").html(message);
      } else {
        m.find(".x-message").text(message);
      }
      let myModal = new BootstrapModal(m.get(0), {
        backdrop: "static",
        keyboard: false,
      });
      myModal.show();
      // alert(title + " _ " + message);
    },

    showInput(onOkClicked) {
      let m = $("#inputModal"),
        ok = m.find("button.btn-primary");
      $("#inputPassword").val("");
      let myModal = new BootstrapModal(m.get(0), {
        backdrop: "static",
        keyboard: false,
      });
      ok.click(() => {
        myModal.hide();
        ok.off("click");
        setTimeout(() => {
          onOkClicked && onOkClicked($("#inputPassword").val());
        }, 500);
      });
      myModal.show();
      // let pwd = prompt("Input Password");
      // onOkClicked && onOkClicked(pwd);
    },

    showLoading(title, message) {
      let m = $("#loadingModal");
      let myModal = new BootstrapModal(m.get(0), {
        backdrop: "static",
        keyboard: false,
      });
      // alert(title + " _ " + message);
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
      return obj;
    },

    translateError(err) {
      window.err = err;
      if (typeof err === "string") {
        return err;
      }
      if (err.error && err.error.code && err.error.message) {
        return `Error (${err.error.code}): ${err.error.message}`;
      }
      if (err.code && err.message) {
        return `Error (${err.code}): ${err.message}`;
      }
      return err.message || err.toString();
    },

    async signUrl() {
      try {
        if (!this.account) {
          throw "Please connect with MetaMask first.";
        }
        if (!this.redPacket) {
          throw "Failed to load red packet.";
        }
        if (
          this.redPacket.creator.toLowerCase() !== this.account.toLowerCase()
        ) {
          throw (
            "You must sign the URL with creator address: " +
            this.redPacket.abbrAddress(this.redPacket.creator)
          );
        }
        let msg = this.redPacket.getRpParamsMessageForSign();
        let sig = await getWeb3Provider().getSigner().signMessage(msg);
        console.log(sig);
        // now generate url:
        let params = this.redPacket.getRpParams(),
          urlSearch = new URLSearchParams();
        urlSearch.append("chain", this.redPacket.chain);
        urlSearch.append("id", this.redPacket.id);
        for (let k in params) {
          urlSearch.append(k, params[k]);
        }
        urlSearch.append("sig", sig);
        let url =
          location.protocol +
          "//" +
          location.host +
          location.pathname +
          "?" +
          urlSearch.toString();
        let h =
          '<div class="mb-2">You have successfully generated the customized URL for this red packet:</div>' +
          '<form><input class="form-control" readonly style="width: 80%" value="' +
          url +
          '"></form>' +
          '<div class="mt-2"><a href="#0" onclick="navigator.clipboard.writeText(\'' +
          url +
          '\');">Copy</a> - <a href="https://tinyurl.com/" target="_blank">Shorten URL</a> - <a target="_blank" href="' +
          url +
          '">Open URL</a></div>';
        this.showInfo("Red Packet Customized URL", h);
      } catch (err) {
        this.showAlert("Error", this.translateError(err));
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
    gotoCustomizeUrl() {
      let params = this.redPacket.getRpParams(),
        urlSearch = new URLSearchParams();
      urlSearch.append("chain", this.redPacket.chain);
      urlSearch.append("id", this.redPacket.id);
      urlSearch.append("preview", "true");
      for (let k in params) {
        urlSearch.append(k, params[k]);
      }
      location.assign("rp.html?" + urlSearch.toString());
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
    async chainChanged(chainId) {
      console.log(
        "wallet chainId changed: " + chainId + " = " + parseInt(chainId, 16)
      );
      this.chainId = parseInt(chainId, 16);
      // await this.loadRedPacket();
    },
    async connectWallet() {
      console.log("try connect wallet...");
      if (getWeb3Provider() === null) {
        console.error("there is no web3 provider.");
        return false;
      }
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
    <!-- Input Modal -->
    <div
      id="inputModal"
      aria-hidden="true"
      aria-labelledby="inputLabel"
      class="modal fade"
      role="dialog"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header align-items-center d-flex">
            <h4 id="inputLabel" class="modal-title">Password</h4>
          </div>
          <div class="modal-body">
            <form onsubmit="return false">
              <div class="mb-3">
                <label class="form-label" for="inputPassword"
                  >Password for this red packet:</label
                >
                <input
                  id="inputPassword"
                  class="form-control"
                  maxlength="100"
                  type="text"
                />
                <div class="form-text">
                  Input the password of the red packet set by creator.
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" type="button">OK</button>
            <button
              aria-label="Close"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

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
              <div class="x-message">&nbsp;</div>
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
        style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99;
          background-size: cover;
        "
      >
        <div class="container">
          <a class="navbar-brand" href="/"
            ><i class="bi bi-envelope-paper" /> Red Packet</a
          >
          <ul class="mr-2 navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/">
                <i class="bi bi-list-ul" />
                Send
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/receive">
                <i class="bi bi-list-ul" />
                Receive
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
                ><i class="bi bi-globe" />
                <span v-text="networkName"></span>&nbsp;</span
              >
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
              <a class="nav-link" href="#0" v-on:click="gotoScanUrl">
                <i class="bi bi-wallet" />
                <span v-text="abbrAddress(account)"></span
              ></a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="pb-5" style="padding-top: 40px">
        <div v-show="!invalid" class="row g-0 mt-4">
          <div class="col">
            <div class="container g-0 red-packet"></div>
            <div class="container g-0 red-packet">
              <img src="../../assets/img/faucet.jpg" />
              <div>
                <div>
                  <p id="intro" readonly class="text-white">
                    This faucet is used to receive test tokens. You can receive
                    100eth tokens here every day. Then fill in this token
                    address ${process.env.VUE_APP_COIN_ADDRESS} when sending out Hongbao, and
                    you can try it out and send out red envelopes.
                  </p>
                </div>
                <div v-on:click="claimFaucet">
                  <button class="btn btn-primary" type="button">Claim</button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-show="canCustomize && !redPacket.preview"
            class="mt-4 mb-4 text-center text-white"
          >
            <a
              class="text-white"
              href="#0"
              target=" _blank"
              v-on:click="gotoCustomizeUrl"
              >Customize Your Red Packet</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.red-packet {
  width: 328px;
}

.red-packet .card {
  overflow: hidden;
  height: 520px;
  position: relative;
  border-radius: 16px;
  background-color: #f35542;
}

.red-packet .card-body {
  background-size: cover;
  color: #ebcc9a;
}

.golden-border {
  border: 4px solid #ebcc9a;
}

.opened {
  position: absolute;
  left: 50%;
  top: 20px;
  margin-left: -140px;
  width: 280px;
  height: 370px;
  color: #905923;
  background-color: #f5f1ee;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.opened .coin-logo > img {
  width: 48px;
  height: 48px;
}

.triangle {
  position: absolute;
  top: 330px;
  width: 0;
  height: 0;
  border-bottom-width: 0;
}

.triangle-1 {
  left: 0;
  border-top: 60px solid transparent;
  border-left: 168px solid #ebcc9a;
  border-right: 168px solid transparent;
}

.triangle-1-cover {
  left: 0;
  top: 334px;
  border-top: 60px solid transparent;
  border-left: 168px solid #f35542;
  border-right: 168px solid transparent;
}

.triangle-2 {
  right: 0;
  border-top: 60px solid transparent;
  border-left: 168px solid transparent;
  border-right: 168px solid #ebcc9a;
}

.triangle-2-cover {
  right: 0;
  top: 334px;
  border-top: 60px solid transparent;
  border-left: 168px solid transparent;
  border-right: 168px solid #f35542;
}

.rectangle-bottom {
  position: absolute;
  left: 0;
  top: 390px;
  width: 330px;
  height: 300px;
  background-color: #f35542;
}

.circle {
  position: absolute;
  left: 50%;
  top: 330px;
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-left: -50px;
  background-color: #ebcc9a;
  cursor: pointer;
}

.can-open:hover {
  box-shadow: 0 0 0.2rem 0.5rem rgba(235, 204, 154, 0.5);
  transform: scale(1.1);
  transition: all 0.3s;
}

.circle > img {
  width: 60px;
  height: 60px;
  margin: 20px;
}

.fs-7 {
  font-size: 0.875rem;
}

a {
  text-decoration: none;
}

/* #navbarExpand {
  background-image: url("~../../assets/img/nav.png");
} */
</style>
