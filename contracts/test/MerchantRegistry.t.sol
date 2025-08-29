// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MerchantRegistry.sol";

contract MerchantRegistryTest is Test {
    MerchantRegistry registry;
    address owner = address(this);
    address merchant1 = address(0x123);

    function setUp() public {
        registry = new MerchantRegistry(owner);
    }

    function testRegisterMerchant() public {
        registry.registerMerchant(merchant1, "Amazon");
        (address mAddr, string memory mName, bool status) = registry.merchants(merchant1);
        assertEq(mAddr, merchant1);
        assertEq(mName, "Amazon");
        assertEq(status, true);
    }

    function testUpdateMerchantStatus() public {
        registry.registerMerchant(merchant1, "Amazon");
        registry.updateMerchantStatus(merchant1, false);
        (, , bool status) = registry.merchants(merchant1);
        assertEq(status, false);
    }

    function test_RevertIf_DuplicateRegistration() public {
        registry.registerMerchant(merchant1, "Amazon");

        vm.expectRevert(bytes("Already registered"));
        registry.registerMerchant(merchant1, "AmazonAgain"); // should fail
    }
}