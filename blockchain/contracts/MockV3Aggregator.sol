// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockV3Aggregator {
    uint8 public decimals;
    int256 private latestAnswer;
    uint80 public latestRoundId;
    uint256 public latestTimestamp;

    event AnswerUpdated(int256 current, uint80 roundId, uint256 timestamp);

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        updateAnswer(_initialAnswer);
    }

    function updateAnswer(int256 _answer) public {
        latestAnswer = _answer;
        latestRoundId++;
        latestTimestamp = block.timestamp;
        emit AnswerUpdated(_answer, latestRoundId, latestTimestamp);
    }

    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (latestRoundId, latestAnswer, latestTimestamp, latestTimestamp, latestRoundId);
    }
}
