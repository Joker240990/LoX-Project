// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeManager is Ownable {
    address public treasury;
    uint256 public cryptoFee; // basis points, e.g. 200 = 2%
    uint256 public fiatFee;   // basis points

    event FeesUpdated(uint256 cryptoFee, uint256 fiatFee);
    event TreasuryUpdated(address treasury);

    constructor(address _treasury) {
        require(_treasury != address(0));
        treasury = _treasury;
        cryptoFee = 200;
        fiatFee = 400;
    }

    function setFees(uint256 _cryptoFee, uint256 _fiatFee) external onlyOwner {
        require(_cryptoFee <= 2000 && _fiatFee <= 2000, "too high");
        cryptoFee = _cryptoFee;
        fiatFee = _fiatFee;
        emit FeesUpdated(cryptoFee, fiatFee);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0));
        treasury = _treasury;
        emit TreasuryUpdated(treasury);
    }

    // helper to apply fee and send to treasury
    function applyCryptoFee(address token, address from, address to, uint256 amount) external onlyOwner returns (uint256) {
        uint256 fee = (amount * cryptoFee) / 10000;
        if (fee > 0) {
            IERC20(token).transferFrom(from, treasury, fee);
        }
        return amount - fee;
    }
}
