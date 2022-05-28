const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        const orderCollection = client.db('rm_hardware_technology').collection('orders');
        const userCollection = client.db('rm_hardware_technology').collection('users');
        const reviewsCollection = client.db('rm_hardware_technology').collection('reviews');


        app.post('/create-payment-intent', async (req, res)=>{
          const product = req.body;
          const price = product.price;
          const amount = price*100;
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount ,
            currency: 'usd',
            payment_method_types: ['card']

          });
          res.send({clientSecret: paymentIntent.client_secret})
        })

        app.get('/product', async (req, res)=>{
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        app.get('/review', async (req, res)=>{
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        

        app.get('/user', async(req, res)=>{
          const users = await userCollection.find().toArray();
          res.send(users);
        });

        app.get('/admin/:email', async(req, res)=>{
          const email = req.params.email;
          const user = await userCollection.findOne({email: email});
          const isAdmin = user.role === 'admin';
          res.send({admin: isAdmin})
        })

        app.put('/user/admin/:email', async(req, res)=>{
          const email = req.params.email;

          const filter = {email: email};
          const updateDoc = {
            $set: {role: 'admin'},
          };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.send({result});

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
        

      app.get('/order', async (req, res)=>{
        const userEmail = req.query.userEmail;        
        const query = {userEmail: userEmail};
        const orders = await orderCollection.find(query).toArray();
        res.send(orders);     
    }); 

    app.get('/order/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const order = await orderCollection.findOne(query);
      res.send(order);
    })

      app.post('/order', async(req, res)=>{
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.send(result);
      });

     app.post('/product', async(req, res)=>{
       const product = req.body;
       const result = await productsCollection.insertOne(product);
       res.send(result);
     });
     app.post('/review', async(req, res)=>{
       const review = req.body;
       const result = await reviewsCollection.insertOne(review);
       res.send(result);
     });

     app.delete('/product/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
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