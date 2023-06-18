// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.11;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Verifier} from "./SumpleteVerifier.sol";

contract Sumplete is ERC20, Verifier {
    constructor() public ERC20("Sumplete", "SUMPLETE") {}

    function check(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[15] memory input
    ) external {
        bool result = verifyProof(a, b, c, input);
        if (result == true) {
            _mint(msg.sender, 1 ether);
        }
    }
}
