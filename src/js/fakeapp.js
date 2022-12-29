App = {

    web3Provider: null,
    contracts: {},
    scannedData: '',

    init: async function(data) {
        scannedData=data;
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

        return App.fakeProduct();
    },

    fakeProduct: function() {

        var productInstance;

        var productId = scannedData;
        console.log(productId);

        web3.eth.getAccounts(function(error,accounts){

            if(error) {
                console.log(error);
            }

            var account=accounts[0];
            console.log(account);

            App.contracts.product.deployed().then(function(instance){

                productInstance=instance;
                return productInstance.verifyFakeness(web3.fromAscii(productId),{from:account});

            }).then(function(result){

                console.log(result);
                var productId;
                var pOwner;
                var pStatus;

                
                productId=web3.toAscii(result[0]);
                     
                    pOwner=web3.toAscii(result[1]);
                

                
                    pStatus=web3.toAscii(result[2]);
                

                var t= "";
                

                    var tr="<tr>";
                    tr+="<td>"+productId+"</td>";
                    tr+="<td>"+pOwner+"</td>";
                    tr+="<td>"+pStatus+"</td>";
                    tr+="</tr>";
                    t+=tr;
                
                document.getElementById('logdata').innerHTML = t;

            }).catch(function(err){

                console.log(err.message);
            });
        });
    }
};