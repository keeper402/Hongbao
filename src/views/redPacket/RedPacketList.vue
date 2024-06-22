<script>
import {RedPacket} from "@/utils/RedPacket";
import {getWeb3Provider} from "@/utils/WalletUtil";
import {chains} from "@/assets/js/chains";
import {ethers} from "ethers";
import request from "@/utils/request";

export default {
  data() {
    return {
      account: null,
      chainId: 0,
      selectedChainId: 137,
      loaded: false,
      loading: false,
      redPackets: [],
      version: 0,
      BLOCKCHAINS: chains.BLOCKCHAINS,
      ETH_ADDRESS: chains.ETH_ADDRESS,
      ZERO_ADDRESS: chains.ZERO_ADDRESS,
    };
  },
  computed: {
    ready() {
      return this.account && this.BLOCKCHAINS[this.chainId];
    },
    networkName() {
      if (this.account) {
        let c = this.BLOCKCHAINS[this.chainId];
        if (c) {
          return c.name;
        }
        return "Unsupported Network (0x" + this.chainId.toString(16) + ")";
      }
      return "Not Connected";
    },
  },
  methods: {
    toReceive(params) {
      this.$router.push({
        name: "redPacketReceive",
        params
      });
    },
    async postJson(url, data) {
      request({
        method: 'post',
        url,
        data
      })
    },
    async loadRedPackets() {
      if (this.loaded) {
        return;
      }
      this.version++;
      this.redPackets = [];

      console.log("start load redpackets...");
      this.loading = true;
      let currentChain = this.selectedChainId;
      let currentVersion = this.version;
      try {
        let query = {
          query: `{
  creates(first: 20, orderBy: redPacketId, orderDirection: desc) {
    id
    redPacketId
    creator
    token
    amount
    total
    bonusType
  }
}`,
        };
        let list = await this.postJson(
            "https://api.thegraph.com/subgraphs/name/michaelliao/redpacket",
            query,
        );
        console.log(list);
        let rps = [];
        if (list) {
          for (let c of list.data.creates) {
            let redPacket = new RedPacket();
            this.chain = currentChain;
            redPacket.id = c.redPacketId;
            redPacket.creator = c.creator;
            redPacket.token = c.token;
            redPacket.amount = c.amount;
            redPacket.total = c.total;
            redPacket.bonusType = c.bonusType;

            rps.push(redPacket);
          }
        }
        this.redPackets = rps;
        this.version++;
        this.loaded = true;
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
    },
    tokenIconUrl(addr) {
      let c = this.BLOCKCHAINS[this.selectedChainId];
      if (c) {
        const t = c.tokens.find((t) => t.address === addr.toLowerCase());
        if (t) {
          return t.icon;
        }
      }
      return "@/assets/icons/default.svg";
    },
    tokenUrl(addr) {
      let c = this.BLOCKCHAINS[this.selectedChainId];
      if (c) {
        if (addr.toLowerCase() === this.ETH_ADDRESS) {
          return c.scan;
        }
        return c.scan + "/token/" + addr;
      } else {
        return "#1";
      }
    },
    tokenSymbol(addr) {
      let c = this.BLOCKCHAINS[this.selectedChainId];
      if (c) {
        let token = c.tokens.find((t) => t.address === addr.toLowerCase());
        if (token) {
          return token.symbol;
        }
      }
      return this.abbrAddress(addr);
    },
    scanUrl(addr) {
      let c = this.BLOCKCHAINS[this.selectedChainId];
      if (c) {
        return c.scan + "/address/" + addr;
      } else {
        return "#1";
      }
    },
    gotoScanUrl(addr) {
      let c = this.BLOCKCHAINS[this.chainId];
      if (c) {
        this.open(c.scan + "/address/" + addr);
      } else {
        console.error("Invalid chain id: ", this.chainId);
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
    accountChanged(accounts) {
      console.log(
          "wallet account changed:",
          accounts.length === 0 ? null : accounts[0],
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
          "wallet chainId changed: " + chainId + " = " + parseInt(chainId, 16),
      );
      this.chainId = parseInt(chainId, 16);
    },
    async connectWallet() {
      console.log("try connect wallet...");
      if (getWeb3Provider() === null) {
        console.error("there is no web3 provider.");
        return false;
      }
      try {
        await this.accountChanged(
            window.ethereum.request({
              method: "eth_requestAccounts",
            }),
        );
        await this.chainChanged(
            window.ethereum.request({
              method: "eth_chainId",
            }),
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
  mounted() {
    this.connectWallet();
    this.loadRedPackets();
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

    <div id="vm" class="container" style="display: none">
      <nav
          class="navbar navbar-expand-lg navbar-light"
          style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99;
          background-image: url(@/assets/img/nav.png);
          background-size: cover;
        "
      >
        <div class="container">
          <a class="navbar-brand text-white" href="/" target="_blank"
          >Create Red Packet</a
          >
          <ul class="mr-2 navbar-nav">
            <li class="nav-item">
              <span class="nav-link active text-white">
                <i class="bi bi-list-ul"/>
                Explore
              </span>
            </li>
          </ul>
          <ul
              id="wallet"
              class="mr-2 navbar-nav navbar-right-wrap"
              style="flex-direction: row !important"
          >
            <li class="nav-item">
              <span class="nav-link text-white"
              ><i class="bi bi-globe"/>
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
              <a class="nav-link text-white" href="#0" v-on:click="gotoScanUrl"
              >
                <i class="bi bi-wallet"/>
                <span v-text="abbrAddress(account)"></span
                ></a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="pb-5" style="padding-top: 80px">
        <div class="row g-0 mt-4">
          <div class="col-12 mb-4">
            <select class="form-select" style="width: 30%">
              <option selected>Polygon</option>
            </select>
          </div>

          <div v-show="loading" class="col-12 mb-4">
            <div class="spinner-border text-white"></div>
          </div>

          <div v-show="loaded" class="col-12 mb-4">
            <table class="table text-white">
              <thead>
              <tr>
                <th scope="col"># ID</th>
                <th scope="col">Type</th>
                <th scope="col">Token</th>
                <th scope="col">Participates</th>
                <th scope="col">Creator</th>
                <th scope="col">Action</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="rp in redPackets">
                <td v-text="rp.id"></td>
                <td v-text="rp.bonusType == 0 ? 'Identical' : 'Random'"></td>
                <td>
                  <a
                      class="text-white"
                      target="_blank"
                      v-bind:href="tokenUrl(rp.token)"
                  ><span v-text="tokenSymbol(rp.token)"></span>
                    <i class="bi bi-box-arrow-up-right"></i
                    ></a>
                </td>
                <td v-text="rp.total"></td>
                <td>
                  <a
                      class="text-white"
                      target="_blank"
                      v-bind:href="scanUrl(rp.creator)"
                  ><span v-text="abbrAddress(rp.creator)"></span>
                    <i class="bi bi-box-arrow-up-right"></i
                    ></a>
                </td>
                <td @click="toReceive({
                  chain: rp.chain,
                  id: rp.id
                })">
                  <a
                      class="text-white"
                  >
                    🧧 Try Open!
                    <i class="bi bi-box-arrow-up-right"/>
                  </a>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="col-12">
            <div class="alert alert-warning text-center mb-4" role="alert">
              Please note the query service is only available on Polygon now.
              Query services on other chains are still under construction.
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

.fs-7 {
  font-size: 0.875rem;
}

a {
  text-decoration: none;
}
</style>
