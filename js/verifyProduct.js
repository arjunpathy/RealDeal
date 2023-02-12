const Web3 = require('web3');
const baseurl = "http://localhost:8080";
// const Html5QrcodeScanner = require("html5-qrcode");

let currentUser;

let App = {

  web3Provider: null,
  contracts: {},
  scannedData: '',
  historyTable: "",


  init: async function (data) {
    App.scannedData = JSON.parse(data);
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

  initContract: function () {

    $.getJSON('../build/contracts/product.json', function (data) {

      var productArtifact = data;
      App.contracts.product = TruffleContract(productArtifact);
      App.contracts.product.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },
  bindEvents: () => {
    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }
      App.contracts.product.deployed().then(function (instance) {
        return App.fakeProduct(accounts, instance);
      });
    });
  },

  fakeProduct: (accounts, productInstance) => {

    var productInstance;

    var productId = App.scannedData.productId;
    var ownerId = App.scannedData.pOwner;
    console.log(productId, ownerId);
    if (!productId || !ownerId) {
      let text = "<tr><td> N/A </td><td> N/A </td><td> Invalid QR </td></tr>"
      document.getElementById('logdata').innerHTML = text;
    }


    var account = accounts[0];
    console.log(account);
    productInstance.verifyFakeness(web3.fromAscii(productId), (ownerId), { from: account }).then(function (result) {

      console.log(result);

      let status = (result) ? "Authentic 👍" : "Fake 👎";

      var tr = "<tr>";
      tr += "<td>" + productId + "</td>";
      tr += "<td>" + ownerId + "</td>";
      tr += "<td>" + status + "</td>";
      tr += "</tr>";
      App.historyTable += tr;

      document.getElementById('logdata').innerHTML = App.historyTable;

    }).catch(function (err) {
      console.log(err.message);
    });
  }
};
let getUser = (id) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Access-Control-Request-Headers", "*");
  myHeaders.append("Access-Control-Allow-Origin", "*");
  var requestOptions = { method: 'GET', headers: myHeaders, redirect: 'follow' };
  return fetch(`${baseurl}/user/${id}`, requestOptions)
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}




let id = getCookie('id');
if (id) {
  getUser(id).then(response => response.json())
    .then((response) => {
      console.log("USER : ", response)
      currentUser = response[0];
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


function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete"
    || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
docReady(function () {
  var resultContainer = document.getElementById('qr-reader-results');
  var lastResult, countResults = 0;
  if(!countResults){
    onScanSuccess('{"productId":"-","pOwner":"-","pName":"-","pDesc":"-"}',{});
  }
  
  function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
      lastResult = decodedText;
      // Handle on success condition with the decoded message.
      var audio = new Audio('beep.wav');
      if(countResults){audio.play();}
      ++countResults;
      console.log(`Scan result ${decodedText}`, decodedResult);
      document.getElementById('qr-reader-results').innerHTML = decodedText;
      App.init(decodedText);
    }
  }

  var html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });html5QrcodeScanner.render(onScanSuccess);});


$(function () {
  $(window).load(function () {
    App.init();
  })
})