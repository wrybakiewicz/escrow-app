.PHONY: test

accounts:
	npx hardhat accounts

compile:
	npx hardhat compile

test:
	npx hardhat test

deploy:
	npx hardhat run scripts/deploy-escrow.script.js --network localhost

node:
	npx hardhat node