const express = require('express');
const cors = require('cors');
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uye7w.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

app.get('/', (req, res) => {
  res.send('RM HardWare Technology!')
})

app.listen(port, () => {
  console.log(`RM HardWare Technology app listening on port ${port}`)
})