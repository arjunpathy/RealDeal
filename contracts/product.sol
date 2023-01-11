
contract product {

    bytes32[] products;
    bytes32[] owners;
    bytes32[] prodName;
    bytes32[] prodDesc;
    bytes32[] qr;

    mapping(bytes32 => bool) public vProducts;

    function registerProduct(bytes32 productId, bytes32 pOwner, bytes32 pName, bytes32 pDesc) public{

        require(!vProducts[productId]);
        vProducts[productId] = true;

        products.push(productId);
        owners.push(pOwner);
        prodName.push(pName);
        prodDesc.push(pDesc);
        // qr.push(qrData);                
    }


    function viewProducts () public view returns(bytes32[] memory, bytes32[] memory,bytes32[] memory, bytes32[] memory) {
        return(products, prodName, prodDesc, owners);
    }


    function sellProduct (bytes32 sProductId,bytes32 ownerId,bytes32 buyerId) public returns(bytes32){
        uint i;int index = -1;

        if(products.length>0) {
            for(i=0; i<products.length && index < 0; i++) {
                if(products[i]==sProductId && owners[i]== ownerId) 
                    index = int(i);
            }
        }   
        if(index >= 0){
            owners[uint(index)] = buyerId;
            // pStatus[uint(index)]="NA";
            return("Ownership Transferred");
        }else {revert("Invalid Product or Owner ID");}
    }

    function verifyFakeness(bytes32 vProductId,bytes32 ownerId) public view returns(bytes32,bytes32,bytes32) {

        bool itemFound=false;
        uint i;
        uint index=0;

        if(products.length>0) {
            for(i=0;i<products.length;i++) {
                if(products[i]==vProductId) {
                    index=i;
                    itemFound=true;
                }
            }
        }

        if(itemFound == true) {
                if(owners[index] == ownerId)
                    return(products[index],owners[index],"Original");
                else 
                    return (products[index],owners[index],"Fake");
        } else {
                return("NA","NA","Fake");
        }

    }
}

