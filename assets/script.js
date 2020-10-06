"use strict";

(function () {
    var tabStart = 0;
    var tabFt = 1;
    var tabNft = 2;
    var tabCreate = 3;
    var tabMarket = 4;
    var tab = tabStart;

    var ft = null; // contract
    var nft = null; // contract
    var network = null; // not defined (null), main (true) or shasta (false)
    var account = null; // not login if null

    var ftBalance = null;
    var selectedId = null;
    var nftLoading = false;
    var marketLoading = false;

    window.onload = function () {
        document.getElementById('headerStart').onclick = function () {
            display(tabStart);
        }
        document.getElementById('headerFt').onclick = function () {
            display(tabFt);
        };
        document.getElementById('headerNft').onclick = function () {
            display(tabNft);
        };
        document.getElementById('headerCreate').onclick = function () {
            display(tabCreate);
        };
        document.getElementById('headerMarket').onclick = function () {
            display(tabMarket);
        };
        document.getElementById('ftBuy').onclick = ftBuy;
        document.getElementById('ftSell').onclick = ftSell;
        document.getElementById('ftWithdraw').onclick = ftWithdraw;
        document.getElementById('ftReinvest').onclick = ftReinvest;
        document.getElementById('nftClose').onclick = nftClose;
        document.getElementById('nftSet').onclick = nftPrice;
        document.getElementById('nftSend').onclick = nftSend;
        document.getElementById('createImage').onchange = createImage;
        document.getElementById('createMint').onclick = createMint;
        document.getElementById('marketClose').onclick = marketClose;
        document.getElementById('marketBuyButton').onclick = marketBuy;

        if (typeof window.tronWeb === 'undefined') {
            document.getElementById('startMessage').innerHTML = 'Install the <a href="https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec" target="_blank" rel="noopener">wallet</a>.';
            return;
        }
        addEventListener('message', function (event) {
            if (!event.data.message) {
                return;
            }
            console.log('message ' + event.data.message.action);
            console.log(event.data.message.data);
            if (event.data.message.action === 'tabReply') { // once loaded, send tx
                if (event.data.message.data.data.node) {
                    setNetwork(event.data.message.data.data.node.fullNode, tronWeb.defaultAddress.base58);
                }
            } else if (event.data.message.action === 'setNode') { // change node
                setNetwork(event.data.message.data.node.fullNode, account);
            } else if (event.data.message.action === 'setAccount') { // log in/out, change node or account
                setAccount(event.data.message.data.address);
            }
        });
    }

    function setNetwork(newNetwork, newAccount) {
console.log('setNetwork ' + newNetwork + ', ' + newAccount);
        account = null;
        if (newNetwork === 'https://api.trongrid.io' || newNetwork === 'https://api.tronstack.io') {
            network = true;
        } else if (newNetwork === 'https://api.shasta.trongrid.io') {
            network = false;
        } else {
            network = null;
            ft = null;
            nft = null;
            return;
        }
        document.getElementById('log').innerHTML = '';
        var ftAddress = network ? 'ft' : 'TQNG46ys15172srMdezH7FgwK8m2rusx97';
        var nftAddress = network ? 'nft' : 'TTdfFLV5WKKa83t8JsjGDuh74ejok9rCT9';
        var base = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/contract/';
        document.getElementById('ftAddress').innerHTML = ftAddress;
        document.getElementById('ftAddress').href = base + ftAddress;
        document.getElementById('nftAddress').innerHTML = nftAddress;
        document.getElementById('nftAddress').href = base + nftAddress;
if (newNetwork) {
    setAccount(newAccount);
}
        tronWeb.contract().at(ftAddress).then(function (contract) {
            ft = contract;
            return tronWeb.contract().at(nftAddress);
        }).then(function (contract) {
            nft = contract;
            loadEvents();
            setAccount(newAccount);
        });
    }

    function setAccount(newAccount) {
console.log('setAccount ' + newAccount);
        if (!newAccount) {
            account = null;
        } else if (account !== newAccount) {
            account = newAccount;
            ftBalance = null;
            selectedId = null;
            nftLoading = false;
            marketLoading = false;
            loadFt();
            loadNft();
            loadMarket();
        }
    }

    function logAccount() {
        var a = document.createElement('a');
        a.innerHTML = account;
        a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/address/' + account;
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
        document.getElementById('log').appendChild(a);
    }

    function display(newTab) {
        if (tab === newTab) {
            return;
        }
        tab = newTab;
        nftClose();
        marketClose();

        document.getElementById('headerFt').className = tab === tabFt ? 'active' : '';
        document.getElementById('headerNft').className = tab === tabNft ? 'active' : '';
        document.getElementById('headerCreate').className = tab === tabCreate ? 'active' : '';
        document.getElementById('headerMarket').className = tab === tabMarket ? 'active' : '';
        document.getElementById('start').style.display = tab === tabStart ? 'block' : 'none';
        document.getElementById('ft').style.display = tab === tabFt ? 'block' : 'none';
        document.getElementById('nft').style.display = tab === tabNft ? 'block' : 'none';
        document.getElementById('create').style.display = tab === tabCreate ? 'block' : 'none';
        document.getElementById('market').style.display = tab === tabMarket ? 'block' : 'none';
    }

    function loadEvents() {
        ft.Transfer().watch(function (error, result) {
            console.log('event ' + error);
            console.log(result);
            loadFt();
        });
        ft.Update().watch(function (error, result) {
            console.log('event ' + error);
            console.log(result);
            loadFt();
        });
        nft.TransferSingle().watch(function (error, result) {
            console.log('event ' + error);
            console.log(result);
            loadNft();
            loadMarket();
        });
    }

    function loadFt() {
        if (account === null || ft === null) {
            return;
        }
        tronWeb.trx.getUnconfirmedBalance(ft.address).then(function (result) {
            result = tronWeb.BigNumber(result).shiftedBy(-6);
            if (result.isZero()) {
                document.getElementById('ftContractTrx').title = '';
                document.getElementById('ftContractTrx').innerHTML = '0';
            } else {
                document.getElementById('ftContractTrx').title = result;
                result = result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
                document.getElementById('ftContractTrx').innerHTML = result;
            }
        });
        ft.sharesOf(account).call().then(function (result) {
            result = tronWeb.BigNumber(result).shiftedBy(-18);
            if (result.isZero()) {
                document.getElementById('ftShares').title = '';
                document.getElementById('ftShares').innerHTML = '0';
            } else {
                document.getElementById('ftShares').title = result;
                result = result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
                document.getElementById('ftShares').innerHTML = result;
            }
        });
        ft.balanceOf(account).call().then(function (result) {
            ftBalance = tronWeb.BigNumber(result).shiftedBy(-18);
            if (ftBalance.isZero()) {
                document.getElementById('ftBalance').title = '';
                document.getElementById('ftBalance').innerHTML = '0';
            } else {
                document.getElementById('ftBalance').title = ftBalance;
                result = ftBalance.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
                document.getElementById('ftBalance').innerHTML = result;
            }
        });
        ft.dividendsOf(account).call().then(function (result) {
            result = tronWeb.BigNumber(result).shiftedBy(-19);
            if (result.isZero()) {
                document.getElementById('ftDividends').title = '';
                document.getElementById('ftDividends').innerHTML = '0';
            } else {
                document.getElementById('ftDividends').title = result;
                result = result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
                document.getElementById('ftDividends').innerHTML = result;
            }
        });
    }

    function loadNft() {
        if (account === null || nft === null || nftLoading) {
            return;
        }
        nftLoading = true;
        document.getElementById('nftItems').innerHTML = '';
        var p = document.createElement('p');
        p.innerHTML = 'loading...';
        document.getElementById('nftItems').appendChild(p);

        nft.tokensOf(account).call().then(function (result) {
            document.getElementById('nftItems').innerHTML = '';
            if (result == 0) {
                var p = document.createElement('p');
                p.innerHTML = 'you have no nft';
                document.getElementById('nftItems').appendChild(p);
                nftLoading = false;
            } else {
                getId(0, result);
            }
        });
    }

    function getId(index, total) {
        nft.idOf(account, index).call().then(function (id) {
            var rootDiv = document.createElement('div');
            rootDiv.className = 'image';
            document.getElementById('nftItems').appendChild(rootDiv);
            var div = document.createElement('div');
            div.id = id;
            div.onclick = function (event) {
                nftItem(event.target.id);
            };
            rootDiv.appendChild(div);
            var p = document.createElement('p');
            rootDiv.appendChild(p);

            nft.imageOf(id).call().then(function (result) {
                div.style.backgroundImage = 'url(\'https://ipfs.io' + result + '\')';
            });
            nft.nameOf(id).call().then(function (result) {
                p.innerHTML = result;
            });

            if (++index < total) {
                getId(index, total);
            } else {
                nftLoading = false;
            }
        });
    }

    function loadMarket() {
        if (account === null || nft === null || marketLoading) {
            return;
        }
        marketLoading = true;
        document.getElementById('marketItems').innerHTML = '';
        var p = document.createElement('p');
        p.innerHTML = 'loading...';
        document.getElementById('marketItems').appendChild(p);

        nft.totalSupply().call().then(function (result) {
            document.getElementById('marketItems').innerHTML = '';
            marketId(0, result);
        });
    }

    function marketId(id, total) {
        nft.sellPriceOf(id).call().then(function (sellPrice) {
            if (sellPrice == 0) {
                if (++id < total) {
                    marketId(id, total);
                } else {
                    marketLoading = false;
                }
                return;
            }

            var rootDiv = document.createElement('div');
            rootDiv.className = 'image';
            document.getElementById('marketItems').appendChild(rootDiv);
            var div = document.createElement('div');
            div.id = 'market' + id;
            div.onclick = function (event) {
                marketItem(event.target.id.substring(6));
            };
            rootDiv.appendChild(div);
            var p = document.createElement('p');
            rootDiv.appendChild(p);

            nft.imageOf(id).call().then(function (result) {
                div.style.backgroundImage = 'url(\'https://ipfs.io' + result + '\')';
            });
            nft.nameOf(id).call().then(function (result) {
                p.innerHTML = result;
            });
            if (++id < total) {
                marketId(id, total);
            } else {
                marketLoading = false;
            }
        });
    }

    function check() {
        if (account === null) {
            alert('please login in tronlink');
        } else if (network === null || network) {
            alert('set the shasta testnet');
        } else {
            return true;
        }
        return false;
    }

    function ftBuy() {
        if (!check()) {
            return;
        }
        var trx = tronWeb.BigNumber(document.getElementById('ftBuyValue').value);
        if (trx.isNaN()) {
            document.getElementById('ftBuyValue').value = '';
            return;
        }

        ft.buy().send({
            callValue: trx.shiftedBy(6),
        }).then(function (hash) {
            var a = document.createElement('a');
            a.innerHTML = 'buy ' + trx.toFixed() + ' trx';
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }

    function ftSell() {
        if (!check()) {
            return;
        }
        var tokens = tronWeb.BigNumber(document.getElementById('ftSellValue').value);
        if (tokens.isNaN()) {
            document.getElementById('ftSellValue').placeholder = '';
            return;
        }

        ft.sell(
            tokens.shiftedBy(18).toFixed(0)
        ).send().then(function (hash) {
            var a = document.createElement('a');
            a.innerHTML = 'sell ' + tokens.toFixed() + ' f';
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }

    function ftReinvest() {
        if (!check()) {
            return;
        }
        ft.reinvest().send().then(function (hash) {
            var a = document.createElement('a');
            a.innerHTML = 'reinvest';
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }

    function ftWithdraw() {
        if (!check()) {
            return;
        }
        ft.withdraw().send().then(function (hash) {
            var a = document.createElement('a');
            a.innerHTML = 'withdraw';
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }

    function nftItem(id) {
        if (!check()) {
            return;
        }
        document.getElementById('nftItems').style.display = 'none';
        document.getElementById('nftEdit').style.display = 'block';
        selectedId = id;
        nft.imageOf(id).call().then(function (ipfs) {
            ipfs = 'https://ipfs.io' + ipfs;
            var div = document.getElementById('nftItemImage');
            div.style.backgroundImage = 'url(\'' + ipfs + '\')';
            div.onclick = function () {
                window.open(ipfs);
            };
        });
        nft.nameOf(id).call().then(function (result) {
            document.getElementById('nftItemName').innerHTML = result;
        });
        nft.descriptionOf(id).call().then(function (result) {
            document.getElementById('nftItemDescription').innerHTML = result;
        });
        nft.priceOf(id).call().then(function (result) {
            result = tronWeb.BigNumber(result).shiftedBy(-18);
            document.getElementById('nftItemPrice').title = result;
            result = result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
            document.getElementById('nftItemPrice').innerHTML = result;
        });
        nft.sellPriceOf(id).call().then(function (result) {
            if (result == 0) {
                document.getElementById('nftItemSellPrice').title = '';
                document.getElementById('nftItemSellPrice').innerHTML = 'not on sell';
            } else {
                result = tronWeb.BigNumber(result).shiftedBy(-18);
                document.getElementById('nftItemSellPrice').title = result;
                result = 'sell price ' + result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN) + ' f';
                document.getElementById('nftItemSellPrice').innerHTML = result;
            }
        });
    }

    function nftClose() {
        document.getElementById('nftItems').style.display = 'block';
        document.getElementById('nftEdit').style.display = 'none';
    }

    function nftPrice() {
        if (!check()) {
            return;
        }
        var price = tronWeb.BigNumber(document.getElementById('nftPrice').value);
        if (price.isNaN()) {
            document.getElementById('nftPrice').value = '';
        }

        nft.setPrice(
            selectedId,
            price.shiftedBy(18).toFixed(0)
        ).send().then(function (hash) {
            nftClose();
            var a = document.createElement('a');
            a.innerHTML = 'change price id ' + selectedId;
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }

    function nftSend() {
        if (!check()) {
            return;
        }
        var address = document.getElementById('nftSendAddress').value;
        if (!tronWeb.isAddress(address)) {
            document.getElementById('nftSendAddress').value = '';
            return;
        }

        nft.safeTransferFrom(
            account,
            address,
            selectedId,
            1,
            "0x0"
        ).send().then(function (hash) {
            nftClose();
            var a = document.createElement('a');
            a.innerHTML = 'send id ' + selectedId;
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }

    function createImage() {
        var input = document.getElementById('createImage');
        if (input.files.length !== 0) {
            var url = 'url(\'' + URL.createObjectURL(input.files[0]) + '\')';
            document.getElementById('createPreview').style.backgroundImage = url;
        }
    }

    function createMint() {
        if (!check()) {
            return;
        }
        var img = document.getElementById('createImage');
        if (img.files.length === 0) {
            return;
        }
        var name = document.getElementById('createName').value;
        var description = document.getElementById('createDescription').value;
        var price = tronWeb.BigNumber(document.getElementById('createPrice').value);
        if (price.isNaN()) {
            document.getElementById('createPrice').value = '';
            return;
        }
        var sellPrice = tronWeb.BigNumber(document.getElementById('createSellPrice').value);
        if (sellPrice.isNaN()) {
            document.getElementById('createSellPrice').value = '';
            return;
        }
        if (!sellPrice.isZero() && !sellPrice.gt(price)) {
            document.getElementById('createSellPrice').value = '';
            return;
        }
        var a = document.createElement('a');
        a.innerHTML = 'uploading...';
        document.getElementById('log').appendChild(a);
        document.getElementById('createMint').onclick = '';

        upload(img.files[0], function (error, result) {
            if (error) {
                a.innerHTML = error;
                document.getElementById('createMint').onclick = createMint;
                return;
            }
            var image = '/ipfs/' + result;
            a.innerHTML = 'uploaded ' + image;
            a.href = 'https://ipfs.io' + image;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');

            nft.mint(
                price.shiftedBy(18).toFixed(0),
                sellPrice.shiftedBy(18).toFixed(0),
                name,
                description,
                image,
                '0x0'
            ).send().then(function (hash) {
                var a = document.createElement('a');
                a.innerHTML = 'create ' + name;
                a.id = hash;
                a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener');
                document.getElementById('log').appendChild(a);
            });
            document.getElementById('createMint').onclick = createMint;
        });
    }

    function upload(file, callback) {
        var data = new FormData();
        data.append('file', file);
        var request = new XMLHttpRequest();
        request.open('POST', 'https://api.pinata.cloud/pinning/pinFileToIPFS', true);
        request.setRequestHeader('pinata_api_key', 'e46ee10e03199ea247ee');
        request.setRequestHeader('pinata_secret_api_key', '148f9cd961b351fdbb7542e81643bef208198db261a00641a04faf794a6bb154');
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status != 200) {
                    console.error(request);
                    callback(request.status);
                } else {
                    callback(null, JSON.parse(request.responseText).IpfsHash);
                }
            }
        };
        request.send(data);
    }

    function marketItem(id) {
        if (!check()) {
            return;
        }
        document.getElementById('marketItems').style.display = 'none';
        document.getElementById('marketBuy').style.display = 'block';
        selectedId = id;
        nft.imageOf(id).call().then(function (result) {
            result = 'https://ipfs.io' + result;
            var div = document.getElementById('marketItemImage');
            div.style.backgroundImage = 'url(\'' + result + '\')';
            div.onclick = function () {
                window.open(result);
            };
        });
        nft.ownerOf(id).call().then(function (result) {
            document.getElementById('marketItemOwner').innerHTML = result;
            result = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/address/' + result;
            document.getElementById('marketItemOwner').href = result;
        });
        nft.nameOf(id).call().then(function (result) {
            document.getElementById('marketItemName').innerHTML = result;
        });
        nft.descriptionOf(id).call().then(function (result) {
            document.getElementById('marketItemDescription').innerHTML = result;
        });
        nft.priceOf(id).call().then(function (result) {
            result = tronWeb.BigNumber(result).shiftedBy(-18);
            document.getElementById('marketItemPrice').title = result;
            result = result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
            document.getElementById('marketItemPrice').innerHTML = result;
        });
        nft.sellPriceOf(id).call().then(function (result) {
            result = tronWeb.BigNumber(result).shiftedBy(-18);
            document.getElementById('marketItemSellPrice').title = result;
            result = result.toFixed(3, tronWeb.BigNumber.ROUND_DOWN);
            document.getElementById('marketItemSellPrice').innerHTML = result;
        });
    }

    function marketClose() {
        document.getElementById('marketItems').style.display = 'block';
        document.getElementById('marketBuy').style.display = 'none';
    }

    function marketBuy() {
        if (!check()) {
            return;
        }
        nft.buy(
            selectedId,
            '0x0'
        ).send().then(function (hash) {
            marketClose();
            var a = document.createElement('a');
            a.innerHTML = 'buy id ' + selectedId;
            a.id = hash;
            a.href = (network ? 'https://' : 'https://shasta.') + 'tronscan.org/#/transaction/' + hash;
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener');
            document.getElementById('log').appendChild(a);
        });
    }
})();