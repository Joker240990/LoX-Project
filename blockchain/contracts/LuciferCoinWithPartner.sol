// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Core LoX token with locked reserve + partner reserve gated by oracle price
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract LuciferCoinWithPartner is ERC20, Ownable {
    uint256 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 666_000_000 * (10 ** DECIMALS);
    uint256 public constant LOCKED_SUPPLY = 666_666 * (10 ** DECIMALS);
    uint256 public constant PARTNER_SUPPLY = 6_666 * (10 ** DECIMALS);

    address public reserveWallet;
    address public partnerWallet;

    bool public reserveReleased;
    bool public partnerReleased;

    AggregatorV3Interface public priceFeed;

    event ReserveReleased(address to, uint256 amount);
    event PartnerReserveReleased(address to, uint256 amount);
    event PriceFeedUpdated(address feed);

    constructor(address _reserveWallet, address _partnerWallet) ERC20("LuciferCoin", "LoX") {
        require(_reserveWallet != address(0) && _partnerWallet != address(0), "zero address");
        reserveWallet = _reserveWallet;
        partnerWallet = _partnerWallet;
        _mint(msg.sender, INITIAL_SUPPLY);
        // mint locked tokens to contract
        _mint(address(this), LOCKED_SUPPLY + PARTNER_SUPPLY);
    }

    // Owner can set Chainlink-compatible price feed (LoX / USD)
    function setPriceFeed(address _feed) external onlyOwner {
        priceFeed = AggregatorV3Interface(_feed);
        emit PriceFeedUpdated(_feed);
    }

    function releaseReserve() external onlyOwner {
        require(!reserveReleased, "reserve already released");
        reserveReleased = true;
        uint256 amount = LOCKED_SUPPLY;
        super._transfer(address(this), reserveWallet, amount);
        emit ReserveReleased(reserveWallet, amount);
    }

    // Release partner reserve only if oracle price >= 1000 USD
    function releasePartnerReserve() external onlyOwner {
        require(!partnerReleased, "partner reserve released");
        require(address(priceFeed) != address(0), "price feed not set");
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "invalid price");
        uint8 feedDecimals = priceFeed.decimals();
        uint256 priceInWei;
        if (feedDecimals <= 18) {
            priceInWei = uint256(price) * (10 ** (18 - feedDecimals));
        } else {
            priceInWei = uint256(price) / (10 ** (feedDecimals - 18));
        }
        uint256 threshold = 1000 * (10 ** 18);
        require(priceInWei >= threshold, "price below $1000");
        partnerReleased = true;
        super._transfer(address(this), partnerWallet, PARTNER_SUPPLY);
        emit PartnerReserveReleased(partnerWallet, PARTNER_SUPPLY);
    }
}
