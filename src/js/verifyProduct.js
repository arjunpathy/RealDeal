App = {

  web3Provider: null,
  contracts: {},
  scannedData: '',

  init: async function (data) {
    scannedData = JSON.parse(data);
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

  initContract: function () {

    $.getJSON('product.json', function (data) {

      var productArtifact = data;
      App.contracts.product = TruffleContract(productArtifact);
      App.contracts.product.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },
  bindEvents: () => {

    $(document).on('click', '.signin', App.register);
    return App.fakeProduct();
  },

  fakeProduct: () => {

    var productInstance;

    var productId = scannedData.productId;
    var ownerId = scannedData.pOwner;
    console.log(productId, ownerId);
    if(!productId || !ownerId){
      let text = "<tr><td> N/A </td><td> N/A </td><td> Invalid QR </td></tr>"
      document.getElementById('logdata').innerHTML = text;
    }
    web3.eth.getAccounts((error, accounts) => {

      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log(account);

      App.contracts.product.deployed().then(function (instance) {

        productInstance = instance;
        return productInstance.verifyFakeness(web3.fromAscii(productId), web3.fromAscii(ownerId), { from: account });

      }).then(function (result) {

        console.log(result);
        var productId;
        var pOwner;
        var pStatus;


        productId = web3.toAscii(result[0]);

        pOwner = web3.toAscii(result[1]);

        pStatus = web3.toAscii(result[2]);


        var t = "";


        var tr = "<tr>";
        tr += "<td>" + productId + "</td>";
        tr += "<td>" + pOwner + "</td>";
        tr += "<td>" + pStatus + "</td>";
        tr += "</tr>";
        t += tr;

        document.getElementById('logdata').innerHTML = t;

      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  register: (event) => {
    event.preventDefault();
    const baseurl = "http://localhost:8080" //"https://data.mongodb-api.com/app/data-xnrok/endpoint/data/v1";
    // const apiKey = 'tVsqWuuHpbBx0lc5AmQKnDhPVeInWxijlcmgiZxLxRdXIbCkc5b7skQmyorGFs1K';

    var id = document.getElementById('ownerid').value;
    var uname = document.getElementById('name').value;
    var password = document.getElementById('password').value;
    var role = document.getElementById('role').value;
    console.log(id, uname, password, role);



    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Access-Control-Request-Headers", "*");
    myHeaders.append("Access-Control-Allow-Origin", "*");

    var raw = JSON.stringify({
      uname,password,role,id,
      address: "",
      isLoggedId: false
  });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(`${baseurl}/user`, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }


  
};