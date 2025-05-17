const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = 3000
app.use(cors());


// MongoDB connection
const uri = process.env.MONGODB_URI;
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
    await client.connect();

    const CampusConnectDB = client.db("CampusConnectDB");
    const collegeCollection = CampusConnectDB.collection("colleges")
    const admissionCollection = CampusConnectDB.collection("admissions")



    app.get('/colleges', async (req, res) => {
      const colleges = await collegeCollection.find().toArray()

      return res.json(colleges)
    })

    app.get('/colleges/:id', async (req, res) => {
      const id = req?.params?.id
      const college = await collegeCollection.findOne({ _id: new ObjectId(id) })

      return res.json(college)
    })


    app.post("/admission", async (req, res) => {
      const data = req.body
      console.log(data);
    })





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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})