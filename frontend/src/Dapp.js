import React from "react";

import EscrowArtifact from "./contracts/Escrow.json";
import contractAddress from "./contracts/contract-address.json";
import {ethers} from "ethers";

const HARDHAT_NETWORK_ID = '31337';

export class Dapp extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.initialState = {
            selectedAddress: undefined,
            escrow: undefined
        };

        this.state = this.initialState;
    }

    componentDidMount() {
        this._connectWallet();
    }

    render() {
        if (window.ethereum === undefined) {
            return <h2>Install ethereum wallet wallet</h2>;
        }

        if (!this.state.selectedAddress) {
            return (
                <div>Connect your Metamask with HardHat network</div>
            );
        }

        return <div>Wallet connected</div>;
    }

    async _connectWallet() {
        const addresses = await window.ethereum.request({method: 'eth_requestAccounts'});
        const selectedAddress = addresses[0];

        if (!this._checkNetwork()) {
            return;
        }
        this._initialize(selectedAddress);

        window.ethereum.on("accountsChanged", ([newAddress]) => {
            if (newAddress === undefined) {
                return this._resetState();
            }

            this._initialize(newAddress);
        });

        window.ethereum.on("chainChanged", ([_]) => {
            this._resetState();

        });
    }

    _checkNetwork() {
        return window.ethereum.networkVersion === HARDHAT_NETWORK_ID;

    }

    _initialize(userAddress) {
        this.setState({
            selectedAddress: userAddress,
        });
        this._intializeEthers();
    }

    async _intializeEthers() {
        this._provider = new ethers.providers.Web3Provider(window.ethereum);
        const escrow = new ethers.Contract(
            contractAddress.Escrow,
            EscrowArtifact.abi,
            this._provider.getSigner(0)
        );
        this.setState({escrow: escrow})
    }

    _resetState() {
        this.setState(this.initialState);
        this._connectWallet();
    }

}