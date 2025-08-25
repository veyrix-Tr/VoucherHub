VoucherData {
  voucherId: number
  merchant: address
  maxMint: number
  expiry: timestamp
  metadataHash: hash //immutability
  metadataCID: ipfs link //link
  price: number
  nonce: number
}
