import React from "react";
import {ethers} from "ethers";

export class Deposit extends React.Component {

    state = {
        lockTime: undefined,
        receiver: "",
        amount: ""
    };

    componentDidMount() {
        this.updateLockTime();
    }

    componentWillUnmount() {
        this.setState = () => {
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.state.lockTime) {
            this.updateLockTime();
        }
    }

    render() {
        if (!this.state.lockTime) {
            return <div></div>;
        }

        return <div className="d-flex justify-content-center p-4">
            <form>
                <div className="form-group">
                    <label>Receiver address</label>
                    <input type="text" className="form-control" placeholder="Address" value={this.state.receiver}
                           onChange={e => this.setState({receiver: e.target.value})}/>
                </div>
                <div className="form-group">
                    <label>ETH Amount</label>
                    <input type="number" className="form-control" placeholder="Amount" value={this.state.amount}
                           onChange={e => this.setState({amount: e.target.value})}/>
                </div>
                <div>
                    <label>Lock duration: {this.state.lockTime} seconds</label>
                </div>
                <button type="submit" className="btn btn-primary" onClick={() => this.deposit()}>Deposit</button>
            </form>
        </div>
    }

    async updateLockTime() {
        const {escrow} = this.props;
        if (escrow) {
            const lockTime = await escrow.lockTime();
            this.setState({lockTime: lockTime.toNumber()});
        }
    }

    async deposit() {
        const {escrow} = this.props;
        const value = ethers.utils.parseEther(this.state.amount);
        await escrow.deposit(this.state.receiver, {value: value});
        this.setState({receiver: "", amount: ""})
    }

}