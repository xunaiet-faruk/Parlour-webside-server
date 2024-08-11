const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.DB_SECREACTKEY)
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
        const ReviewCollection = client.db("ParlourDb").collection("Review");
        const AddserviceCollection = client.db("ParlourDb").collection("Addservice");
        const ServiceItemCollection = client.db("ParlourDb").collection("ServiceItem");
        

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
            try {
                const result = await ServicesCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching services:", error);
                res.status(500).send({ message: "An error occurred while fetching services." });
            }
        });



        app.get('/AllServices',async(req,res)=>{
            const result=await ServicesCollection.find().toArray();
            res.send(result)
        })



        app.post('/Services', async (req, res) => {
            const handleData = { ...req.body, _id: uuidv4() };
            try {
                const result = await ServicesCollection.insertOne(handleData);
                res.send(result);
            } catch (error) {
                console.error('Error inserting service:', error);
                res.status(500).send({ message: 'An error occurred while booking the service.' });
            }
        });


        app.patch('/Services/:id', async (req, res) => {
            const serviceId = req.params.id;
            const { status } = req.body;

            try {
                // Validate ObjectId format
                if (!isValidObjectId(serviceId)) {
                    return res.status(400).json({ error: 'Invalid service ID format' });
                }

                const filter = { _id: ObjectId(serviceId) }; // Use ObjectId constructor
                const updateDoc = {
                    $set: {
                        status: status
                    }
                };

                const result = await ServicesCollection.updateOne(filter, updateDoc);
                if (result.modifiedCount === 1) {
                    res.status(200).json({ message: 'Service status updated successfully' });
                } else {
                    res.status(404).json({ message: 'Service not found' });
                }
            } catch (error) {
                console.error('Error updating service status:', error);
                res.status(500).json({ message: 'An error occurred while updating service status' });
            }
        });

        function isValidObjectId(id) {
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            return objectIdRegex.test(id);
        }

        function isValidObjectId(id) {
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            return objectIdRegex.test(id);
        }


        app.post('/Review',async(req,res)=>{
            const bodyData =req.body;
            const result =await ReviewCollection.insertOne(bodyData);
            res.send(result)

        })

        app.get('/Review',async(req,res)=>{
            const result =await ReviewCollection.find().toArray();
            res.send(result)
        })

        app.post('/ServiceItem',async(req,res)=>{
            const Additem =req.body;
            const result = await ServiceItemCollection.insertOne(Additem);
            res.send(result)
        })

        app.get('/ServiceItem',async(req,res)=>{ 
            const result = await ServiceItemCollection.find().toArray();
            res.send(result)
        })


        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = Math.max(parseInt(price * 100), 50);
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: 'usd',
                    payment_method_types: ["card"]
                });
                res.send({
                    clientSecret: paymentIntent.client_secret
                });
            } catch (error) {
                console.error("Error creating payment intent:", error);
                res.status(500).send({ message: 'Failed to create payment intent.' });
            }
        });

   



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
