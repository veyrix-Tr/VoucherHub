// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MerchantRegistry is Ownable {

    struct Merchant {
        address merchantAddress;
        string name;
        bool isActive;
    }
    mapping(address => Merchant) public merchants;

    event MerchantRegistered(address merchant, string name);
    event MerchantStatusUpdated(address merchant, bool isActive);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerMerchant(address _merchant, string memory _name) external onlyOwner {
        require(_merchant != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name required");
        require(merchants[_merchant].merchantAddress == address(0), "Already registered");
        merchants[_merchant] = Merchant({
            merchantAddress: _merchant,
            name: _name,
            isActive: true
        });
        emit MerchantRegistered(_merchant, _name);
    }

    function updateMerchantStatus(address _merchant, bool _status) external onlyOwner {
        require(merchants[_merchant].merchantAddress != address(0), "Not registered");
        merchants[_merchant].isActive = _status;
        emit MerchantStatusUpdated(_merchant, _status);
    }

    function isMerchant(address _merchant) public view returns(bool) {
        return merchants[_merchant].merchantAddress != address(0) && merchants[_merchant].isActive;
    }
}