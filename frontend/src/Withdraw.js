import React from "react";
import {BigNumber, ethers} from "ethers";
import moment from "moment";
import {toast} from "react-toastify";

export class Withdraw extends React.Component {

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
                    <th scope="col">To</th>
                    <th scope="col">Lock end</th>
                    <th scope="col">Amount</th>
                </tr>
                </thead>
                <tbody>
                {this.state.deposits.map(deposit => <tr key={deposit.to}>
                    <td>{deposit.to}</td>
                    <td>{deposit.lockEnd.format('DD/MM/YYYY HH:mm')}</td>
                    <td>{ethers.utils.formatEther(deposit.amount)}</td>
                    <td>
                        <button type="button" className="btn btn-primary"
                                disabled={!this.canClaim(deposit)}
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
            const toAddresses = await this.getDepositToAddresses();
            const depositsPromiseList = toAddresses.map(to => {
                return escrow.depositorToCollector(this.props.address, to).then(deposit => {
                    return {to: to, amount: deposit.amount, lockEnd: deposit.lockEnd};
                });
            });
            const deposits = await Promise.all(depositsPromiseList);
            const formattedDeposits = deposits
                .filter(deposit => !deposit.amount.eq(BigNumber.from(0)))
                .map(deposit => {
                    const lockEnd = moment(deposit.lockEnd.toNumber() * 1000);
                    return {to: deposit.to, amount: deposit.amount, lockEnd: lockEnd}
                })
                .sort((d1, d2) => d2.amount - d1.amount);
            this.setState({deposits: formattedDeposits});
        }
    }

    getDepositToAddresses() {
        const escrow = this.props.escrow;
        const filter = escrow.filters.DepositCompleted(this.props.address, null, null)
        return escrow.queryFilter(filter).then(events => {
            const toAddresses = events.map((e) => e.args.to);
            return [...new Set(toAddresses)];
        })
    }

    async claimDeposit(deposit) {
        const escrow = this.props.escrow;
        const withdrawPromise = escrow.withdrawDeposit(deposit.to)
            .then(withdrawTx => withdrawTx.wait())
            .then(() => this.updateDeposits());
        toast.promise(withdrawPromise, {
            pending: 'Withdraw transaction in progress',
            success: 'Withdraw transaction succeed 👌',
            error: 'Withdraw transaction failed 🤯'
        });
    }

    canClaim(deposit) {
        return deposit.lockEnd.isBefore(moment());
    }

}