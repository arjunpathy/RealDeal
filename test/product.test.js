
const Product = artifacts.require('Product');

contract('Product', (accounts) => {
  let productInstance;

  before(async () => {
    productInstance = await Product.deployed();
  });

  it('should create a product', async () => {
    const productId = web3.utils.asciiToHex('P001');
    const productName = web3.utils.asciiToHex('Product One');
    const productDesc = web3.utils.asciiToHex('This is product one');
    const productOwner = accounts[1];
    const productPrice = 10;

    await productInstance.createProduct(productId, productName, productDesc, productOwner, productPrice);

    const [id, name, desc, owner, price] = await productInstance.getProduct(productId);

    assert.equal(id, productId);
    assert.equal(name, productName);
    assert.equal(desc, productDesc);
    assert.equal(owner, productOwner);
    assert.equal(price, productPrice);
  });

  it('should transfer ownership of a product', async () => {
    const productId = web3.utils.asciiToHex('P001');
    const currentOwner = accounts[1];
    const newOwner = accounts[2];
    const price = 200;

    await productInstance.transferOwnership(productId, currentOwner, newOwner, price, { value: price });

    const [id, name, desc, owner, newPrice] = await productInstance.getProduct(productId);

    assert.equal(owner, newOwner);
    assert.equal(newPrice, price);
  });

  it('should not allow non-admin to create a product', async () => {
    const productId = web3.utils.asciiToHex('P002');
    const productName = web3.utils.asciiToHex('Product Two');
    const productDesc = web3.utils.asciiToHex('This is product two');
    const productOwner = accounts[1];
    const productPrice = 150;

    try {
      await productInstance.createProduct(productId, productName, productDesc, productOwner, productPrice, { from: accounts[1] });
    } catch (error) {
      assert.equal(error.reason, 'Only admin can create a product.');
      return;
    }

    assert.fail('Expected to throw');
  });
});
