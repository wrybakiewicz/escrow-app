# Escrow Dapp

Write an escrow Smart Contract which helps users facilitate transactions. User A should be able to deposit funds in the Smart Contract while user B should be able to withdraw the previously deposited funds from user A.

You can add a timelock-like feature where funds will be automatically sent back to the depositor after a certain number of blocks has been mined and the funds haven't been withdrawn by user B.
## How to run
- `make node`
- `make compile deploy`
- from ./client `npm install` `npm start`