App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        return await App.initWeb3();
    },

    initWeb3: async () => {
        if (typeof web3 !== "undefined") {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            window.alert("Please connect to Metamask.");
        }
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                await ethereum.enable();
                web3.eth.sendTransaction({});
            } catch (error) { }
        } else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            window.web3 = new Web3(web3.currentProvider);
            web3.eth.sendTransaction({});
        } else {
            console.log("Non-Ethereum browser detected. You should consider   trying MetaMask!");
        }
        return App.initContract();
    },

    initContract: async () => {

        $.getJSON('product.json', (data) => {

            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });
        await delay(150);
        return App.getData();
    },

    getData: () => {
        var productInstance;

        web3.eth.getAccounts(function (error, accounts) {

            if (error) {
                console.log(error);
            }

            var account = accounts[0];
            console.log(account);

            App.contracts.product.deployed().then((instance) => {

                productInstance = instance;
                return productInstance.viewProducts.call();

            }).then(async (result) => {

                let data = formatData(result)

                console.log(data.productIds)
                let ids = data.productIds.map(ele => { return ele.replace(/\0.*$/g,'');});

                await getProdQR(ids).then(function(response) {return response.json();}).then(function(res) {
                    let QrData = res.documents.map(ele =>{return ele.qr});
                    var t = "";
                    for (var i = 0; i < data.productIds.length; i++) {
                        var tr = "<tr>";
                        tr += "<td>" + data.productIds[i] + "</td>";
                        tr += "<td>" + data.pNames[i] + "</td>";
                        tr += "<td>" + data.pDesc[i] + "</td>";
                        tr += "<td>" + data.ownerIds[i] + "</td>";
                        tr += "<td> <img src =" + QrData[i] + " onclick=getTransactions("+data.productIds[i]+") class ='qr-img' /></td>";
                        tr += "</tr>";
                        t += tr;
                    }
                    document.getElementById('logdata').innerHTML += t;
                    document.getElementById('add').innerHTML = account;
                }).catch(function (err) {console.log(err.message);})
            }).catch(function (err) {
                console.log(err.message);
            })
        })
    }
};

let formatData = (result) => {
    console.log(result)
    let data = {};
    let params = ['productIds', 'pNames', 'pDesc', 'ownerIds', 'qr'];
    for (let i = 0; i < result.length; i++) {
        data[params[i]] = result[i].map(ele => { return web3.toAscii(ele).replace(/\0.*$/g,'') });
    }
    return data;
}
let delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

let getProdQR = (ids) => {
    let data = { ids: ids }
    const baseurl = "http://localhost:8080";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };
    console.log(requestOptions)
    return fetch(`${baseurl}/products`, requestOptions)
}

let getTransactions = (id) =>{
    const baseurl = "http://localhost:8080";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    fetch(`${baseurl}/transactions/product/${id}`, requestOptions).then(response => response.json())
    .then(async result =>{ console.log(result.documents)
        await getDetailedTransaction(result.documents[0].txnId)
        let pId, prevOwner, currOwner ='';
        var t = "";
        $('#transactionTable').empty();

        for (var i = 0; i < result.documents.length; i++) {
            pId = result.documents[i].productId;
            currOwner = result.documents[i].ownerId;
            prevOwner = (i == 0) ? currOwner :  result.documents[i-1].ownerId;

            var tr = "<tr> <td>" + prevOwner + "</td>";
            tr += "<td>" + currOwner + "</td>";
            tr += "<td>" + result.documents[i].txnId + "</td>";
            tr += "</tr>";
            t += tr;

        }
        document.getElementById('transactionTable').innerHTML += t;
    
    }).catch(error => console.log('error', error));
}

let getDetailedTransaction = (Tid) =>{
    web3.eth.getTransaction(Tid,function(error, result){
        if(!error)
            console.log(result);
        else
            console.error(error);
   })
}

$(function () {
    $(window).load(function () {
        App.init();
    })
})