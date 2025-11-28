// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationNFT
 * @dev NFT-based reputation system for sellers and buyers
 */
contract ReputationNFT is ERC721, Ownable {
    
    enum ReputationLevel {
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND
    }
    
    struct UserReputation {
        uint256 score;
        ReputationLevel level;
        uint256 totalTransactions;
        uint256 lastUpdated;
    }
    
    mapping(address => UserReputation) public userReputation;
    mapping(address => uint256) public userTokenId;
    
    uint256 private tokenIdCounter = 1;
    
    event ReputationUpdated(address indexed user, uint256 newScore, ReputationLevel level);
    event BadgeMinted(address indexed user, ReputationLevel level, uint256 tokenId);
    
    constructor() ERC721("ChainMart Reputation", "CMREP") Ownable(msg.sender) {}
    
    /**
     * @dev Updates user reputation score
     */
    function updateReputation(address _user, uint256 _newScore) external onlyOwner {
        UserReputation storage rep = userReputation[_user];
        rep.score = _newScore;
        rep.totalTransactions += 1;
        rep.lastUpdated = block.timestamp;
        
        ReputationLevel oldLevel = rep.level;
        ReputationLevel newLevel = _getReputationLevel(_newScore);
        
        if (newLevel != oldLevel) {
            rep.level = newLevel;
            _mintBadge(_user, newLevel);
        }
        
        emit ReputationUpdated(_user, _newScore, newLevel);
    }
    
    /**
     * @dev Mints a reputation badge
     */
    function _mintBadge(address _user, ReputationLevel _level) internal {
        // Burn old token if exists
        if (userTokenId[_user] != 0) {
            _burn(userTokenId[_user]);
        }
        
        uint256 tokenId = tokenIdCounter++;
        userTokenId[_user] = tokenId;
        _safeMint(_user, tokenId);
        
        emit BadgeMinted(_user, _level, tokenId);
    }
    
    /**
     * @dev Determines reputation level based on score
     */
    function _getReputationLevel(uint256 _score) internal pure returns (ReputationLevel) {
        if (_score < 100) return ReputationLevel.BRONZE;
        if (_score < 250) return ReputationLevel.SILVER;
        if (_score < 500) return ReputationLevel.GOLD;
        if (_score < 1000) return ReputationLevel.PLATINUM;
        return ReputationLevel.DIAMOND;
    }
    
    /**
     * @dev Gets user reputation
     */
    function getUserReputation(address _user) external view returns (UserReputation memory) {
        return userReputation[_user];
    }
}
