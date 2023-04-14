const express = require('express');
const { promisify } = require('util')
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//midleware 
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1m4kiwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const productsCollection = client.db('simpleEcom').collection('products')
const categoryCollection = client.db('simpleEcom').collection('category')
const addToCardCollection = client.db('simpleEcom').collection('card')
const userCollection = client.db('simpleEcom').collection('users')

console.log(process.env.TOKEN_SECRET)

const verifyToken = async (req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1]   
    if (!token) {
        res.send('please login first')
    }
    const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET); 
    req.user = decoded
    next();


}

const genarateToken = (userInfo) => {
    const payload = {
        phoneNumber: userInfo.phoneNumber,
        userRoll: userInfo.userRoll
    }
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '2d' });
}

async function run() {
    try {

        app.post('/user', async (req, res) => {
            const userInfo = req.body;
            const phoneNumber = userInfo.phoneNumber;          
            const password = userInfo.password;
            const query = {
                phoneNumber: phoneNumber,
                password,
            }
            const users = await userCollection.find(query).toArray()
            const exits = users.filter(user => user.phoneNumber === phoneNumber)
            console.log(exits);
            if (exits.length) {
                return res.send({ message: "phone number alredy used" })
            }
            const result = await userCollection.insertOne(userInfo)
            res.send(result);
        })
        app.get('/product/:men',async(req,res)=>{
            const men=req.params.men;
            const query={
                category_name:men
            }
            const result = await productsCollection.find(query).toArray()
            console.log(result);
            res.send(result);
        })
        app.get('/product/:women',async(req,res)=>{
            const women=req.params.women;
            const query={
                category_name:women
            }
            const result = await productsCollection.find(query).toArray()
            res.send(result);
        })
        app.get('/product/:kids',async(req,res)=>{
            const kids=req.params.kids;
            const query={
                category_name:kids
            }
            const result = await productsCollection.find(query).toArray()
            res.send(result);
        })
        app.post('/login', async (req, res) => {
            const users = req.body
            console.log(users);
            const password = users.password
            const phoneNumber = users.phoneNumber
            const query = {
                phoneNumber: phoneNumber,
                password: password
            }
            console.log(password, phoneNumber)
            const userInfo = await userCollection.findOne(query)
            if (!userInfo) {
                return res.send({ message: "please check your email and passwod" })
            }
            const token = genarateToken(userInfo)
            const data = {
                user: userInfo,
                token,
            }
            res.send(data);
        })


        app.post('/aboutme', verifyToken, async (req, res) => {
            const user = req.user
            const phoneNumber = user?.phoneNumber
            const query = {
                phoneNumber: phoneNumber
            }
            const result = await userCollection.findOne(query)
            res.send(result);
        })
        app.get('/products', async (req, res) => {
            const query = {}
            const products = await productsCollection.find(query).toArray()
            res.send(products)
        })
        app.get('/productdetails/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        app.get('/cards', async (req, res) => {
            const query = {}
            const result = await addToCardCollection.find(query).toArray()
            res.send(result)
        })
        app.post("/addtocard", async (req, res) => {
            const card = req.body
            const phoneNumber=card.phoneNumber
            const find = card.cartId
            const query = {
                cartId: find,
                phoneNumber:phoneNumber
            }
            const oldData = await addToCardCollection.findOne(query)

            if (!oldData) {
                const result = await addToCardCollection.insertOne(card)
                return res.send(result);
            }
            const quantity = parseInt(oldData.quantity) + parseInt(card.quantity)
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: quantity
                }
            }
            const myCard = await addToCardCollection.updateOne(query, updateDoc, options)           
            return res.send(myCard)
        }) 


           

            app.get('/myaddtocard/:phoneNumber', async (req, res) => {
                const phoneNumber = req.params.phoneNumber
                const query = {
                    phoneNumber: phoneNumber
                }
                const result = await addToCardCollection.find(query).toArray()               
                res.send(result)

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