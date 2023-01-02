const Web3 = require('web3');

App = {

    web3Provider: null,
    contracts: {},

    init: async function() {
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
        } catch (error) {}
      } else if (window.web3) {
        App.web3Provider = web3.currentProvider;
        window.web3 = new Web3(web3.currentProvider);
        web3.eth.sendTransaction({});
      } else {
        console.log("Non-Ethereum browser detected. You should consider   trying MetaMask!");
      }
      return App.initContract();
      },

    initContract: function() {

        $.getJSON('product.json',function(data){

            var productArtifact=data;
            App.contracts.product=TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: ()=> {
      
      $(document).on('click','.btn-register', App.registerProduct),
      $(document).on('click','.pidGenerate', App.generateProductID);
    },

    registerProduct: (event) => {
        event.preventDefault();

        var productInstance;

        var productId = document.getElementById('productId').value;
        var pOwner = document.getElementById('pOwner').value;
        var pName = document.getElementById('pName').value;
        var pDesc = document.getElementById('pDesc').value;
        
        web3.eth.getAccounts(function(error,accounts){

            if(error) {
                console.log(error);
            }

            var account=accounts[0];
            console.log(account);

            App.contracts.product.deployed().then(async (instance)=>{
                productInstance=instance;

                var qrData = await generateQR({productId,pOwner,pName,pDesc});
                console.log(qrData)

                 return productInstance.registerProduct(web3.fromAscii(productId),web3.fromAscii(pOwner),web3.fromAscii(pName),web3.fromAscii(pDesc),{from:account});
            }).then((result) => {
                console.log(result);
                // window.location.reload();
                
                document.getElementById('productId').innerHTML='';
                document.getElementById('pOwner').innerHTML='';
                document.getElementById('pName').innerHTML='';
                document.getElementById('pDesc').innerHTML='';

            }).catch((err) =>{
                console.log(err.message);
            });
        });
    },
    generateProductID: () =>{
      document.getElementById('productId').value = Math.floor(100000000 + Math.random() * 900000000);
    } 
};

const generateQR = async text => {
  text = JSON.stringify(text)
  try {
      return (await QRCode.toDataURL(text));
  } catch (err) {
    console.error(err)
  }
}



$(() => {

    $(window).load(function() {
        App.init();
    })
})