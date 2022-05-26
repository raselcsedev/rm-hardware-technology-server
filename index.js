const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uye7w.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  console.log('rm');
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, 'process.env.ACCESS_TOKEN_SECRET', function(err, decoded) {
    if(err){
      return res.status(403).send({message: 'Forbidden'})
    }
    req.decoded= decoded;
    next();
  });

}

async function run(){
    try{
        await client.connect();
        console.log('Database Connected');
        const productsCollection = client.db('rm_hardware_technology').collection('products');
        const orderCollection = client.db('rm_hardware_technology').collection('orders');
        const userCollection = client.db('rm_hardware_technology').collection('users');

        app.get('/product', async (req, res)=>{
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.put('/user/:email', async(req, res)=>{
          const email = req.params.email;
          const user = req.body;
          const filter = {email: email};
          const options = { upsert: true };
          const updateDoc = {
            $set: user,
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60 * 60 })
          res.send({result, token});
        });
    

        app.get('/product/:id', async(req,res)=>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const product = await productsCollection.findOne(query);
          res.send(product);
      });

      app.post('/order', async(req, res)=>{
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.send(result);
      });

      app.get('/order', verifyJWT, async (req, res)=>{
        const userEmail = req.query.userEmail;        
        const decodedEmail = req.decoded.email;
        if(userEmail === decodedEmail){
        const query = {userEmail: userEmail};
        const orders = await orderCollection.find(query).toArray();
        return res.send(orders);
        }
        else{
          return res.status(403).send({message: 'Forbidden'});
        }
        
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