import fs from 'fs';
import { ethers } from 'ethers';

async function main() {

    const raw = fs.readFileSync(new URL('../sample-metadata.json', import.meta.url), 'utf8');
    const metadata = JSON.parse(raw);
    const jsonString = JSON.stringify(metadata); // keep this stable and ensuring consistent formatting
    const metadataHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(jsonString));

    const voucherData = {
        voucherId: 1,
        merchant: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
        maxMint: 100,
        expiry: 1735689600,
        metadataHash,
        metadataCID: 'Qm...actual_cid...',
        price: ethers.utils.parseEther('0.05'),
        nonce: 1
    };

    const types = {
        VoucherData: [
            { name: 'voucherId', type: 'uint256' },
            { name: 'merchant', type: 'address' },
            { name: 'maxMint', type: 'uint256' },
            { name: 'expiry', type: 'uint256' },
            { name: 'metadataHash', type: 'bytes32' },
            { name: 'metadataCID', type: 'string' },
            { name: 'price', type: 'uint256' },
            { name: 'nonce', type: 'uint256' }
        ]
    };

    const domain = {
        name: 'VoucherERC1155',
        version: '1',
        chainId: 31337,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    };

    const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
    const signer = new ethers.Wallet(privateKey);

    const signature = await signer._signTypedData(domain, types, voucherData);
    console.log("Signature:", signature);

    fs.writeFileSync(
        "../sample-voucher.json",
        JSON.stringify({ voucherData, signature }, null, 2)
    );
    console.log("Voucher signed and saved!");
}
main().catch(console.error);

