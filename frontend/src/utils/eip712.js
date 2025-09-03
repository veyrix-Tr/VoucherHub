function buildVoucherTypedData(domain, voucherData) {
  return {
    domain,
    types: {
      VoucherData: [
        { name: "voucherId", type: "uint256" },
        { name: "merchant", type: "address" },
        { name: "maxMint", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "metadataHash", type: "bytes32" },
        { name: "metadataCID", type: "string" },
        { name: "price", type: "uint256" },
        { name: "nonce", type: "uint256" }
      ]
    },
    primaryType: "VoucherData",
    message: voucherData,
  };
}

export default buildVoucherTypedData();
