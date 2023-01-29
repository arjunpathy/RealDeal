const Web3 = require('web3');
const baseurl = "http://localhost:8080";

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
            $(document).on('click', '#Assign-btn', App.assignRole);
            return App.getData();
        });
    },

    getData: () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Access-Control-Request-Headers", "*");
        myHeaders.append("Access-Control-Allow-Origin", "*");
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let t = "";
        fetch(`${baseurl}/users`, requestOptions).then(response => response.text())
            .then(response => {
                response = JSON.parse(response)
                console.log(response);
                response.forEach(user => {
                    var tr = "<tr>";
                    tr += "<td style='width: 150px;'>" + user.uname + "</td>";
                    tr += "<td>" + user.id + "</td>";
                    tr += "<td>" + user.address + "</td>";
                    tr += "<td>" + user.role + "</td>";
                    tr += "</tr>";
                    t += tr;
                });
                document.getElementById('userData').innerHTML += t;
            }).catch(err => {
                console.log(err)
            })
    },

    assignRole: function (event) {
        event.preventDefault();

        var productInstance;

        let userAddress = document.getElementById('userAdd').value;
        let role = $('input[name="role"]:checked').val();

        var account = App.accounts[0];
        console.log(account);

        App.contracts.product.deployed().then(function (instance) {
            productInstance = instance;
            return productInstance.assignRole(userAddress, role, { from: account });
        }).then(async (result) => {
            console.log(result);
            await updateUserRole(userAddress, role).then(() => {
            }).catch((err) => console.log(err.message))
            window.location.reload();
        })
    }
};

let delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}

let updateUserRole = (address, roleIndex) => {
    let roles = ['Admin', 'Seller', 'Consumer'];
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    var requestOptions = {
        method: 'PUT',
        body: JSON.stringify({ address: address, role: roles[roleIndex] }),
        headers: myHeaders,
        redirect: 'follow'
    };
    return fetch(`${baseurl}/update/user`, requestOptions)
}





$(function () {
    $(window).load(function () {
        App.init();
    })
})