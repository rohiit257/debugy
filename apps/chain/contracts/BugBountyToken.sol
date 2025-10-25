// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BugBountyToken is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from token ID to bounty ID
    mapping(uint256 => uint256) public tokenToBounty;
    
    // Mapping from token ID to submission ID
    mapping(uint256 => uint256) public tokenToSubmission;
    
    // Events
    event PerfectSubmissionTokenMinted(
        uint256 indexed tokenId,
        uint256 indexed bountyId,
        uint256 indexed submissionId,
        address hunter,
        string tokenURI
    );

    constructor(address initialOwner) ERC721("BugBountyPerfectSubmission", "BBPS") Ownable(initialOwner) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a token for a perfect submission
     * @param to Address of the hunter who made the perfect submission
     * @param bountyId ID of the bounty
     * @param submissionId ID of the submission
     * @param uri Metadata URI for the token
     */
    function mintPerfectSubmissionToken(
        address to,
        uint256 bountyId,
        uint256 submissionId,
        string memory uri
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenToBounty[tokenId] = bountyId;
        tokenToSubmission[tokenId] = submissionId;
        
        emit PerfectSubmissionTokenMinted(tokenId, bountyId, submissionId, to, uri);
        
        return tokenId;
    }

    /**
     * @dev Get bounty ID associated with a token
     */
    function getBountyId(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToBounty[tokenId];
    }

    /**
     * @dev Get submission ID associated with a token
     */
    function getSubmissionId(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenToSubmission[tokenId];
    }

    /**
     * @dev Get all tokens owned by an address
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                tokens[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokens;
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
