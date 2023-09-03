const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware')
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config()

connectDB();

const port = process.env.PORT || 5000;

const app = express();


app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({ 
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
    console.log("Server running at port ", port)
});

const io = require('socket.io')(server, {
  pingTimeOut: 60000,           // It will wait 60 seconds before it goes off
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on('setup', (userData) => {
    socket.join(userData._id); //  `socket.join(userData._id);` is a method in Socket.IO that allows a socket (client) to join a specific room. In this case, the room name is set to `userData._id`, which is typically a unique identifier for a user.
    // console.log(userData._id)
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {      // pass chatId from client as room
    socket.join(room);
    console.log("user joined room " + room);
  });

  socket.on('typing', (room) => {
    socket.in(room).emit("typing")
  });

  socket.on('stop typing', (room) => {
    socket.in(room).emit("stop typing")
  });

  socket.on('new message', (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if(!chat.users) return console.log('chat.users not defined');   // test

    chat.users.forEach(user => {
      if(user._id == newMessageReceived.sender._id) return;
      
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
})