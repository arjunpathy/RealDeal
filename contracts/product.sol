pragma solidity ^0.8.17;
//SPDX-License-Identifier: UNLICENSED

contract product {

    struct ProductStruct {
        bytes32 id;
        bytes32 name;
        bytes32 desc;
        address owner;
        uint price;
    }

    uint public productsCount  = 0;
    bytes32[] productIds;


    mapping(bytes32 => ProductStruct) public products;
    mapping(address => uint8) public roles;

    event Log(bytes32 _id, bytes32 _name, bytes32 _desc, address _owner);

    enum Role { ADMIN, SELLER, CONSUMER }

    address payable public seller;

    constructor() {
        // Assign the admin role to the address that deploys the contract
        roles[msg.sender] = uint8(Role.ADMIN);
    }

    function createProduct(bytes32 _id, bytes32 _name, bytes32 _desc, address _owner,uint _price) public {
        emit Log(_id,_name,_desc,_owner);

        require(products[_id].price == 0, "Product ID already exists");
        require(roles[_owner] == uint8(Role.ADMIN), "Only admin can create a product.");
        products[_id] = ProductStruct(_id, _name, _desc, _owner,_price);
        productIds.push(_id);
        productsCount++;
    }

    function getAllProducts() public view returns ( bytes32[] memory,bytes32[] memory, bytes32[] memory, address[] memory, uint[] memory) {
    bytes32[] memory names = new bytes32[](productsCount);
    bytes32[] memory descriptions = new bytes32[](productsCount);
    address[] memory ownerIds = new address[](productsCount);
    uint[] memory prices = new uint[](productsCount);
       
        for(uint i = 0; i < productsCount; i++) {
            ProductStruct storage prod = products[productIds[i]];
            names[i] = prod.name;
            descriptions[i] = prod.desc;
            ownerIds[i] = prod.owner;
            prices[i] = prod.price;
        }
        return (productIds,names,descriptions,ownerIds,prices);
    }
 

    function getProduct(bytes32 _id) public view returns (bytes32, bytes32, bytes32, address, uint) {
        ProductStruct storage Prod = products[_id];
        return (Prod.id, Prod.name, Prod.desc, Prod.owner, Prod.price);
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

    function transferOwnership(bytes32 _id, address _currentOwner, address _newOwner, uint _price) public payable{
        require(products[_id].owner == _currentOwner && (roles[msg.sender] == uint8(Role.CONSUMER) || roles[msg.sender] == uint8(Role.SELLER) ), "Invalid Owner details or Invalid Authorization.");
        require(_price > 0, "Price must be greater than 0");
        require(_currentOwner != _newOwner, "Buyer & Seller cannot be the same");

        seller = payable(_currentOwner);        
        seller.transfer(msg.value);

        products[_id].owner = _newOwner;
        products[_id].price = _price;

    }

   
    function assignRole(address user, Role role) public {
        require(roles[msg.sender] == uint8(Role.ADMIN), "Only admin can assign roles.");
        roles[user] = uint8(role);
    }


}