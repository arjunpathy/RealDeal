const Web3 = require('web3');
const baseurl = "http://localhost:8080";
let accId = '';
let currentUser;
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
        web3.eth.getAccounts(async (error, accounts) => {
            if (error) {
                console.log(error);
            }
            App.accounts = accounts;
        $(document).on('click', '#sell-btn', App.sellProduct);
        return App.getData(accounts);
        });
    },

    getData: async(accounts) => {
        var productInstance;

            var account = accounts[0];

            console.log(account);

            App.contracts.product.deployed().then((instance) => {

                productInstance = instance;
                return productInstance.getAllProducts.call();

            }).then(async (result) => {


                console.log("RESULT : ", result)

                let data = formatData(result);
                App.formatedData = data;

                console.log(data.productIds)
                let ids = data.productIds.map(ele => { return ele.replace(/\0.*$/g, ''); });
                console.log(ids)

                await getProdQR(ids).then(function (response) { return response.json(); }).then(function (res) {
                    let QrData = res.documents.map(ele => { return ele.qr });
                    var t = "";
                    for (var i = 0; i < data.productIds.length; i++) {
                        var tr = "<tr>";
                        tr += "<td style='width: 125px;'>" + data.productIds[i] + "</td>";
                        tr += "<td>" + data.pNames[i] + "</td>";
                        tr += "<td>" + data.pDesc[i] + "</td>";
                        tr += "<td class='ownerid-td'>" + data.ownerIds[i] + "</td>";
                        tr += "<td style='width: 75px;'> <img src =" + QrData[i] + " class ='qr-img' /></td>";
                        tr += "<td ><img style='cursor:pointer;margin-left:10px;' onclick=setSellInfo(" + i + ") src='./images/coin.png'title='Sell'/><img style='cursor:pointer;margin-left:10px;'onclick=getTransactions(" + data.productIds[i] + ") data-toggle='modal' data-target='#exampleModalCenter' src='./images/search.png'title='View'/></td>"
                        tr += "</tr>";
                        t += tr; //+ data.productIds[i] + ","+ oid +
                    }
                    document.getElementById('logdata').innerHTML += t;
                    document.getElementById('add').innerHTML = account;
                }).catch(function (err) { console.log(err.message); })
            }).catch(function (err) {
                console.log(err.message);
            })
    },

    sellProduct:  (event) =>{
        event.preventDefault();

        var productInstance;

        let productId = document.getElementById('productId').value;
        let pOwner = document.getElementById('pOwner').value;
        let pBuyer = document.getElementById('pBuyer').value;


            var account = App.accounts[0];
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
                    await updateProduct({ productId, ownerId: pBuyer }).then(() => {
                        // window.location.reload();
                        document.getElementById('productId').innerHTML = '';
                    }).catch((err) => console.log(err.message))
                }).catch((err) => console.log(err.message))
            }).catch(function (err) {
                console.log(err.message);
                let msg = err.message.substring(err.message.indexOf("reason") + 9, err.message.indexOf(".\"},\""));
                alert(msg);
            });
    }
};

let formatData = (result) => {
    console.log(result)
    let data = {};
    let params = ['productIds', 'pNames', 'pDesc']; //ownerIds' , 'qr'
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


            var t = "";
            $('#transactionTable').empty();
            App.docs = result.documents;

            for (var i = 0; i < result.documents.length; i++) {

                let div = "<div class='txnRow'> ";
                div += "<div style='width: 100%;display: inline-flex;'><img class='small-icon' src='./images/transaction.png' />";
                div += "<div style='font-size:12px;margin-left: 2%;margin-top: 1%;'>" + result.documents[i].txnId + "</div>";
                div += "<button class='btn seemore btn-warning' onclick='getDetailedTransaction(" + i + ")'><i id='arrow" + i + "' class='arrow down'></i></button></div><div class='hide' id='TxnDetail" + i + "'></div></div>";


                t += div;

            }
            document.getElementById('transactionTable').innerHTML += t;
        }).catch(error => console.log('error', error));
}

let getDetailedTransaction = (index) => {
    let Tid = App.docs[index].txnId;
    console.log(Tid)
    $(`#arrow${index}`).toggleClass("up");
    web3.eth.getTransaction(Tid, function (error, result) {
        if (!error) {
            $(`#TxnDetail${index}`).empty();
            $(`#TxnDetail${index}`).toggleClass("show");
            console.log(result);

            let t = "";
            let div = "";
            div += "<div style='width: 100%;display: inline-flex;'><div style='font-size: 11px;'>" + result.from + "</div><img class='medium-icon' src='./images/arrow-right.png' /><div style='font-size: 11px;'>" + result.to + "</div></div>";
            div += "<div style='width: 100%;display: inline-flex;'><img  class='small-icon'  src='./images/fork.png'/><div style='font-size: 10px;'>" + result.blockHash + "</div>";
            div += "<img  class='small-icon'  src='./images/cube.png'/><div>" + result.blockNumber + "</div><img  class='small-icon'  src='./images/gas-pump.png'/><div>" + result.gas + " wei</div></div>";
            t += div;
            document.getElementById(`TxnDetail${index}`).innerHTML += t;
        } else
            console.error(error);
    })
}

let setSellInfo = (index) => {
    $("#productId").val(App.formatedData.productIds[index]);
    $("#pOwner").val(App.formatedData.ownerIds[index]);
}

let saveTransaction = (txnData) => {
    const baseurl = "http://localhost:8080";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: txnData,
        redirect: 'follow'
    };
    return fetch(`${baseurl}/transaction`, requestOptions)
}

let updateProduct = (data) => {
    const baseurl = "http://localhost:8080";
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };
    console.log(requestOptions)
    return fetch(`${baseurl}/product`, requestOptions)
}


var cards = document.querySelectorAll('.card');
[...cards].forEach((card) => {
    card.addEventListener('click', function () {
        card.classList.toggle('is-flipped');
    });
});
let getUser = (id) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    var requestOptions = {method: 'GET',headers: myHeaders,redirect: 'follow'};
    return fetch(`${baseurl}/user/${id}`, requestOptions)
}
let logout = () => {
    let confirmAction = confirm("Are you sure?");
    if (confirmAction) {
      document.cookie.split(";").forEach(function (c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
      window.location.replace("index.html");
    } else {location.reload();}
  }
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
let id = getCookie('id');
if (id) {
  getUser(id).then(response => response.json())
    .then((response) => {
      console.log("USER : ", response)
      currentUser = response[0];
      $('#pOwner').val(currentUser.address);
      $('#currentUserName').text(`Welcome ${currentUser.uname} !`);
      $('#currentUserRole').text(currentUser.role);
    }).catch(err => {
      console.log(err);
      window.location.replace("index.html");
    });
} else {
  alert("Please Login!")
  window.location.replace("index.html");
}

  

$(function () {
    $(window).load(function () {
        App.init();
    })
})