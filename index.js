const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//midleware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1m4kiwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const productsCollection = client.db('simpleEcom').collection('products')
const categoryCollection = client.db('simpleEcom').collection('category')

async function run() {
    try {

        app.get('/products', async (req, res) => {
            const query = {}
            const products = await productsCollection.find(query).toArray()
            res.send(products)
        })
        app.get('/productdetails/:id',async(req,res)=>{
            const id = req.params.id
            const query={_id:new ObjectId(id)}
            const result=await productsCollection.findOne(query);
            res.send(result);
        })

    } finally {

    }

} run().catch(error => console.error(error));

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})