import express from 'express';
const app = express();

// what are these for?
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World! this is the Money Management server' });
});

export default app;
