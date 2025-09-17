// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MerchantRegistry.sol";


contract VoucherERC1155 is ERC1155, EIP712, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    MerchantRegistry public immutable merchantRegistry;
    
    struct VoucherData {
        uint256 voucherId;
        address merchant;
        uint256 maxMint;
        uint256 expiry;
        bytes32 metadataHash;
        string metadataCID;
        uint256 price;
        uint256 nonce;
    }
    mapping(uint256 => uint256) public minted;
    mapping(uint256 => string) public voucherCID;
    mapping(uint256 => VoucherData) public voucherInfo;
    mapping(uint256 => bool) public voucherApproved;


    constructor(string memory baseURI, address _merchantRegistry) 
        ERC1155(baseURI) 
        EIP712("VoucherERC1155", "1")
        Ownable(msg.sender)
    {
        merchantRegistry = MerchantRegistry(_merchantRegistry);
    }

    // it defines type of the voucher in hash format to avoid any change in VoucherData's type
    bytes32 private constant VOUCHER_TYPEHASH = keccak256(
        "VoucherData(uint256 voucherId,address merchant,uint256 maxMint,uint256 expiry,bytes32 metadataHash,string metadataCID,uint256 price,uint256 nonce)"
    );

    //useful for verify signer in _verifyVoucher
    function _hashVoucher(VoucherData memory _voucherData) public pure returns (bytes32) {
        bytes32 metadataCIDHash = keccak256(bytes(_voucherData.metadataCID));
        return keccak256(abi.encode(
            VOUCHER_TYPEHASH,
            _voucherData.voucherId,
            _voucherData.merchant,
            _voucherData.maxMint,
            _voucherData.expiry,
            _voucherData.metadataHash,
            metadataCIDHash,
            _voucherData.price,
            _voucherData.nonce
        ));
    }

    // can use directly but wanted to make it public
    function hashTypedDataV4Public(bytes32 structHash) public view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }

    // for verifying the voucher before minting it returns the address of signer
    function _verifyVoucher(VoucherData memory _voucherData, bytes memory signature) internal view returns (address) {
        bytes32 structHash = _hashVoucher(_voucherData);
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature);
    }

    // for minting voucher by user after issuing by merchant and approved by owner
    event VoucherMinted(uint256 indexed voucherId, address indexed to, uint256 amount, string metadataCID);
    function mintFromVoucher(VoucherData calldata v, bytes calldata signature, uint256 amount, address to) external nonReentrant {
        require(voucherApproved[v.voucherId], "Voucher not approved");
        require(block.timestamp <= v.expiry, "Voucher expired");
        require(minted[v.voucherId] + amount <= v.maxMint, "maxMint exceeded");
        address signer = _verifyVoucher(v, signature);
        require(signer == v.merchant, "invalid signer");

        require(merchantRegistry.isMerchant(signer), "merchant not approved");

        if (bytes(voucherCID[v.voucherId]).length == 0) {
            voucherCID[v.voucherId] = v.metadataCID;
            emit URI(v.metadataCID, v.voucherId);
        }
        _mint(to, v.voucherId, amount, "");
        minted[v.voucherId] += amount;
        emit VoucherMinted(v.voucherId, to, amount, v.metadataCID);
    }

    // for burning to redeem the voucher
    event Redeemed(uint256 indexed voucherId, address indexed who, uint256 amount, uint256 time);
    function burnForRedeem(uint256 voucherId, uint256 amount) external nonReentrant {
        _burn(msg.sender, voucherId, amount);
        emit Redeemed(voucherId, msg.sender, amount, block.timestamp);
    }

    // Returns the metadata URI for a given voucher ID (overrides ERC1155 default URI) if metaData URI doesn't exist it just fallback to the parent (ERC1155) implementation with super.uri(id)
    function uri(uint256 id) public view override returns (string memory) {
        if (bytes(voucherCID[id]).length > 0) {
            return voucherCID[id];
        }
        return super.uri(id);
    }

    // for owner to approve or reject the Voucher issue request by merchant
    function setVoucherApproval(uint256 voucherId, bool status) external onlyOwner {
        voucherApproved[voucherId] = status;
    }

}
