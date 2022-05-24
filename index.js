const express = require('express');
const cors = require('cors');
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uye7w.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        console.log('Database Connected');
        const productsCollection = client.db('rm_hardware_technology').collection('products');

        app.get('/product', async (req, res)=>{
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id', async(req,res)=>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const product = await productsCollection.findOne(query);
          res.send(product);
      });

    }
    finally{

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('RM HardWare Technology!')
})

app.listen(port, () => {
  console.log(`RM HardWare Technology app listening on port ${port}`)
})