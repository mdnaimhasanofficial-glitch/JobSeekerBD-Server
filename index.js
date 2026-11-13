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
const users = database.collection('user');
const jobs = database.collection('jobs')
const applications = database.collection('applications')



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
  const search = req.query.search;
  const query = {};
  // console.log(req.query);
  if(req.query){
    if(req.query.jobType){
      query.jobType = req.query.jobType;
    }
    if(req.query.isRemote){
      query.isRemote = req.query.isRemote === 'true'
    }
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { responsibilities: { $regex: search, $options: 'i' } },
      { qualifications: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  const result = await jobs.find(query).toArray();

  res.send(result);
});

app.post('/application', async (req, res) => {
  try {
    const application = req.body;
    const result = await applications.insertOne(application);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Application submission failed" });
  }
});

app.get('/jobs/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await jobs.findOne(query)
  res.send(result)

})

app.delete('/jobs/:id', async(req, res)=>{
  const id  = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await jobs.deleteOne(query)
  res.send(result)
})

app.patch('/jobs/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const updatedDoc = {
    $set: req.body
  }
  const result = await jobs.updateOne(query, updatedDoc)
  res.send(result)
})

app.get('/', (req, res)=>{
    res.send(`JobSeekerBD Server is Running on ${port}`)
})

app.listen(port, ()=>{
    console.log(`JobSeeker Server is running on ${port}`);
})