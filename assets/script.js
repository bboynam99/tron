"use strict";

(function () {
    var ft; // contract
    var nft; // contract
    var prefix;

    var networkMain = 1;
    var networkRopsten = 3;
    var network = null;
    var account = null; // not login if null
    var tabStart = 0;
    var tabFt = 1;
    var tabNft = 2;
    var tabCreate = 3;
    var tabMarket = 4;
    var tab = tabStart;

    var ethBalance;
    var ftBalance;
    var selectedId;
    var nftLoading;
    var marketLoading;

    window.onload = function () {
        document.getElementById("headerStart").onclick = function () {
            display(tabStart);
        }
        document.getElementById("headerConnect").onclick = connect;
        document.getElementById("headerFt").onclick = function () {
            display(tabFt);
        };
        document.getElementById("headerNft").onclick = function () {
            display(tabNft);
        };
        document.getElementById("headerCreate").onclick = function () {
            display(tabCreate);
        };
        document.getElementById("headerMarket").onclick = function () {
            display(tabMarket);
        };
        document.getElementById("startConnect").onclick = connect;
        document.getElementById("ftBuy").onclick = ftBuy;
        document.getElementById("ftSell").onclick = ftSell;
        document.getElementById("ftWithdraw").onclick = ftWithdraw;
        document.getElementById("ftReinvest").onclick = ftReinvest;
        document.getElementById("nftClose").onclick = nftClose;
        document.getElementById("nftSet").onclick = nftPrice;
        document.getElementById("nftSend").onclick = nftSend;
        document.getElementById("createImage").onchange = createImage;
        document.getElementById("createMint").onclick = createMint;
        document.getElementById("marketClose").onclick = marketClose;
        document.getElementById("marketBuyButton").onclick = marketBuy;

        if (typeof window.tronWeb === 'undefined') {
            document.getElementById("startMessage").innerHTML = "install the wallet";
        } else {
            var elements = document.getElementsByClassName("connect");
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = "block";
            }

            /*ethereum.on('accountsChanged', function (accounts) {
                setAccount(accounts.length > 0 ? accounts[0] : null);
            });
            ethereum.on('networkChanged', function (newNetwork) {
                setNetwork(newNetwork);
            });
            ethereum.autoRefreshOnNetworkChange = false;*/
        }
    };

    function connect() {
        setAccount(tronWeb.defaultAddress.base58);
        network = null;
        setNetwork(networkRopsten);
        /*ethereum.enable().then(
            function (accounts) {
                var elements = document.getElementsByClassName("connect");
                for (var i = 0; i < elements.length; i++) {
                    elements[i].style.display = "none";
                }

                setAccount(accounts.length > 0 ? accounts[0] : null);
                return web3.eth.net.getId();
            }, function () {
                document.getElementById("startMessage").innerHTML = "you have denied account authorization";
            }
        ).then(function (newNetwork) {
            setNetwork(newNetwork);
        }).catch(function (error) {
            document.getElementById("startMessage").innerHTML = error;
        });*/
    }

    function setAccount(newAccount) {
        if (typeof newAccount === 'undefined' || newAccount === null) {
            account = null;
            return;
        }
        if (newAccount === account) {
            return;
        }
        account = newAccount;
        if (network === networkMain || network === networkRopsten) {
            document.getElementById("startMessage").innerHTML = "";
            logAccount();
            load();
        }
    }

    function setNetwork(newNetwork) {
        if (typeof newNetwork === 'undefined' || newNetwork === null) {
            network = null;
            return;
        }
        newNetwork = Number(newNetwork);
        if (newNetwork === network) {
            return;
        }
        network = newNetwork;
        if (network !== networkMain && network !== networkRopsten) {
            document.getElementById("startMessage").innerHTML = "switch to ropsten or main network";
            return;
        }
        document.getElementById("startMessage").innerHTML = "";
        document.getElementById("log").innerHTML = "";
        var ftAddress, nftAddress;
        if (network === networkMain) {
            prefix = "https://etherscan.io/";
            ftAddress = "0x971E2db61Add4a2c460bA4a5B754a501c1a4c23F";
            nftAddress = "0xc569b368D2F6Ce6aE819CaDDEDFd95dCe3390d51";
        } else {
            prefix = "https://shasta.tronscan.org/#";
            ftAddress = "TLc4FQ25w2FXKWWx9sDkuf3XyQ2UvrJzHZ";
            nftAddress = "TGkr8pbvJi12GQgkgZBPE74QyDG1vUxiKs";
        }
        document.getElementById("ftAddress").innerHTML = ftAddress;
        document.getElementById("ftAddress").href = prefix + "/contract/" + ftAddress;
        document.getElementById("nftAddress").innerHTML = nftAddress;
        document.getElementById("nftAddress").href = prefix + "/contract/" + nftAddress;
        tronWeb.contract().at(ftAddress).then(function (contract) {
            ft = contract;
            console.log(ft);
            return tronWeb.contract().at(nftAddress);
        }).then(function (contract) {
            nft = contract;
            console.log(nft);
        }).then(function () {
            loadEvents();
            if (account !== null) {
                logAccount();
                load();
            }
        });
    }

    function load() {        
        ethBalance = 0;
        ftBalance = 0;
        selectedId = null;
        nftLoading = false;
        marketLoading = false;
        loadEth();
        loadFt();
        loadNft();
        loadMarket();
    }

    function logAccount() {
        var a = document.createElement("a");
        a.innerHTML = account;
        a.href = prefix + "/address/" + account;
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
        document.getElementById("log").appendChild(a);
    }

    function display(newTab) {
        if (tab === newTab) {
            return;
        }
        tab = newTab;
        nftClose();
        marketClose();

        document.getElementById("headerFt").className = tab === tabFt ? "active" : "";
        document.getElementById("headerNft").className = tab === tabNft ? "active" : "";
        document.getElementById("headerCreate").className = tab === tabCreate ? "active" : "";
        document.getElementById("headerMarket").className = tab === tabMarket ? "active" : "";
        document.getElementById("start").style.display = tab === tabStart ? "block" : "none";
        document.getElementById("ft").style.display = tab === tabFt ? "block" : "none";
        document.getElementById("nft").style.display = tab === tabNft ? "block" : "none";
        document.getElementById("create").style.display = tab === tabCreate ? "block" : "none";
        document.getElementById("market").style.display = tab === tabMarket ? "block" : "none";
    }

    function loadEvents() {
        ft.Transfer().watch(function (error, result) {
            console.log('event' + error);
            console.log(result);
            loadFt();
        });
        nft.TransferSingle().watch(function (eroor, result) {
            console.log('event' + error);
            console.log(result);
            loadNft(); 
            loadMarket();
        });
    }

    function loadEth() {
        tronWeb.trx.getBalance(account).then(function (result) {
            ethBalance = new BigNumber(result).shiftedBy(-6);
        });
    }

    function loadFt() {
        tronWeb.trx.getBalance(ft.address).then(function (result) {
            result = new BigNumber(result).shiftedBy(-6).toFixed(3);
            document.getElementById("ftContractEth").innerHTML = result;
        });
        ft.sharesOf(account).call().then(function (result) {
            result = new BigNumber(result).shiftedBy(-6).toFixed(3);
            document.getElementById("ftShares").innerHTML = result;
        });
        ft.balanceOf(account).call().then(function (result) {
            ftBalance = new BigNumber(result).shiftedBy(-6);
            document.getElementById("ftBalance").innerHTML = ftBalance.toFixed(3);
        });
        ft.dividendsOf(account).call().then(function (result) {
            result = new BigNumber(result).shiftedBy(-7).toFixed(3);
            document.getElementById("ftDividends").innerHTML = result;
        });
    }

    function loadNft() {
        if (nftLoading) {
            return;
        }
        nftLoading = true;
        document.getElementById("nftItems").innerHTML = "";
        var p = document.createElement("p");
        p.innerHTML = "loading...";
        document.getElementById("nftItems").appendChild(p);

        nft.tokensOf(account).call().then(function (result) {
            document.getElementById("nftItems").innerHTML = "";
            if (result == 0) {
                var p = document.createElement("p");
                p.innerHTML = "you have no nft";
                document.getElementById("nftItems").appendChild(p);
                nftLoading = false;
            } else {
                getId(0, result);
            }
        });
    }

    function getId(index, total) {
        nft.idOf(account, index).call().then(function (result) {
            addId(result);
            if (++index < total) {
                getId(index, total);
            } else {
                nftLoading = false;
            }
        });
    }

    function addId(id) {
        var rootDiv = document.createElement("div");
        rootDiv.className = "image";
        document.getElementById("nftItems").appendChild(rootDiv);
        var div = document.createElement("div");
        div.id = id;
        div.onclick = function (event) {
            nftItem(event.target.id);
        };
        rootDiv.appendChild(div);
        var p = document.createElement("p");
        rootDiv.appendChild(p);

        nft.imageOf(id).call().then(function (ipfs) {
            div.style.backgroundImage = "url('https://ipfs.io" + ipfs + "')";
            nft.nameOf(id).call().then(function (name) {
                p.innerHTML = name;
            });
        })
    }

    function nftItem(id) {
        document.getElementById("nftItems").style.display = "none";
        document.getElementById("nftEdit").style.display = "block";
        selectedId = id;
        nft.imageOf(id).call().then(function (ipfs) {
            ipfs = "https://ipfs.io" + ipfs;
            var div = document.getElementById("nftItemImage");
            div.style.backgroundImage = "url('" + ipfs + "')";
            div.onclick = function () {
                window.open(ipfs);
            };
            nft.nameOf(id).call().then(function (name) {
                document.getElementById("nftItemName").innerHTML = name;
                nft.descriptionOf(id).call().then(function (description) {
                    document.getElementById("nftItemDescription").innerHTML = description;
                    nft.priceOf(id).call().then(function (price) {
                        price = new BigNumber(price).shiftedBy(-6).toFixed(3);
                        document.getElementById("nftItemPrice").innerHTML = price;
                        nft.sellPriceOf(id).call().then(function (sellPrice) {
                            if (sellPrice == 0) {
                                sellPrice = "not on sell";
                            } else {
                                sellPrice = new BigNumber(sellPrice).shiftedBy(-6).toFixed(3);
                                sellPrice = "sell price " + sellPrice + " f";
                            }
                            document.getElementById("nftItemSellPrice").innerHTML = sellPrice;
                        });
                    });
                });
            });
        });
    }

    function loadMarket() {
        if (marketLoading) {
            return;
        }
        marketLoading = true;
        document.getElementById("marketItems").innerHTML = "";
        var p = document.createElement("p");
        p.innerHTML = "loading...";
        document.getElementById("marketItems").appendChild(p);

        nft.totalSupply().call().then(function (result) {
            document.getElementById("marketItems").innerHTML = "";
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

            var rootDiv = document.createElement("div");
            rootDiv.className = "image";
            document.getElementById("marketItems").appendChild(rootDiv);
            var div = document.createElement("div");
            div.id = "market" + id;
            div.onclick = function (event) {
                marketItem(event.target.id.substring(6));
            };
            rootDiv.appendChild(div);
            var p = document.createElement("p");
            rootDiv.appendChild(p);

            nft.imageOf(id).call().then(function (ipfs) {
                div.style.backgroundImage = "url('https://ipfs.io" + ipfs + "')";
                nft.nameOf(id).call().then(function (name) {
                    p.innerHTML = name;
                    if (++id < total) {
                        marketId(id, total);
                    } else {
                        marketLoading = false;
                    }
                });
            });
        });
    }

    function marketItem(id) {
        document.getElementById("marketItems").style.display = "none";
        document.getElementById("marketBuy").style.display = "block";
        selectedId = id;
        nft.imageOf(id).call().then(function (ipfs) {
            ipfs = "https://ipfs.io" + ipfs;
            var div = document.getElementById("marketItemImage");
            div.style.backgroundImage = "url('" + ipfs + "')";
            div.onclick = function () {
                window.open(ipfs);
            };
            nft.ownerOf(id).call().then(function (owner) {
                document.getElementById("marketItemOwner").innerHTML = owner;
                nft.nameOf(id).call().then(function (name) {
                    document.getElementById("marketItemName").innerHTML = name;
                    nft.descriptionOf(id).call().then(function (description) {
                        document.getElementById("marketItemDescription").innerHTML = description;
                        nft.priceOf(id).call().then(function (price) {
                            price = new BigNumber(price).shiftedBy(-6).toFixed(3);
                            document.getElementById("marketItemPrice").innerHTML = price;
                            nft.sellPriceOf(id).call().then(function (sellPrice) {
                                sellPrice = new BigNumber(sellPrice).shiftedBy(-6).toFixed(3);
                                document.getElementById("marketItemSellPrice").innerHTML = sellPrice;
                            });
                        });
                    });
                });
            });
        });
    }

    function ftBuy() {
        var eth = new BigNumber(document.getElementById("ftBuyValue").value);
        document.getElementById("ftBuyValue").value = "";
        if (eth.isNaN()) {
            document.getElementById("ftBuyValue").placeholder = "enter a number";
            return;
        }
        if (eth.gt(ethBalance)) {
            document.getElementById("ftBuyValue").placeholder = "enter value less then " + ethBalance;
            return;
        }
        document.getElementById("ftBuyValue").placeholder = "";

        ft.buy().send({
            feeLimit: 100000000,
            callValue: eth.shiftedBy(6),
            shouldPollResponse: false
        }).then(function (hash) {
            console.log(hash);
            var a = document.createElement("a");
            a.innerHTML = "buy, " + eth.toFixed() + " trx";
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }

    function ftSell() {
        var tokens = new BigNumber(document.getElementById("ftSellValue").value);
        document.getElementById("ftSellValue").value = "";
        if (tokens.isNaN()) {
            document.getElementById("ftSellValue").placeholder = "enter a number";
            return;
        }
        if (tokens.gt(ftBalance)) {
            document.getElementById("ftSellValue").placeholder = "enter value less then " + ftBalance;
            return;
        }
        document.getElementById("ftSellValue").placeholder = "";

        ft.sell(
            tokens.shiftedBy(6).toFixed(0)
        ).send({
            feeLimit: 100000000,
            shouldPollResponse: true
        }).then(function (hash) {
            console.log(hash);
            var a = document.createElement("a");
            a.innerHTML = "sell, " + tokens.toFixed() + " FT";
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }

    function ftWithdraw() {
        ft.withdraw().send({
            feeLimit: 100000000,
            shouldPollResponse: true
        }).then(function (hash) {
            var a = document.createElement("a");
            a.innerHTML = "withdraw";
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }

    function ftReinvest() {
        ft.reinvest().send({
            feeLimit: 100000000,
            shouldPollResponse: true
        }).then(function (hash) {
            var a = document.createElement("a");
            a.innerHTML = "reinvest";
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }

    function nftClose() {
        document.getElementById("nftItems").style.display = "block";
        document.getElementById("nftEdit").style.display = "none";
    }

    function nftPrice() {
        var price = new BigNumber(document.getElementById("nftPrice").value);
        document.getElementById("nftPrice").value = "";
        if (price.isNaN()) {
            document.getElementById("nftPrice").placeholder = "enter a number";
            return;
        }
        document.getElementById("nftPrice").placeholder = "";

        nft.setPrice(
            selectedId,
            price.shiftedBy(6).toFixed(0)
        ).send({
            feeLimit: 100000000,
            shouldPollResponse: true
        }).then(function (hash) {
            nftClose();
            var a = document.createElement("a");
            a.innerHTML = "change price, id " + selectedId + ", " + price + " FT";
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }

    function nftSend() {
        var address = document.getElementById("nftSendAddress").value;
        document.getElementById("nftSendAddress").value = "";
        if (!tronWeb.isAddress(address)) {
            document.getElementById("nftSendAddress").placeholder = "enter address";
            return;
        }
        document.getElementById("nftSendAddress").placeholder = "";

        nft.safeTransferFrom(
            account,
            address,
            selectedId,
            1,
            "0x0"
        ).send({
            feeLimit: 100000000,
            shouldPollResponse: true
        }).then(function (hash) {
            nftClose();
            var a = document.createElement("a");
            a.innerHTML = "send, id " + selectedId + ", to " + address;
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }

    function createImage () {
        var input = document.getElementById("createImage");
        if (input.files.length !== 0) {
            var url = "url('" + URL.createObjectURL(input.files[0]) + "')";
            document.getElementById("createPreview").style.backgroundImage = url;
        }
    }

    function createMint() {
        var img = document.getElementById("createImage");
        if (img.files.length === 0) {
            return;
        }
        var name = document.getElementById("createName").value;
        var description = document.getElementById("createDescription").value;
        var price = new BigNumber(document.getElementById("createPrice").value);
        if (price.isNaN()) {
            document.getElementById("createPrice").placeholder = "enter a number";
            document.getElementById("createPrice").value = "";
            return;
        }
        if (!price.gt(1000) || price.gt(ftBalance)) {
            document.getElementById("createPrice").placeholder = "enter value less then " + ftBalance + "and greater than 1000";
            document.getElementById("createPrice").value = "";
            return;
        }
        var sellPrice = new BigNumber(document.getElementById("createSellPrice").value);
        if (sellPrice.isNaN()) {
            document.getElementById("createSellPrice").placeholder = "enter a number";
            document.getElementById("createSellPrice").value = "";
            return;
        }
        if (!sellPrice.isZero() && !sellPrice.gt(price)) {
            document.getElementById("createSellPrice").placeholder = "enter 0 or > price";
            document.getElementById("createSellPrice").value = "";
            return;
        }
        var a = document.createElement("a");
        a.innerHTML = "uploading...";
        document.getElementById("log").appendChild(a);

        upload(img.files[0], function (error, result) {
            if (error) {
                a.innerHTML = error;
                return;
            }
            var image = "/ipfs/" + result;
            a.innerHTML = "uploaded " + image;
            a.href = "https://ipfs.io" + image;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");    

            nft.mint(
                price.shiftedBy(6).toFixed(0),
                sellPrice.shiftedBy(6).toFixed(0),
                name,
                description,
                image,
                "0x0"
            ).send({
                feeLimit: 100000000,
                shouldPollResponse: true
            }).then(function (hash) {
                var a = document.createElement("a");
                a.innerHTML = "create " + name;
                a.id = hash;
                a.href = prefix + "/transaction/" + hash;
                a.setAttribute("target", "_blank");
                a.setAttribute("rel", "noopener");
                document.getElementById("log").appendChild(a);
            });
        });
    }

    function upload(file, callback) {
        var data = new FormData();
        data.append("file", file);
        var request = new XMLHttpRequest();
        request.open("POST", "https://api.pinata.cloud/pinning/pinFileToIPFS", true);
        request.setRequestHeader("pinata_api_key", "e46ee10e03199ea247ee");
        request.setRequestHeader("pinata_secret_api_key", "148f9cd961b351fdbb7542e81643bef208198db261a00641a04faf794a6bb154");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status != 200) {
                    console.log(request);
                    callback(request.status);
                } else {
                    callback(null, JSON.parse(request.responseText).IpfsHash);
                }
            }
        };
        request.send(data);
    }

    function marketClose() {
        document.getElementById("marketItems").style.display = "block";
        document.getElementById("marketBuy").style.display = "none";
    }

    function marketBuy() {
        nft.buy(
            selectedId,
            "0x0"
        ).send().then(function (hash) {
            marketClose();
            var a = document.createElement("a");
            a.innerHTML = "buy, id " + selectedId;
            a.id = hash;
            a.href = prefix + "/transaction/" + hash;
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener");
            document.getElementById("log").appendChild(a);
        });
    }
})();