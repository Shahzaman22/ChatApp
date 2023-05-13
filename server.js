const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const port = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
});

const Message = mongoose.model('Message', messageSchema);

const dbUrl = 'mongodb://127.0.0.1:27017/simpleChatApp';

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({});
    res.send(messages);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

app.get('/messages/:user', async (req, res) => {
  try {
    const user = req.params.user;
    const messages = await Message.find({ name: user });
    res.send(messages);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

app.post('/messages', async (req, res) => {
  try {
    var message = new Message(req.body);
    var savedMessage = await message.save()
    console.log('saved');
    res.json(savedMessage )
    var censored = await Message.findOne({message:'badword'});
    if(censored) {
      await Message.remove({_id: censored.id})
    } else {
      io.emit('message', req.body);
    }
    console.log('Message Posted');
  } catch (error) {
    console.log('error',error);
    res.sendStatus(500);
  }
});



io.on('connection', () => {
  console.log('a user is connected');
});


const server = http.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

// ...
mongoose.connect(dbUrl)
.then(() => console.log('DB is connected'))
.catch(() => console.log('DB Not connected'))
// ...

// Use this code to gracefully close the server when nodemon restarts the server
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});



