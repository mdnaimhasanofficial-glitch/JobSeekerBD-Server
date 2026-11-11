import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';


const app = express();
const port = process.env.PORT || 5000;

//!Middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const connectedClient = await connectToMongoDB();
const database = connectedClient.db('JobSeekerBD');
const users= database.collection('user');
const jobs = database.collection('jobs')



app.get('/users', async(req, res)=>{
  const user1 =await users.find({}).toArray();
  res.send(user1)
})

app.post('/jobs', async (req, res) => {
  try {
    const job = req.body;
    const result = await jobs.insertOne(job);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Data insertion failed" });
  }
});
app.get('/jobs', async(req, res)=>{
  const job = await jobs.find({}).toArray();
  res.send(job)
})

app.delete('/jobs/:id', async(req, res)=>{
  const id  = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await jobs.deleteOne(query)
  res.send(result)
})

app.get('/', (req, res)=>{
    res.send(`JobSeekerBD Server is Running on ${port}`)
})

app.listen(port, ()=>{
    console.log(`JobSeeker Server is running on ${port}`);
})