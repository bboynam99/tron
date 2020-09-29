Automatic unit tests.

https://remix-ide.readthedocs.io/en/latest/unittesting.html
Use files Math1_test.sol, Math2_test.sol, Math3_test.sol.


Manual tests.

Ft test only.
Deploy Ft.sol.
Deploy several instances of FtTest.sol with some eth on it.
Call for each FtTest FtTest.setFt(address(Ft)).
Do some tests.


Linked test.
Deploy both Ft.sol and Nft.sol.
Call Ft.setNft(address(Nft)) and Nft.setFt(address(Ft)).
Deploy several instances of NftTest.sol with some eth on it.
Call for each NftTest NftTest.setFt(address(Ft)), and NftTest.setNft(address(Nft)).
Do some tests.
