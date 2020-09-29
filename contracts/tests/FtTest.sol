pragma solidity ^0.6.2;


interface FtInterface {
    function clean(address _contract, uint256 _value) external;

    function setNft(address _nft) external;

    function setBiz(address _biz) external;

    function setDev(address _dev) external;

    function disableFee() external;

    function onMint(address _minter, uint256 _price) external returns (bool);

    function onBuy(address _seller, address _buyer, uint256 _previousPrice, uint256 _price) external returns (bool);

    function onTransfer(address _from, address _to, uint256 _price) external returns (bool);

    function sell(uint256 _tokens) external;

    function withdraw() external;

    function reinvest() external;

    function buy() external payable;

    function transfer(address _to, uint256 _value) external returns (bool);

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);

    function approve(address _spender, uint256 _value) external returns (bool);

    function balanceOf(address _owner) external view returns (uint256);

    function sharesOf(address _owner) external view returns (uint256);

    function payoutsOf(address _owner) external view returns (int256);

    function dividendsOf(address _owner) external view returns (uint256);
}


contract FtTest {
    FtInterface private ft;

    constructor() public payable {
    }

    receive() external payable {
    }

    function setFt(address payable _ft) external {
        ft = FtInterface(_ft);
    }

    function send(uint256 _wei) external {
        (bool successful, ) = address(ft).call{value: _wei, gas: 200000}("");
        require(successful, "throw");
    }

    function clean(address _contract, uint256 _value) external {
        ft.clean(_contract, _value);
    }

    function setNft() external {
        ft.setNft(address(this));
    }

    function setBiz() external {
        ft.setBiz(address(this));
    }

    function setDev() external {
        ft.setDev(address(this));
    }

    function disableFee() external {
        ft.disableFee();
    }

    function onMint(address _minter, uint256 _price) external {
        require(ft.onMint(_minter, _price), "false");
    }

    function onBuy(address _seller, address _buyer, uint256 _previousPrice, uint256 _price) external {
        require(ft.onBuy(_seller, _buyer, _previousPrice, _price), "false");
    }

    function onTransfer(address _from, address _to, uint256 _price) external {
        require(ft.onTransfer(_from, _to, _price), "false");
    }

    function sell(uint256 _tokens) external {
        ft.sell(_tokens);
    }

    function withdraw() external {
        ft.withdraw();
    }

    function reinvest() external {
        ft.reinvest();
    }

    function buy(uint256 _wei) external {
        ft.buy{value: _wei}();
    }

    function transfer(address _to, uint256 _value) external {
        require(ft.transfer(_to, _value), "false");
    }

    function transferFrom(address _from, address _to, uint256 _value) external {
        require(ft.transferFrom(_from, _to, _value), "false");
    }

    function approve(address _spender, uint256 _value) external {
        require(ft.approve(_spender, _value), "false");
    }

    function data() external view returns (
        uint256 _balance,
        uint256 _shares,
        int256 _payouts,
        uint256 _dividends,
        uint256 _wei
    ) {
        return (
            ft.balanceOf(address(this)),
            ft.sharesOf(address(this)),
            ft.payoutsOf(address(this)),
            ft.dividendsOf(address(this)),
            address(this).balance
        );
    }

    function balanceOf() external view returns (uint256) {
        return address(ft).balance;
    }
}
