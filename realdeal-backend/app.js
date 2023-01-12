const express = require('express')
const app = express()
const port = 8080
const baseurl = "https://data.mongodb-api.com/app/data-xnrok/endpoint/data/v1";
const apiKey = 'tVsqWuuHpbBx0lc5AmQKnDhPVeInWxijlcmgiZxLxRdXIbCkc5b7skQmyorGFs1K';
var axios = require('axios');
app.use(express.json());
const cors = require("cors");
const { request } = require('express');
app.use(cors())

var config = {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': apiKey,
    'Access-Control-Allow-Origin': '*'
  },
};


// USERS
app.post('/user', (req, res) => {
  let data = JSON.stringify({
    "database": "realdeal",
    "dataSource": "Cluster0",
    collection: 'users',
    document: req.body
  });
  config.url = `${baseurl}/action/insertOne`,
    config.data = data;

  console.log(config)
  axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  })
    .catch(function (error) {
      console.log(error);
    });
})


// TRANSACTIONS
app.post('/transaction', (req, res) => {
  let data = JSON.stringify({
    database: "realdeal",
    dataSource: "Cluster0",
    collection: "transactions",
    document: req.body
  });
  config.url = `${baseurl}/action/insertOne`,
  config.data = data;
  console.log(config)

  axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  })
    .catch(function (error) {
      console.log(error);
    });
});

app.get("/transactions/product/:id",(req,res)=>{

  let data = JSON.stringify({
    database: "realdeal",
    dataSource: "Cluster0",
    collection: "transactions",
    "filter": { productId : req.params['id'] },
  });
  config.url = `${baseurl}/action/find`,
  config.data = data;

  console.log(config)
  axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  }).catch(function (error) {
      console.log(error);
    });
});


// PRODUCTS
app.put('/product', (req, res) => {
  console.log(req.body)
  let data = JSON.stringify({
    database: "realdeal",
    dataSource: "Cluster0",
    collection: "products",
    "filter": { productId: req.body.productId },
    "update": { "$set": { "currentOwner": req.body.ownerId } }
  });
  config.url = `${baseurl}/action/updateOne`;
  config.data = data;
  console.log(config)

  axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  }).catch(function (error) {
    console.log(error);
  });

});

app.post('/product', (req, res) => {
  let data = JSON.stringify({
    database: "realdeal",
    dataSource: "Cluster0",
    collection: "products",
    document: req.body
  });

  config.url = `${baseurl}/action/insertOne`,
    config.data = data;
  axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  }).catch(function (error) {
      console.log(error);
    });
});

app.post('/products',(req,res)=>{
  console.log(req.body)

  let data = JSON.stringify({
    database: "realdeal",
    dataSource: "Cluster0",
    collection: "products",
    "filter": { productId : { $in : req.body.ids } },
  });
  config.url = `${baseurl}/action/find`,
    config.data = data;

  console.log(config)
  axios(config).then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send(response.data)
  }).catch(function (error) {
      console.log(error);
    });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})