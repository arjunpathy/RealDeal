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
        let qr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAAAXNSR0IArs4c6QAACsdJREFUeF7tndFu6zoMBNv/%0a/%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'
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
                
                console.log(data)
                var t = "";
                for (var i = 0; i < result.length; i++) {
                    var tr = "<tr>";
                    tr += "<td>" + data.productIds[i] + "</td>";
                    tr += "<td>" + data.pNames[i] + "</td>";
                    tr += "<td>" + data.pDesc[i] + "</td>";
                    tr += "<td>" + data.ownerIds[i] + "</td>";
                    tr += "<td> <img src =" + qr + " class ='qr-img' /></td>";
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
    console.log(result)
    let data = {};
    let params = ['productIds','pNames','pDesc','ownerIds']; 
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