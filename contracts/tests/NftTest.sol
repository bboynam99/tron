pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "./FtTest.sol";


interface NftInterface {
    function clean(address _contract, uint256 _value) external;

    function setFt(address _ft) external;

    function mint(
        uint256 _price,
        uint256 _sellPrice,
        string calldata _name,
        string calldata _description,
        string calldata _image,
        bytes calldata _data
    ) external;

    function setPrice(uint256 _id, uint256 _sellPrice) external;

    function buy(uint256 _id, bytes calldata _data) external;

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external;

    function safeBatchTransferFrom(
        address _from,
        address _to,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external;

    function setApprovalForAll(address _operator, bool _approved) external;

    function totalSupply() external view returns (uint256);

    function ownerOf(uint256 _id) external view returns (address);

    function tokensOf(address _owner) external view returns (uint256);

    function idOf(address _owner, uint256 _index) external view returns (uint256);

    function priceOf(uint256 _id) external view returns (uint256);

    function sellPriceOf(uint256 _id) external view returns (uint256);

    function nameOf(uint256 _id) external view returns (string memory);

    function descriptionOf(uint256 _id) external view returns (string memory);

    function imageOf(uint256 _id) external view returns (string memory);

    function uri(uint256 _id) external view returns (string memory);
}


contract NftTest is FtTest {
    NftInterface private nft;

    constructor() public payable {
    }

    function setNft(address payable _nft) external {
        nft = NftInterface(_nft);
    }

    function sendToNft(uint256 _wei) external {
        (bool successful, ) = address(nft).call{value: _wei, gas: 200000}("");
        require(!successful, "not throw");
    }

    function cleanNft(address _contract, uint256 _value) external {
        nft.clean(_contract, _value);
    }

    function setFt() external {
        nft.setFt(address(this));
    }

    function mint(
        uint256 _price,
        uint256 _sellPrice,
        string calldata _name,
        string calldata _description,
        string calldata _image
    ) external {
        nft.mint(_price, _sellPrice, _name, _description, _image, "");
    }

    function setPrice(uint256 _id, uint256 _sellPrice) external {
        nft.setPrice(_id, _sellPrice);
    }

    function buyNft(uint256 _id) external {
        nft.buy(_id, "");
    }

    function safeTransferFrom(address _from, address _to, uint256 _id) external {
        nft.safeTransferFrom(_from, _to, _id, 1, "");
    }

    function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids) external {
        uint256[] memory values = new uint256[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            values[i] = 1;
        }
        nft.safeBatchTransferFrom(_from, _to, _ids, values, "");
    }

    function setApprovalForAll(address _operator, bool _approved) external {
        nft.setApprovalForAll(_operator, _approved);
    }

    function nftData() external view returns (
        address[] memory _owners,
        uint256[] memory _prices,
        uint256[] memory _sellPrices,
        string[] memory _uris
    ) {
        uint256 totalSupply = nft.totalSupply();
        _owners = new address[](totalSupply);
        _prices = new uint256[](totalSupply);
        _sellPrices = new uint256[](totalSupply);
        _uris = new string[](totalSupply);
        for (uint256 i = 0; i < totalSupply; i++) {
            _owners[i] = nft.ownerOf(i);
            _prices[i] = nft.priceOf(i);
            _sellPrices[i] = nft.sellPriceOf(i);
            _uris[i] = nft.uri(i);
        }
    }

    function thisData() external view returns (
        uint256[] memory _ids,
        uint256[] memory _prices,
        uint256[] memory _sellPrices,
        string[] memory _names,
        string[] memory _descriptions,
        string[] memory _images
    ) {
        uint256 tokens = nft.tokensOf(address(this));
        _ids = new uint256[](tokens);
        _prices = new uint256[](tokens);
        _sellPrices = new uint256[](tokens);
        _names = new string[](tokens);
        _descriptions = new string[](tokens);
        _images = new string[](tokens);
        for (uint256 i = 0; i < tokens; i++) {
            uint256 id = nft.idOf(address(this), i);
            _ids[i] = id;
            _prices[i] = nft.priceOf(id);
            _sellPrices[i] = nft.sellPriceOf(id);
            _names[i] = nft.nameOf(id);
            _descriptions[i] = nft.descriptionOf(id);
            _images[i] = nft.imageOf(id);
        }
    }

    function balanceOfNft() external view returns (uint256) {
        return address(nft).balance;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure returns(bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure returns(bytes4) {
        return 0xbc197c81;
    }
}
