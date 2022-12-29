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

    initContract: async () =>{

        $.getJSON('product.json', (data) =>{

            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });
        await delay(100);
        return App.getData();
    },

    getData: () =>{

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

            }).then((result) => {
               
                let data = formatData(result)
                

                var t = "";
                for (var i = 0; i < result.length; i++) {
                    var tr = "<tr>";
                    tr += "<td>" + data.productIds[i] + "</td>";
                    tr += "<td>" + data.pNames[i] + "</td>";
                    tr += "<td>" + data.pDesc[i] + "</td>";
                    tr += "<td>" + data.ownerIds[i] + "</td>";
                    // tr += "<td>" + data.pStatus[i] + "</td>";
                    tr += "</tr>";
                    t += tr;
                }
                document.getElementById('logdata').innerHTML += t;
                document.getElementById('add').innerHTML = account;
            }).catch(function (err) {
                console.log(err.message);
            })
        })
    }
};

let formatData = (result) =>{
    let data = {};
    let params = ['productIds','pNames','pDesc','ownerIds','pStatus'];
    for(let i =0 ;i < result.length; i++){
        data[params[i]]= result[i].map(ele => {return web3.toAscii(ele) });
    }
    return data;
} 
let delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

$(function () {
    $(window).load(function () {
        App.init();
    })
})