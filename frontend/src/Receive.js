import React from "react";
import {BigNumber, ethers} from "ethers";

export class Receive extends React.Component {

    state = {
        deposits: []
    };

    componentDidMount() {
        this.updateDeposits();
    }

    componentWillUnmount() {
        this.setState = () => {
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.address !== this.props.address) {
            this.updateDeposits();
        }
    }

    render() {
        return <div>
            <table className="table">
                <thead>
                <tr>
                    <th scope="col">From</th>
                    <th scope="col">Amount</th>
                </tr>
                </thead>
                <tbody>
                {this.state.deposits.map(deposit => <tr key={deposit.from}>
                    <td>{deposit.from}</td>
                    <td>{deposit.amount}</td>
                    <td>
                        <button type="button" className="btn btn-primary"
                                onClick={() => this.claimDeposit(deposit)}>Claim
                        </button>
                    </td>
                </tr>)}
                </tbody>
            </table>
        </div>
    }

    async updateDeposits() {
        const {escrow} = this.props;
        if (escrow) {
            const fromAddresses = await this.getDepositFromAddresses();
            const depositsPromiseList = fromAddresses.map(from => {
                return escrow.depositorToCollector(from, this.props.address).then(deposit => {
                    return {from: from, amount: deposit.amount};
                });
            });
            const deposits = await Promise.all(depositsPromiseList);
            const formattedDeposits = deposits
                .filter(deposit => !deposit.amount.eq(BigNumber.from(0)))
                .map(deposit => {
                    return {from: deposit.from, amount: ethers.utils.formatEther(deposit.amount)}
                })
                .sort((d1, d2) => d2.amount - d1.amount);
            this.setState({deposits: formattedDeposits});
        }
    }

    getDepositFromAddresses() {
        const escrow = this.props.escrow;
        const filter = escrow.filters.DepositCompleted(null, this.props.address, null)
        return escrow.queryFilter(filter).then(events => {
            const fromAddresses = events.map((e) => e.args.from);
            return [...new Set(fromAddresses)];
        })
    }

    claimDeposit(deposit) {
        const escrow = this.props.escrow;
        escrow.receiveDeposit(deposit.from).then(() => this.updateDeposits());
    }

}