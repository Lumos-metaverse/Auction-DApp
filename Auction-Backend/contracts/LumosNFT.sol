//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract LumosNFT is ERC721URIStorage {
     uint256 private _tokenIds = 1;


    constructor() ERC721("Lumos NFT", "LMS") {}

    function mintNFT(string memory tokenURI) external returns (uint256) {
       
        uint256 newtokenId = _tokenIds;
        _mint(msg.sender, newtokenId);
        _setTokenURI(newtokenId, tokenURI);

        _tokenIds = _tokenIds + 1;
       
        return newtokenId;
    }
}