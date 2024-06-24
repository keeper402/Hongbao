<script>
import {getWeb3Provider} from "@/utils/WalletUtil";
import {chains} from "@/assets/js/chains";
import {RedPacket} from "@/utils/RedPacket";
import {ethers, JsonRpcProvider} from "ethers";
import {groth16} from "snarkjs";
import Consts from "@/utils/Consts";

export default {
  data() {
    return {
      account: null,
      chainId: 0,
      loaded: false,
      loading: false,
      opened: false,
      bonusBN: null,
      toAddress: "",
      password: "",
      token: null,
      redPacket: new RedPacket(),
      version: 0, // just used to update computed property
      BLOCKCHAINS: chains.BLOCKCHAINS,
      ETH_ADDRESS: chains.ETH_ADDRESS,
      ZERO_ADDRESS: chains.ZERO_ADDRESS,
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
      const icon = this.redPacket.getRpIconImage();
      if (icon) {
        return icon;
      }
      if (this.token && this.token.address) {
        let ch = this.BLOCKCHAINS[this.redPacket.chain];
        if (ch) {
          const t = ch.tokens.find(
            (t) => t.address === this.token.address.toLowerCase()
          );
          if (t) {
            return t.icon;
          }
        }
      }
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
      if (this.account) {
        if (this.chainId === this.redPacket.chain) {
          let c = this.BLOCKCHAINS[this.chainId];
          if (c) {
            return c.name;
          }
        }
        return "Unsupported Network (0x" + this.chainId.toString(16) + ")";
      }
      return "Not Connected";
    },
    correctNetworkName() {
      let c = this.BLOCKCHAINS[this.redPacket.chain];
      if (c) {
        return c.name;
      }
      return "Chain (0x" + this.redPacket.chain.toString(16) + ")";
    },
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      await this.connectWallet();
      await this.loadRedPacket();
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
    },
    preview() {
      this.connectWallet();
      this.loadRedPacket();
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
    },
    toList() {
      this.$router.push("/list");
    },
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
      // let m = $("#infoModal");
      // m.find(".x-title").text(title);
      // if (message.startsWith("<")) {
      //   m.find(".x-message").html(message);
      // } else {
      //   m.find(".x-message").text(message);
      // }
      // let myModal = new bootstrap.Modal(m.get(0), {
      //   backdrop: "static",
      //   keyboard: false,
      // });
      myModal.show();
      alert(title + " _ " + message);
    },

    showInput(onOkClicked) {
      // let m = $("#inputModal"),
      //   ok = m.find("button.btn-primary");
      // $("#inputPassword").val("");
      // let myModal = new bootstrap.Modal(m.get(0), {
      //   backdrop: "static",
      //   keyboard: false,
      // });
      // ok.click(() => {
      //   myModal.hide();
      //   ok.off("click");
      //   setTimeout(() => {
      //     onOkClicked && onOkClicked($("#inputPassword").val());
      //   }, 500);
      // });
      // myModal.show();
      let pwd = prompt("Input Password");
      onOkClicked && onOkClicked(pwd);
    },

    showLoading(title, message) {
      // let m = $("#loadingModal");
      // let myModal = new bootstrap.Modal(m.get(0), {
      //   backdrop: "static",
      //   keyboard: false,
      // });
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
      // obj.setTitle(title);
      // obj.setMessage(message);
      // myModal.show();
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

    async loadRedPacket() {
      if (this.loaded) {
        return;
      }
      // let useInjectedProvider = this.chainId === this.redPacket.chain;
      console.log("start load redpacket...");
      this.loading = true;
      try {
        // let provider = useInjectedProvider
        //     ? getWeb3Provider()
        //     : this.getRpcProvider(this.BLOCKCHAINS[this.redPacket.chain].rpc);
        const signer = await getWeb3Provider().getSigner();
        const rpContract = new ethers.Contract(
          Consts.redPacketAddress,
          Consts.redPacketABI,
          signer
        );
        // const rp = await rpContract.getRedPacket(this.redPacket.id);
        // console.log("loaded red packet:", rp);
        // this.redPacket.setRedPacketInfo(rp);
        // this.redPacket.verifyParams();
        this.version++;
        // if (this.redPacket.token.toLowerCase() === this.ETH_ADDRESS) {
        //   let c = this.BLOCKCHAINS[this.redPacket.chain],
        //     symbol = (c && c.native) || "ETH";
        //   this.token = new Token(this.ETH_ADDRESS, symbol, 18);
        // } else {
        //   // load ERC:
        //   let ercContract = new ethers.Contract(
        //       this.redPacket.token,
        //       this.redPacket.erc20ABI,
        //       useInjectedProvider ? provider.getSigner() : provider
        //     ),
        //     symbol = await ercContract.symbol(),
        //     decimals = await ercContract.decimals();
        //   this.token = new Token(this.redPacket.token, symbol, decimals);
        // }
        this.loaded = true;
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
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
    openRedPacket() {
      if (this.redPacket.preview) {
        this.bonusBN = ethers.parseUnits("1", this.token.decimals);
        this.toAddress = this.redPacket.abbrAddress(
          "0xa1b200000000000000000000000000000000e8f9"
        );
        this.opened = true;
        return;
      }
      if (this.redPacket.totalLeft === 0) {
        return this.showAlert(
          "Error",
          "Red packet is empty. Hurry up next time!"
        );
      }
      let that = this;
      this.showInput(function (password) {
        if (password.trim() !== "") {
          that
            .tryOpenRedPacket(password.trim())
            .then(console.log("tryOpenRedPacket: ok"))
            .catch((e) => console.error(e));
        }
      });
    },
    async tryOpenRedPacket(password) {
      if (!this.ready) {
        return this.showAlert(
          "Error",
          "Please connect MetaMask to " + this.correctNetworkName + " first!"
        );
      }
      // let payload = this.redPacket.creator.toLowerCase() + password,
      let payload = password,
        passcode = BigInt(this.keccak(payload)),
        account = this.account.toLowerCase(),
        accountBN = BigInt(account),
        secretBN = passcode - accountBN;
      // check validator:
      // if (this.redPacket.condition !== this.ZERO_ADDRESS) {
      //   let validator = new ethers.Contract(
      //     this.redPacket.condition,
      //     this.redPacket.conditionABI,
      //     getWeb3Provider().getSigner()
      //   );
      //   let r = await validator.check(
      //     this.redPacket.redPacketAddress,
      //     this.redPacket.id,
      //     account
      //   );
      //   if (!r) {
      //     return this.showAlert(
      //       "Error",
      //       "You cannot open this red packet by address " +
      //         this.redPacket.abbrAddress(account)
      //     );
      //   }
      // }
      // check password:
      // console.log(
      //   "passcode hash stored in contract:",
      //   this.redPacket.passcodeHash.toString()
      // );
      console.log("passcode from user input = " + passcode.toString());
      console.log("secret = " + secretBN);
      let { proof, publicSignals } = await this.prove(accountBN, secretBN);
      console.log(
        "proof:\n" +
          JSON.stringify(proof, null, 2) +
          "\n" +
          JSON.stringify(publicSignals, null, 2)
      );
      // let passcodeHashBN = BigInt(publicSignals[0]);
      // if (!passcodeHashBN.eq(this.redPacket.passcodeHash)) {
      //   return this.showAlert("Error", "Invalid password.");
      // }
      // open:
      let proofs = [
          proof.pi_a[0],
          proof.pi_a[1],
          proof.pi_b[0][1],
          proof.pi_b[0][0],
          proof.pi_b[1][1],
          proof.pi_b[1][0],
          proof.pi_c[0],
          proof.pi_c[1],
        ],
        signer = await getWeb3Provider().getSigner(),
        rpContract = new ethers.Contract(
          Consts.redPacketAddress,
          Consts.redPacketABI,
          signer
        ),
        loading = this.showLoading("Open", "Check red packet status...");
      for (let i = 0; i < proofs.length; i++) {
        // string -> BN:
        // proofs[i] = BigInt(proofs[i]).toHexString();
        proofs[i] = BigInt(proofs[i]);
      }
      try {
        // is opened?
        // let opened = await rpContract.isOpened(this.redPacket.id, account);
        // if (opened) {
        //   throw "You have already opened the red packet.";
        // }
        // loading.setMessage("Verify zk-proof...");
        // console.log("call verifyProof:");
        // for (let i = 0; i < proofs.length; i++) {
        //   console.log(proofs[i]);
        // }
        // console.log(this.redPacket.passcodeHash.toString());
        // console.log(accountBN.toHexString());
        // let r = await rpContract.verifyProof(
        //   [proofs[0], proofs[1]],
        //   [
        //     [proofs[2], proofs[3]],
        //     [proofs[4], proofs[5]],
        //   ],
        //   [proofs[6], proofs[7]],
        //   [passcodeHashBN.toHexString(), accountBN.toHexString()]
        // );
        // if (!r) {
        //   throw "Generate proof failed.";
        // }
        loading.setMessage("Please sign transaction in MetaMask...");
        console.log(
          "call open: " + this.redPacket.id + "[" + proofs.join(",") + "]"
        );
        let passcodeHash = BigInt(publicSignals[0]);
        let tx = await rpContract.claimHongbao(passcodeHash, proofs);
        loading.setMessage("Please wait for blockchain confirmation...");
        await tx.wait(1);
        loading.setMessage("Get transaction logs...");
        // get red packet id from log:
        let receipt = await getWeb3Provider().getTransactionReceipt(tx.hash);
        let logs = receipt.logs;
        for (let i = 0; i < logs.length; i++) {
          let log = logs[i];
          if (log.topics && log.topics[0] === this.redPacket.withdrawTopic) {
            this.bonusBN = BigInt("0x" + log.data.substring(66, 66 + 64), 16);
            console.log("bonus: " + this.bonusBN);
            break;
          }
        }
        // this.toAddress = this.redPacket.abbrAddress(account);
        this.opened = true;
        loading.close();
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
    tokenUrl(addr) {
      let c = this.BLOCKCHAINS[this.chainId];
      if (c) {
        return c.scan + "/token/" + addr;
      } else {
        return "#1";
      }
    },
    gotoScanUrl() {
      let c = this.BLOCKCHAINS[this.chainId];
      if (c) {
        window.open(c.scan + "/address/" + this.account);
      } else {
        console.error("Invalid chain id: ", this.chainId);
      }
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
      await this.loadRedPacket();
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
        await this.chainChanged(
          window.ethereum.request({
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
  <div>
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
        class="navbar navbar-expand-lg navbar-light"
        id="navbarExpand"
        style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99;
          background-color: red;
          background-size: cover;
        "
      >
        <div class="container">
          <a class="navbar-brand text-white" href="/" target="_blank"
            >Create Red Packet</a
          >
          <ul class="mr-2 navbar-nav">
            <li class="nav-item" @click="toList">
              <i class="bi bi-list-ul" />
              Explore
            </li>
          </ul>
          <ul
            id="wallet"
            class="mr-2 navbar-nav navbar-right-wrap"
            style="flex-direction: row !important"
          >
            <li class="nav-item">
              <span class="nav-link text-white"
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
              <a class="nav-link text-white" href="#0" v-on:click="gotoScanUrl">
                <i class="bi bi-wallet" />
                <span v-text="abbrAddress(account)"></span
              ></a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="pb-5" style="padding-top: 80px">
        <div v-show="invalid" class="row g-0 mt-4">
          <div class="col text-center">
            <p class="fs-1">Red Packet Not Found</p>
          </div>
        </div>

        <div v-show="!invalid && !ready" class="row g-0 mt-4">
          <div class="col text-center">
            <p>
              Please connect MetaMask with
              <span v-text="correctNetworkName"></span>
            </p>
          </div>
        </div>

        <div v-show="!invalid && loading" class="row g-0 mt-4">
          <div class="col text-center">
            <div class="spinner-border"></div>
          </div>
        </div>

        <div v-show="!invalid && loaded" class="row g-0 mt-4">
          <div class="col">
            <div
              v-if="redPacket.preview"
              class="alert alert-warning text-center mb-4"
              role="alert"
            >
              You are customize the red packet. Create the final URL by
              <a href="#0" v-on:click="signUrl">sign the parameters</a>. Check
              the
              <a
                href="https://github.com/michaelliao/red-packet-contract/blob/master/docs/customize.md"
                target="_blank"
                >document</a
              >
              for customization.
            </div>
            <div class="container g-0 red-packet">
              <div class="card golden-border">
                <div
                  class="card-body p-0"
                  v-bind:style="{ 'background-image': coverImage }"
                >
                  <div class="info text-center">
                    <div class="ms-4 me-4">
                      <div class="mt-5">Red Packet Sent by</div>
                      <div class="mt-2" v-text="creatorName"></div>
                      <div class="mt-5 fs-4" v-text="greeting"></div>
                      <div v-show="displayOpenInfo" class="mt-4 fs-7">
                        Opened
                        <span
                          v-text="redPacket.total - redPacket.totalLeft"
                        ></span>
                        /
                        <span v-text="redPacket.total"></span>
                      </div>
                      <div v-show="displayOpenInfo" class="mt-2 fs-7">
                        <span v-text="token && token.symbol"></span>
                        <span v-text="amountLeft"></span>
                        /
                        <span v-text="amount"></span>
                      </div>
                    </div>
                  </div>
                  <div v-show="opened" class="opened text-center">
                    <div class="m-2">
                      <div class="mt-5">Congratulations! You got</div>
                      <div class="mt-3 coin-logo">
                        <img v-bind:src="tokenIconUrl" />
                      </div>
                      <div class="mt-3 fs-4">
                        <span v-text="bonus"></span>
                        <span v-text="token && token.symbol"></span>
                      </div>
                      <div class="mt-5">Has received to</div>
                      <div class="mt-2" v-text="toAddress"></div>
                    </div>
                  </div>
                  <div class="triangle triangle-1"></div>
                  <div class="triangle triangle-2"></div>
                  <div class="triangle triangle-1-cover"></div>
                  <div class="triangle triangle-2-cover"></div>
                  <div class="rectangle-bottom"></div>
                  <div
                    v-show="!opened"
                    class="circle can-open"
                    v-on:click="openRedPacket"
                  >
                    <img v-bind:src="openImage" />
                  </div>
                </div>
              </div>
            </div>
            <div
              v-show="
                redPacket.condition !==
                '0x0000000000000000000000000000000000000000'
              "
              class="mt-4 mb-4 text-center text-white"
            >
              <span class="text-white"
                >* This red packet has address validation logic.</span
              >
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
            <div id="customize" style="display: none">
              <div
                class="card mt-4"
                style="width: 328px; margin-left: auto; margin-right: auto"
              >
                <div class="card-body">
                  <h5 class="card-title">Customize Red Packet</h5>
                  <form>
                    <input name="chain" type="hidden" value="" />
                    <input name="id" type="hidden" value="" />
                    <input name="preview" type="hidden" value="true" />
                    <div class="mb-3">
                      <label class="form-label">Greeting:</label>
                      <input
                        class="form-control form-control-sm"
                        maxlength="50"
                        name="rpGreeting"
                        placeholder="Best Wishes!"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Creator Name:</label>
                      <input
                        class="form-control form-control-sm"
                        maxlength="50"
                        name="rpCreator"
                        placeholder="0x"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Cover Image:</label>
                      <input
                        class="form-control form-control-sm"
                        maxlength="1000"
                        name="rpCoverImage"
                        placeholder="https://example.com/path/to/image.png"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Open Image:</label>
                      <input
                        class="form-control form-control-sm"
                        maxlength="1000"
                        name="rpOpenImage"
                        placeholder="https://example.com/path/to/image.png"
                      />
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Token Image:</label>
                      <input
                        class="form-control form-control-sm"
                        maxlength="1000"
                        name="rpIconImage"
                        placeholder="https://example.com/path/to/image.png"
                      />
                    </div>
                    <div class="mb-3 form-check">
                      <label class="form-check-label">
                        <input
                          class="form-check-input"
                          name="rpDisplayOpenInfo"
                          type="checkbox"
                          value="false"
                        />
                        Do Not Display Open Info</label
                      >
                    </div>
                    <button class="btn btn-outline-primary" @click="preview">
                      Preview
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  height: 100vh;
  background-size: cover;
  background-image: linear-gradient(
    30deg,
    #9943c7 0%,
    #c850c0 20%,
    #ffa770 100%
  );
}

.red-packet {
  width: 328px;
  color: #ebcc9a;
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

#navbarExpand {
  background-image: url("~../../assets/img/nav.png");
}
</style>
