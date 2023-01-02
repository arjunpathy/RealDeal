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

    bindEvents: function() {

        $(document).on('click','.btn-sell',App.sellProduct);
    },

    sellProduct: function(event) {
        event.preventDefault();

        var productInstance;

        let productId = document.getElementById('productId').value;
        let pOwner = document.getElementById('pOwner').value;
        let pBuyer = document.getElementById('pBuyer').value;
        
        web3.eth.getAccounts(function(error,accounts){

            if(error) {
                console.log(error);
            }

            var account=accounts[0];
            console.log(account);

            App.contracts.product.deployed().then(function(instance){
                productInstance=instance;
                return productInstance.sellProduct(web3.fromAscii(productId),web3.fromAscii(pOwner),web3.fromAscii(pBuyer),{from:account});
            }).then((result) =>{

                console.log(result);
                window.location.reload();
                document.getElementById('productId').innerHTML='';
                
            }).catch(function(err){
                console.log(err.message);
            });
        });
    }
};

$(function() {

    $(window).load(function() {
        App.init();
    })
})