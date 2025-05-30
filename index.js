const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = 3000
app.use(express.json());

app.use(cors());


// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.opkciwj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    client.connect();

    const CampusConnectDB = client.db("CampusConnectDB");
    const collegeCollection = CampusConnectDB.collection("colleges")
    const admissionCollection = CampusConnectDB.collection("admissions")
    const reviewCollection = CampusConnectDB.collection("reviews")
    const userCollection = CampusConnectDB.collection("users")



    app.get('/colleges', async (req, res) => {
      const colleges = await collegeCollection.find().toArray()

      res.json(colleges)
    })

    app.get('/colleges/:id', async (req, res) => {
      const id = req?.params?.id
      const college = await collegeCollection.findOne({ _id: new ObjectId(id) })

      res.json(college)
    })


    app.post("/admission", async (req, res) => {
      const data = req.body

      const email = data?.email

      const existingAdmission = await admissionCollection.findOne({ email })

      if (existingAdmission) {
        return res.json({ existing: true, acknowledged: true })
      }

      const result = await admissionCollection.insertOne(data)

      res.json(result)
    })


    app.get('/my-college/:email', async (req, res) => {
      const email = req.params.email

      const admission = await admissionCollection.findOne({ email })

      if (!admission?._id) {
        return res.json({})
      }

      const collegeId = await admission?.collegeId

      const myCollege = await collegeCollection.findOne({ _id: new ObjectId(collegeId) })


      const result = {
        ...myCollege,
        candidateName: admission?.fullName,
        candidateImage: admission?.image
      }

      res.json(result)
    })


    app.post('/review', async (req, res) => {
      const data = req.body
      const existingReview = await reviewCollection.findOne({ email: data?.email, collegeId: data?.collegeId })


      if (existingReview) {
        return res.json({ existing: true, acknowledged: true })
      }

      const result = await reviewCollection.insertOne(data)
      res.json(result)
    })


    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection?.find().toArray()

      res.json(result)
    })


    app.post('/user', async (req, res) => {
      const data = req.body

      const existingUser = await userCollection.findOne({ email: data?.email })

      if (existingUser) {
        return res.json({ existing: true, acknowledged: true })
      }

      const result = await userCollection.insertOne(data)
      res.json(result)
    })

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email

      const result = await userCollection.findOne({ email })
      res.json(result)
    })


    app.patch('/user/:email', async (req, res) => {
      const email = req.params.email
      const data = req.body

      const existingUser = await userCollection.findOne({ email })

      if (!existingUser) {
        return res.json({ existing: false })
      }

      const result = await userCollection.updateOne({ email }, {
        $set: data
      })

      res.json(result)

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