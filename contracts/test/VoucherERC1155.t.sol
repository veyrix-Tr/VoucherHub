// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VoucherERC1155.sol";
import "../src/MerchantRegistry.sol";

contract VoucherERC1155Test is Test {
    VoucherERC1155 voucher;
    MerchantRegistry registry;

    address admin = address(1);
    address merchant = vm.addr(2);
    address user = address(3);

    function setUp() public {
        vm.startPrank(admin);
        registry = new MerchantRegistry(admin);
        voucher = new VoucherERC1155("https://baseuri/", address(registry));
        registry.registerMerchant(merchant, "Merchant1");
        vm.stopPrank();
    }

    function _dummyVoucher(uint256 id) internal view returns (VoucherERC1155.VoucherData memory) {
        return VoucherERC1155.VoucherData({
            voucherId: id,
            merchant: merchant,
            maxMint: 10,
            expiry: block.timestamp + 1 days,
            metadataHash: keccak256("ipfsHash"),
            metadataCID: "Qm123",
            price: 0,
            nonce: 1
        });
    }
    
    function signWithVoucherData(VoucherERC1155.VoucherData memory _voucherData, uint256 _privateKey) public view returns (bytes memory) {
        bytes32 digest = voucher.hashTypedDataV4Public(voucher._hashVoucher(_voucherData));
        (uint8 v_, bytes32 r, bytes32 s) = vm.sign(_privateKey, digest);
        return abi.encodePacked(r, s, v_);
    }

    function testMintFailsWithoutApproval() public {
        VoucherERC1155.VoucherData memory v = _dummyVoucher(1);
        bytes memory sig = signWithVoucherData(v, 2);

        vm.startPrank(user);
        vm.expectRevert("Voucher not approved");
        voucher.mintFromVoucher(v, sig, 1, user);
        vm.stopPrank();
    }

    function testMintWorksAfterApproval() public {
        VoucherERC1155.VoucherData memory v = _dummyVoucher(2);
        bytes memory sig = signWithVoucherData(v, 2);

        vm.prank(admin);
        voucher.setVoucherApproval(2, true);

        vm.startPrank(user);
        voucher.mintFromVoucher(v, sig, 2, user);
        vm.stopPrank();

        assertEq(voucher.balanceOf(user, 2), 2);
    }

    function testMintFailsAfterRevoke() public {
        VoucherERC1155.VoucherData memory v = _dummyVoucher(3);
        bytes memory sig = signWithVoucherData(v, 2);

        vm.prank(admin);
        voucher.setVoucherApproval(3, true);
        vm.prank(admin);
        voucher.setVoucherApproval(3, false);

        vm.startPrank(user);
        vm.expectRevert("Voucher not approved");
        voucher.mintFromVoucher(v, sig, 1, user);
        vm.stopPrank();
    }
}
