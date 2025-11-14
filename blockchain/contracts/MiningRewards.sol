// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MiningRewards is Ownable, Pausable {
    using ECDSA for bytes32;

    IERC20 public immutable lox;
    address public signer;
    uint256 public dailyCap;
    uint256 public userCooldown;

    mapping(bytes32 => bool) public usedNonce;
    mapping(uint256 => uint256) public mintedByDay;
    mapping(address => uint256) public lastClaimAt;

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant CLAIM_TYPEHASH = keccak256("Claim(address user,uint256 amount,uint256 period,bytes32 nonce,uint256 deadline)");

    event Claimed(address indexed user, uint256 amount, uint256 period, bytes32 nonce);

    constructor(address _lox, address _signer, uint256 _dailyCap, uint256 _cooldown) {
        require(_lox != address(0));
        lox = IERC20(_lox);
        signer = _signer;
        dailyCap = _dailyCap;
        userCooldown = _cooldown;

        uint256 chainId;
        assembly { chainId := chainid() }
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes("LoX-MiningRewards")),
            keccak256(bytes("1")),
            chainId,
            address(this)
        ));
    }

    function setSigner(address s) external onlyOwner { signer = s; }
    function setDailyCap(uint256 c) external onlyOwner { dailyCap = c; }
    function setCooldown(uint256 secs) external onlyOwner { userCooldown = secs; }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _dayIndex(uint256 ts) internal pure returns (uint256) { return ts / 1 days; }

    function claim(address user, uint256 amount, uint256 period, bytes32 nonce, uint256 deadline, bytes calldata sig) external whenNotPaused {
        require(block.timestamp <= deadline, "expired");
        require(!usedNonce[nonce], "nonce-used");
        require(user == msg.sender, "only recipient");
        require(block.timestamp >= lastClaimAt[user] + userCooldown, "cooldown");
        uint256 dayIdx = _dayIndex(block.timestamp);
        require(mintedByDay[dayIdx] + amount <= dailyCap, "daily-cap");

        bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, user, amount, period, nonce, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address recovered = ECDSA.recover(digest, sig);
        require(recovered == signer, "invalid-sig");

        usedNonce[nonce] = true;
        mintedByDay[dayIdx] += amount;
        lastClaimAt[user] = block.timestamp;
        require(lox.transfer(user, amount), "lox transfer failed");

        emit Claimed(user, amount, period, nonce);
    }
}
