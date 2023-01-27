let accId ='';
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

  bindEvents: function () {

    $(document).on('click', '.btn-sell', App.sellProduct);
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

let saveTransaction =  (txnData) => {
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

let updateProduct =  (data) => {
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
$(function () {

  $(window).load(function () {
    accId = (document.cookie).split('=')[1];
    $('#pOwner').val(accId);
    App.init();
  })
})