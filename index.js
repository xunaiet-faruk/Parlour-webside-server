const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ot66xwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        const ShopCollection = client.db("ParlourDb").collection("Shop");
        const ShopingCollection = client.db("ParlourDb").collection("Shoping");
        const ServicesCollection = client.db("ParlourDb").collection("Services");

        app.get('/Shop', async (req, res) => {
            const result = await ShopCollection.find().toArray();
            res.send(result);
        });

        app.post('/Shoping', async (req, res) => {
            const Carditem = req.body;
            const result = await ShopingCollection.insertOne(Carditem);
            res.send(result);
        });

        app.get('/Shoping', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await ShopingCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/Shoping/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ShopingCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/Services', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await ServicesCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/Services', async (req, res) => {
            const ServicesItem = req.body;
            const result = await ServicesCollection.insertOne(ServicesItem);
            res.send(result);
        });

        app.patch('/Services/:id', async (req, res) => {
            const id = req.params.id;
            const { status } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: 'Invalid service ID' });
            }

            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status
                }
            };
            const result = await ServicesCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Parlour website running now");
});

app.listen(port, () => {
    console.log(`Parlour sitting on port ${port}`);
});
