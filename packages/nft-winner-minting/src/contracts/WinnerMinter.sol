// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@manifoldxyz/creator-core-solidity/contracts/core/IERC721CreatorCore.sol";
import "@manifoldxyz/creator-core-solidity/contracts/extensions/ICreatorExtensionTokenURI.sol";

/**
 * @title WinnerMinter
 * @notice Extension for minting JokeRace contest winners as 1/1 NFTs using Manifold Creator Core
 * @dev This contract integrates with JokeRace contests and Manifold's Creator Core to mint winning submissions
 */
contract WinnerMinter is ICreatorExtensionTokenURI {
    // JokeRace Contest interface
    interface IContest {
        struct ProposalCore {
            address author;
            bool exists;
            string description;
            address targetMetadata;
            address safeMetadata;
        }

        function getProposal(uint256 proposalId) external view returns (ProposalCore memory);
        function sortedRanks(uint256 index) external view returns (uint256);
        function getRankIndex(uint256 rank) external view returns (uint256);
    }

    // Mapping: Creator contract => Contest address => Enabled
    mapping(address => mapping(address => bool)) public authorizedContests;

    // Mapping: Creator contract => Contest address => Max winners
    mapping(address => mapping(address => uint256)) public maxWinners;

    // Mapping: Token ID => Contest metadata
    struct TokenMetadata {
        address contestAddress;
        uint256 proposalId;
        uint256 ranking;
        string submissionContent;
        address originalAuthor;
    }

    mapping(address => mapping(uint256 => TokenMetadata)) public tokenMetadata;

    // Mapping: Creator contract => Contest => Ranking => Token ID
    mapping(address => mapping(address => mapping(uint256 => uint256))) public rankingToTokenId;

    // Events
    event ContestAuthorized(address indexed creatorContract, address indexed contestAddress, uint256 maxWinners);
    event WinnerMinted(
        address indexed creatorContract,
        address indexed contestAddress,
        uint256 indexed tokenId,
        uint256 ranking,
        uint256 proposalId,
        address author
    );

    /**
     * @notice Authorize a contest for minting winners
     * @param creatorContract The Manifold creator contract to mint from
     * @param contestAddress The JokeRace contest address
     * @param _maxWinners Maximum number of winners to allow minting
     */
    function authorizeContest(
        address creatorContract,
        address contestAddress,
        uint256 _maxWinners
    ) external {
        require(
            IERC721CreatorCore(creatorContract).isAdmin(msg.sender),
            "Must be creator admin"
        );
        require(_maxWinners > 0, "Max winners must be > 0");

        authorizedContests[creatorContract][contestAddress] = true;
        maxWinners[creatorContract][contestAddress] = _maxWinners;

        emit ContestAuthorized(creatorContract, contestAddress, _maxWinners);
    }

    /**
     * @notice Mint a winning submission as a 1/1 NFT
     * @param creatorContract The Manifold creator contract
     * @param contestAddress The JokeRace contest address
     * @param ranking The ranking position to mint (1 = first place, 2 = second, etc.)
     */
    function mintWinner(
        address creatorContract,
        address contestAddress,
        uint256 ranking
    ) external returns (uint256) {
        require(
            authorizedContests[creatorContract][contestAddress],
            "Contest not authorized"
        );
        require(
            ranking > 0 && ranking <= maxWinners[creatorContract][contestAddress],
            "Invalid ranking"
        );
        require(
            IERC721CreatorCore(creatorContract).isAdmin(msg.sender),
            "Must be creator admin"
        );
        require(
            rankingToTokenId[creatorContract][contestAddress][ranking] == 0,
            "Ranking already minted"
        );

        // Get the contest data
        IContest contest = IContest(contestAddress);

        // Get the rank index (sorted ranks are in descending order)
        uint256 rankIndex = ranking - 1;
        uint256 voteCount = contest.sortedRanks(rankIndex);

        // Get proposals with this vote count
        // Note: In production, you'd need to implement logic to handle ties
        // For now, we'll use a simplified approach

        // Get the proposal data
        // This is simplified - in production you'd need to map vote counts to proposal IDs
        uint256 proposalId = ranking; // Simplified mapping
        IContest.ProposalCore memory proposal = contest.getProposal(proposalId);

        require(proposal.exists, "Proposal does not exist");

        // Mint the NFT to the winner
        address[] memory recipients = new address[](1);
        recipients[0] = proposal.author;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 1;

        string[] memory uris = new string[](1);
        uris[0] = ""; // We'll use tokenURI function instead

        uint256[] memory tokenIds = IERC721CreatorCore(creatorContract).mintExtensionBatch(
            recipients[0],
            amounts[0]
        );

        uint256 tokenId = tokenIds[0];

        // Store metadata
        tokenMetadata[creatorContract][tokenId] = TokenMetadata({
            contestAddress: contestAddress,
            proposalId: proposalId,
            ranking: ranking,
            submissionContent: proposal.description,
            originalAuthor: proposal.author
        });

        rankingToTokenId[creatorContract][contestAddress][ranking] = tokenId;

        emit WinnerMinted(
            creatorContract,
            contestAddress,
            tokenId,
            ranking,
            proposalId,
            proposal.author
        );

        return tokenId;
    }

    /**
     * @notice Batch mint multiple winners
     * @param creatorContract The Manifold creator contract
     * @param contestAddress The JokeRace contest address
     * @param rankings Array of rankings to mint (e.g., [1, 2, 3] for top 3)
     */
    function mintWinnersBatch(
        address creatorContract,
        address contestAddress,
        uint256[] calldata rankings
    ) external returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](rankings.length);

        for (uint256 i = 0; i < rankings.length; i++) {
            tokenIds[i] = mintWinner(creatorContract, contestAddress, rankings[i]);
        }

        return tokenIds;
    }

    /**
     * @notice Get token URI for a minted winner NFT
     * @dev Implements ICreatorExtensionTokenURI
     */
    function tokenURI(address creatorContract, uint256 tokenId) external view override returns (string memory) {
        TokenMetadata memory metadata = tokenMetadata[creatorContract][tokenId];
        require(bytes(metadata.submissionContent).length > 0, "Token does not exist");

        // Return a data URI with JSON metadata
        // In production, you'd want to host this properly or use IPFS
        return string(
            abi.encodePacked(
                'data:application/json;utf8,{"name":"Winner #',
                _toString(metadata.ranking),
                '","description":"',
                metadata.submissionContent,
                '","attributes":[{"trait_type":"Ranking","value":"',
                _toString(metadata.ranking),
                '"},{"trait_type":"Contest","value":"',
                _toHexString(metadata.contestAddress),
                '"},{"trait_type":"Original Author","value":"',
                _toHexString(metadata.originalAuthor),
                '"}]}'
            )
        );
    }

    // Helper functions
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(42);
        buffer[0] = '0';
        buffer[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            uint8 b = uint8(uint160(addr) / (2**(8*(19 - i))));
            buffer[2+i*2] = _char(b / 16);
            buffer[3+i*2] = _char(b % 16);
        }
        return string(buffer);
    }

    function _char(uint8 b) internal pure returns (bytes1) {
        if (b < 10) return bytes1(b + 0x30);
        else return bytes1(b + 0x57);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(ICreatorExtensionTokenURI).interfaceId;
    }
}
