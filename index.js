const express=require('express');
const app =express();
const port=process.env.PORT || 5000;
const cors=require('cors');
require('dotenv').config()

//midleware 
app.use(cors());
app.use(express.json())


async function run(){
    try{

    }finally{

    }

}run().catch(error=>console.error(error));

app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})