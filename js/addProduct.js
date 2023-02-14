const Web3 = require('web3');
const baseurl = "http://localhost:8080";
let currentUser;

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

  initContract: function () {

    $.getJSON('../build/contracts/product.json', function (data) {

      var productArtifact = data;
      App.contracts.product = TruffleContract(productArtifact);
      App.contracts.product.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: () => {
    web3.eth.getAccounts(function (error, accounts) {

      if (error) {
        console.log(error);
      }
      App.accounts = accounts;
      $(document).on('click', '#register', App.registerProduct),
        $(document).on('click', '.pidGenerate', App.generateProductID);
    });
  },

  registerProduct: (event) => {
    event.preventDefault();

    var productInstance;

    var pOwner = document.getElementById('pOwner').value;
    var productId = document.getElementById('productId').value;
    var pName = document.getElementById('pName').value;
    var pDesc = document.getElementById('pDesc').value;
    var price = document.getElementById('price').value;
    let qrData = "";

    // var account = accounts[0];
    let account = pOwner;

    console.log(account);
    setCookie("account", account, 2);

    App.contracts.product.deployed().then(async (instance) => {
      productInstance = instance;

      qrData = await generateQR({ productId, pOwner, pName, pDesc });
      console.log(qrData)

      return productInstance.createProduct(web3.fromAscii(productId), web3.fromAscii(pName), web3.fromAscii(pDesc), account, price, { from: account });
    }).then(async(result) => {
      console.log("result : ", result);
      delay(200);

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Access-Control-Request-Headers", "*");
      myHeaders.append("Access-Control-Allow-Origin", "*");

      var txnData = JSON.stringify({
        txnId: result.tx,
        productId: productId,
        ownerId: pOwner,
        ownerAddress: result.receipt.from,
        price: price
      });

      var prodData = JSON.stringify({
        productId: productId,
        productName: pName,
        productDesc: pDesc,
        currentOwner: pOwner,
        price: price,
        qr: qrData,
      });

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: txnData,
        redirect: 'follow'
      };

      // window.location.reload();
      fetch(`${baseurl}/transaction`, requestOptions)
        .then(response => response.text())
        .then(result => {
          requestOptions.body = prodData;
          fetch(`${baseurl}/product`, requestOptions).then(res => console.log(res)).catch(error => console.log('error', error));
        })
        .catch(error => console.log('error', error));

      clearValues(['productId', 'pOwner', 'pName', 'pDesc','price']);

    }).catch((err) => {
      console.log(err.message);
      let msg = err.message.substring(err.message.indexOf("reason") + 9, err.message.indexOf(".\"},\""));
      alert(msg);
    });
  },
  generateProductID: () => {
    document.getElementById('productId').value = Math.floor(100000000 + Math.random() * 900000000);
  }

};
let delay = (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

let clearValues = (arr) => {
  arr.forEach(element => {
    document.getElementById(element).innerHTML = '';
  });
}
const generateQR = async text => {
  text = JSON.stringify(text)
  try {
    return (await QRCode.toDataURL(text));
  } catch (err) {
    console.error(err)
  }
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

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


$(() => {
  $(window).load(function () {
    App.init();
  })
})