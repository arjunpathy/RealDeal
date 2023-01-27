pragma solidity ^0.8.17;

contract product {

    struct ProductStruct {
        bytes32 id;
        bytes32 name;
        bytes32 desc;
        address owner;
    }

    uint public productsCount  = 0;
    bytes32[] productIds;


    struct OwnershipHistory {
        address previousOwner;
        address newOwner;
        uint timestamp;
        // bytes32 transactionHash;
        uint blockNumber;
    }

    mapping(bytes32 => ProductStruct) public products;
    // OwnershipHistory[] public ownershipHistory;
    mapping(address => uint8) public roles;
    enum Role { ADMIN, SELLER, USER }

    constructor() {
        // Assign the admin role to the address that deploys the contract
        roles[msg.sender] = uint8(Role.ADMIN);
    }

    function createProduct(bytes32 _id, bytes32 _name, bytes32 _desc, address _owner) public {
        require(roles[msg.sender] == uint8(Role.ADMIN), "Only admin can create a product.");
        products[_id] = ProductStruct(_id, _name, _desc, _owner);
        productIds.push(_id);
        productsCount++;
    }

    function getAllProducts() public view returns ( bytes32[] memory,bytes32[] memory, bytes32[] memory, address[] memory) {
            bytes32[] memory names = new bytes32[](productsCount);
    bytes32[] memory descriptions = new bytes32[](productsCount);
    address[] memory ownerIds = new address[](productsCount);


        for(uint i = 0; i < productsCount; i++) {
            ProductStruct storage prod = products[productIds[i]];
            names[i] = prod.name;
            descriptions[i] = prod.desc;
            ownerIds[i] = prod.owner;
        }
        return (productIds,names,descriptions,ownerIds);
    }


    function getProduct(bytes32 _id) public view returns (bytes32, bytes32, bytes32, address) {
        ProductStruct storage Prod = products[_id];
        return (Prod.id, Prod.name, Prod.desc, Prod.owner);
    }

    function verifyFakeness(bytes32 _id, address _ownerId) public view returns (bool) {
        bool flag = false;
        for(uint i =0; i < productsCount ; i ++){
            if( products[productIds[i]].id == _id &&  products[productIds[i]].owner == _ownerId){
               flag = true;
            }
        }
        return flag ;
    }

    function transferOwnership(bytes32 _id, address currentOwner, address newOwner) public {
        require(products[_id].owner == currentOwner && (roles[msg.sender] == uint8(Role.ADMIN) || roles[msg.sender] == uint8(Role.SELLER) ), "Invalid Owner details or Invalid Authorization.");
        // OwnershipHistory memory ownershipChange = OwnershipHistory(products[_id].owner, newOwner, block.timestamp, block.number);
        // ownershipHistory.push(ownershipChange);
        products[_id].owner = newOwner;
    }


    function assignRole(address user, Role role) public {
        require(roles[msg.sender] == uint8(Role.ADMIN), "Only admin can assign roles.");
        roles[user] = uint8(role);
    }
}