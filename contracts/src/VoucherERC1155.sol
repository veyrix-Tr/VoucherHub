// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VoucherERC1155 is ERC1155, EIP712, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    address public merchantRegistry;
    
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
        merchantRegistry = _merchantRegistry;
    }

    bytes32 private constant VOUCHER_TYPEHASH = keccak256(
        "VoucherData(uint256 voucherId,address merchant,uint256 maxMint,uint256 expiry,bytes32 metadataHash,string metadataCID,uint256 price,uint256 nonce)"
    );

    function _hashVoucher(VoucherData memory _voucherData) internal pure returns (bytes32) {
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

    function _verifyVoucher(VoucherData memory _voucherData, bytes memory signature) internal view returns (address) {
        bytes32 structHash = _hashVoucher(_voucherData);
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, signature);
    }

    event VoucherMinted(uint256 indexed voucherId, address indexed to, uint256 amount, string metadataCID);

    function mintFromVoucher(VoucherData calldata v, bytes calldata signature, uint256 amount, address to) external nonReentrant {
        require(voucherApproved[v.voucherId], "Voucher not approved");
        require(block.timestamp <= v.expiry, "Voucher expired");
        require(minted[v.voucherId] + amount <= v.maxMint, "maxMint exceeded");
        address signer = _verifyVoucher(v, signature);
        require(signer == v.merchant, "invalid signer");

        (bool ok, bytes memory data) = merchantRegistry.call(abi.encodeWithSignature("isMerchant(address)", signer));
        require(ok && data.length > 0 && abi.decode(data, (bool)), "merchant not approved");

        if (bytes(voucherCID[v.voucherId]).length == 0) {
            voucherCID[v.voucherId] = v.metadataCID;
            emit URI(v.metadataCID, v.voucherId);
        }
        minted[v.voucherId] += amount;
        _mint(to, v.voucherId, amount, "");
        emit VoucherMinted(v.voucherId, to, amount, v.metadataCID);

    }

    event Redeemed(uint256 indexed voucherId, address indexed who, uint256 amount, uint256 time);

    function burnForRedeem(uint256 voucherId, uint256 amount) external nonReentrant {
        _burn(msg.sender, voucherId, amount);
        emit Redeemed(voucherId, msg.sender, amount, block.timestamp);
    }

    function uri(uint256 id) public view override returns (string memory) {
        if (bytes(voucherCID[id]).length > 0) {
            return voucherCID[id];
        }
        return super.uri(id);
    }

    function setVoucherApproval(uint256 voucherId, bool status) external onlyOwner {
        voucherApproved[voucherId] = status;
    }

}
