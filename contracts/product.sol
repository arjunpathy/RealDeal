
contract product {

    bytes32[] products;
    bytes32[] owners;
    bytes32[] prodName;
    bytes32[] prodDesc;
    bytes32[] pStatus;

    mapping(bytes32 => bool) public vProducts;

    function setProduct(bytes32 productId, bytes32 pOwner, bytes32 pName, bytes32 pDesc) public{

        require(!vProducts[productId]);
        vProducts[productId] = true;

        products.push(productId);
        owners.push(pOwner);
        prodName.push(pName);
        prodDesc.push(pDesc);

        pStatus.push("Available");
                
    }


    function viewProducts () public view returns(bytes32[] memory, bytes32[] memory,bytes32[] memory, bytes32[] memory,bytes32[] memory) {
        return(products, prodName, prodDesc, owners, pStatus);
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
            pStatus[uint(index)]="NA";
            return("Ownership Transferred");
        }else {revert("Invalid Product or Owner ID");}
    }

    function verifyFakeness(bytes32 vProductId) public view returns(bytes32,bytes32,bytes32) {

        bool status=false;
        uint i;
        uint j=0;

        if(products.length>0) {
            for(i=0;i<products.length;i++) {
                if(products[i]==vProductId) {
                    j=i;
                    status=true;
                }
            }
        }

        if(status==true) {
                if(pStatus[j]=="Available")
                    return(products[j],owners[j],"Original");
                else 
                    return (products[j],owners[j],"Fake");
        } else {
                return("NA","NA","Fake");
        }

    }
}

