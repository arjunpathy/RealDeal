const Web3 = require('web3');
let accId ='';

App = {
    web3Provider: null,
    contracts: {},
    docs: [],

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
            console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }
        return App.initContract();
    },

    initContract: async () => {

        $.getJSON('../build/contracts/product.json', (data) => {

            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });
        await delay(150);
        return App.bindEvents();
    },
    bindEvents: function () {
        $(document).on('click', '#sell-btn', App.sellProduct);
        return App.getData();
    },

    getData: () => {
        var productInstance;

        web3.eth.getAccounts(function (error, accounts) {

            if (error) {
                console.log(error);
            }

            var account=accounts[0];

            console.log(account);

            App.contracts.product.deployed().then((instance) => {

                productInstance = instance;
                return productInstance.getAllProducts.call();

            }).then(async (result) => {


                console.log("RESULT : ",result)

                let data = formatData(result)

                console.log(data.productIds)
                let ids = data.productIds.map(ele => { return ele.replace(/\0.*$/g, ''); });
                console.log(ids)

                await getProdQR(ids).then(function (response) { return response.json(); }).then(function (res) {
                    let QrData = res.documents.map(ele => { return ele.qr });
                    var t = "";
                    for (var i = 0; i < data.productIds.length; i++) {
                        var tr = "<tr>";
                        tr += "<td>" + data.productIds[i] + "</td>";
                        tr += "<td>" + data.pNames[i] + "</td>";
                        tr += "<td>" + data.pDesc[i] + "</td>";
                        tr += "<td>" + data.ownerIds[i] + "</td>";
                        tr += "<td> <img src =" + QrData[i] + " data-toggle='modal' data-target='#exampleModalCenter' onclick=getTransactions(" + data.productIds[i] + ") class ='qr-img' /></td>";
                        tr += "</tr>";
                        t += tr;
                    }
                    document.getElementById('logdata').innerHTML += t;
                    document.getElementById('add').innerHTML = account;
                }).catch(function (err) { console.log(err.message); })
            }).catch(function (err) {
                console.log(err.message);
            })
        })
    },

    sellProduct: function (event) {
        event.preventDefault();

        var productInstance;

        let productId = document.getElementById('productId').value;
        let pOwner = document.getElementById('pOwner').value;
        let pBuyer = document.getElementById('pBuyer').value;

        web3.eth.getAccounts(async (error, accounts) => {

          if (error) {
            console.log(error);
          }

          var account=accounts[0];
          // let account = "0x8CC56523c7889aCAF70Ee1643AD5032a20323A1a"

          console.log(account);

          App.contracts.product.deployed().then(function (instance) {
            productInstance = instance;
            return productInstance.transferOwnership(web3.fromAscii(productId), (pOwner), (pBuyer), { from: account });
          }).then(async (result) => {

            var txnData = JSON.stringify({
              txnId: result.tx,
              productId: productId,
              ownerId: pBuyer,
              ownerAddress: result.receipt.from,
            });

            await saveTransaction(txnData).then(async () => {
              console.log(result);
              await updateProduct({productId, ownerId:pBuyer}).then( ()=>{
                // window.location.reload();
                document.getElementById('productId').innerHTML = '';
              }).catch((err) => console.log(err.message))
            }).catch((err) => console.log(err.message))
          }).catch(function (err) {
            console.log(err.message);
          });
        });
    }
};

let formatData = (result) => {
    console.log(result)
    let data = {};
    let params = ['productIds', 'pNames','pDesc']; //ownerIds' , 'qr'
    for (let i = 0; i < params.length; i++) {
            data[params[i]] = result[i].map(ele => { return web3.toAscii(ele).replace(/\0.*$/g, '') });
    }
    data['ownerIds'] = result[3] // ownerIds are the 4th parmeter in result
    console.log(data)
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

let getTransactions = (id) => {
    const baseurl = "http://localhost:8080";
    var myHeaders = new Headers();
    $("#exampleModalCenterTitle").text(`Product : ${id}`);
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
        .then(async result => {
            console.log(result.documents)

            // let txn = await getDetailedTransaction(result.documents[0].txnId)
            let pId, prevOwner, currOwner = '';


            var t = "";
            $('#transactionTable').empty();
            App.docs = result.documents;

            for (var i = 0; i < result.documents.length; i++) {
                pId = result.documents[i].productId;
                currOwner = result.documents[i].ownerId;
                prevOwner = (i == 0) ? currOwner : result.documents[i - 1].ownerId;


                var tr = "<tr onclick= getDetailedTransaction(" + i + ") ><td>" + prevOwner + "</td>";
                tr += "<td>" + currOwner + "</td>";
                tr += "<td style='font-size: 10px;' > <i> " + result.documents[i].txnId + " </i> </td>";
                tr += "</tr>";
                t += tr;

            }
            document.getElementById('transactionTable').innerHTML += t;
        }).catch(error => console.log('error', error));
}

let getDetailedTransaction = (index) => {
    let Tid = App.docs[index].txnId;
    console.log(Tid)
    web3.eth.getTransaction(Tid, function (error, result) {
        if (!error) {
            console.log(result);
            $("#txnFrom").text(result.from);
            $("#txnTo").text(result.to);
            $("#gas").text(result.gas);
            $("#txnHash").text(result.hash);
            $("#blockHash").text(result.blockHash);
            $("#blockNumber").text(result.blockNumber);
        } else
            console.error(error);
    })
}

var cards = document.querySelectorAll('.card');
[...cards].forEach((card)=>{
  card.addEventListener( 'click', function() {
    card.classList.toggle('is-flipped');  
  });
});


$(function () {
    $(window).load(function () {
        accId = (document.cookie).split('=')[1];
    $('#pOwner').val(accId);
        App.init();
    })
})