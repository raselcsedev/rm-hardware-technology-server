const express = require('express');
const cors = require('cors');
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('RM HardWare Technology!')
})

app.listen(port, () => {
  console.log(`RM HardWare Technology app listening on port ${port}`)
})