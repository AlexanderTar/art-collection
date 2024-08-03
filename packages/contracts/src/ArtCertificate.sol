// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ArtCertificate is
    ERC721,
    ERC721Burnable,
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable
{
    uint256 private tokenIdCounter;

    /**
     * @dev Emitted when a new certificate is minted.
     * @param tokenId The ID of the newly minted token.
     * @param owner The address of the token owner.
     * @param tokenUri The URI containing the token's metadata.
     */
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenUri
    );

    constructor() ERC721("ArtCertificate", "ARTCERT") Ownable(msg.sender) {}

    /**
     * @dev Mints a new token with the given URI and assigns it to the caller.
     * @param _tokenUri The URI for the token metadata.
     */
    function mint(string memory _tokenUri) public {
        uint256 tokenId = tokenIdCounter;

        // Mint the token to the caller and set the token URI
        _safeMint(_msgSender(), tokenId);
        _setTokenURI(tokenId, _tokenUri);

        // Increment the token ID counter
        tokenIdCounter += 1;

        // Emit the CertificateMinted event
        emit CertificateMinted(tokenId, _msgSender(), _tokenUri);
    }

    /**
     * @dev Returns an array of token IDs owned by `_owner`.
     * @param _owner Address to query the tokens of
     * @return tokenIds Memory array of token IDs owned by `_owner`
     */
    function tokensOf(
        address _owner
    ) public view returns (uint256[] memory tokenIds) {
        uint256 ownerTokenCount = balanceOf(_owner);
        tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i = 0; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    /**
     * @dev Returns a paginated array of all token IDs.
     * @param _startIdx The starting index for the page (inclusive)
     * @param _endIdx The ending index for the page (exclusive)
     * @param _descending If true, returns tokens in descending order
     * @return tokenIds Memory array of token IDs for the requested range
     */
    function tokens(
        uint256 _startIdx,
        uint256 _endIdx,
        bool _descending
    ) public view returns (uint256[] memory tokenIds) {
        uint256 totalTokens = totalSupply();

        // Cap _endIdx at total supply
        _endIdx = _endIdx > totalTokens ? totalTokens : _endIdx;

        // Ensure _startIdx is not greater than _endIdx
        if (_startIdx >= _endIdx) {
            return new uint256[](0);
        }

        // Calculate the number of tokens in this range
        uint256 rangeSize = _endIdx - _startIdx;

        tokenIds = new uint256[](rangeSize);
        for (uint256 i = 0; i < rangeSize; i++) {
            if (_descending) {
                tokenIds[i] = tokenByIndex(totalTokens - 1 - (_startIdx + i));
            } else {
                tokenIds[i] = tokenByIndex(_startIdx + i);
            }
        }
    }

    /**
     * @dev Returns a paginated array of all token IDs in ascending order.
     * @param _startIdx The starting index for the page (inclusive)
     * @param _endIdx The ending index for the page (exclusive)
     * @return tokenIds Memory array of token IDs for the requested range
     */
    function tokens(
        uint256 _startIdx,
        uint256 _endIdx
    ) public view returns (uint256[] memory) {
        return tokens(_startIdx, _endIdx, false);
    }

    ///////////////////////////////////////////////////////////////////////////
    //                      FUNCTION OVERRIDES                               //
    ///////////////////////////////////////////////////////////////////////////

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `_tokenId` token.
     * @param _tokenId uint256 ID of the token to query
     * @return string memory The token URI
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(_tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     * @param _interfaceId The interface identifier, as specified in ERC-165
     * @return bool True if the contract supports the interface, false otherwise
     */
    function supportsInterface(
        bytes4 _interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(_interfaceId);
    }

    /**
     * @dev Increases the balance of an account by a given value.
     * @param _account The address of the account whose balance should be increased
     * @param _value The amount by which to increase the balance
     */
    function _increaseBalance(
        address _account,
        uint128 _value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(_account, _value);
    }

    /**
     * @dev Updates the ownership of a token.
     * @param _to The address to transfer the token to
     * @param _tokenId The ID of the token being transferred
     * @param _auth The address authorized to make the transfer
     * @return address The address of the previous owner
     */
    function _update(
        address _to,
        uint256 _tokenId,
        address _auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(_to, _tokenId, _auth);
    }
}
