
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
    assignRole: function (event) {
        event.preventDefault();

        var productInstance;

        let userAddress = document.getElementById('signup_addr').value;
        let role = document.getElementById('signup_role').value;

        var account = App.accounts[0];
        console.log(account);

        App.contracts.product.deployed().then(function (instance) {
            productInstance = instance;
            return productInstance.assignRole(userAddress, role, { from: account });
        }).then(async (result) => {
            console.log(result);
        })
    }
};
let registerUser = (event) => {
    event.preventDefault();

    var id = document.getElementById('signup_uid').value;
    var uname = document.getElementById('signup_uname').value;
    var password = document.getElementById('signup_pwd').value;
    var role = document.getElementById('signup_role').value;
    var addr = document.getElementById('signup_addr').value;
    console.log(id, uname, password, role, addr);

    if (id && uname && password && role && addr) {

        var myHeaders = getHeaders();

        var raw = JSON.stringify({ uname, password, role, id, address: addr, isLoggedId: false });

        var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };

        fetch(`${baseurl}/user`, requestOptions)
            .then(response => response.text())
            .then(result => { console.log(result); $("#loginlabel").trigger("click"); })
            .catch(error => console.log('error', error));
    }
}

let loginUser = (event) => {
    event.preventDefault();

    var id = document.getElementById('login_uid').value;
    var password = document.getElementById('login_pwd').value;
    if (id && password) {

        var myHeaders = getHeaders();
        var raw = JSON.stringify({ id, password });
        var requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };
        fetch(`${baseurl}/login`, requestOptions)
            .then(response => response.text())
            .then(result => {
                if (result === 'true') {
                    setCookie("id", id, 10);
                    window.location.replace("verify.html");
                }
                else
                    alert("Invalid Credentials! Try Again.")
            })
            .catch(error => console.log('error', error));
    }

}
let getHeaders = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");
    return myHeaders;
}
function setCookie(name, value, min) {
    var expires = "";
    if (min) {
        var date = new Date();
        date.setTime(date.getTime() + (min * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

document.getElementById("signup").onclick = registerUser;
document.getElementById("loginbtn").onclick = loginUser;
