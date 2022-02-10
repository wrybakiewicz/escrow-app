const hre = require("hardhat");

async function main() {
    const Escrow = await hre.ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(100);

    await escrow.deployed();

    console.log("Escrow deployed to:", escrow.address);

    saveFrontendFiles(escrow);
}

function saveFrontendFiles(escrow) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../frontend/src/contracts";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + "/contract-address.json",
        JSON.stringify({ Escrow: escrow.address }, undefined, 2)
    );

    const EscrowArtifact = artifacts.readArtifactSync("Escrow");

    fs.writeFileSync(
        contractsDir + "/Escrow.json",
        JSON.stringify(EscrowArtifact, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
