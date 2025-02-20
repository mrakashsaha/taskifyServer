const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middlewires
app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASSWORD}@cluster0.4qal0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const usersCollection = client.db("taskifyDB").collection("users");
        const taskCollection = client.db("taskifyDB").collection("task");


        // Get a User Information
        app.get("/user", async (req, res) => {
            const query = { email: req?.query?.email };
            const result = await usersCollection.findOne(query);
            res.send(result);
        })


        // Insert New User only into DataBase
        app.put("/users", async (req, res) => {
            
            const filter = { email: req?.body?.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    uid: req?.body?.uid,
                    displayName: req?.body?.displayName,
                    email: req?.body?.email,
                    photoURL: req?.body?.photoURL,
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })



        // -----------------Task Related Work------------------
        // Post a Task by User
        app.post("/task", async (req, res)=> {
            const result = await taskCollection.insertOne(req?.body);
            res.send(result);
        })


        // Get all task of a specific user

        app.get("/task", async (req, res)=> {
            const query = {createdBy: req?.query?.email, category: req?.query?.category}
            const option = {
                sort: {date: -1}
            }
            const result = await taskCollection.find(query, option).toArray();
            res.send(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Taskify is on operation");
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})