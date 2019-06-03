const path = require('path') // Node.js path module
const http = require('http') // Node.js http module
const express = require('express') // Express.js framework
const hbs = require('hbs') // Handlebars view engine
const socketio = require('socket.io') // Socket.io Websockets module
const Filter = require('bad-words') // Check for fowl language module

const { addUser, removeUser, getUser, getAllUsers } = require('./utils/user') // users file
const { generateTextMessage, generateLocationMessage } = require('./utils/messages') // messages file

// Create a new server instance
const app = express()
// Explicitly telling express to create the server using the above instance
const server = http.createServer(app)
// Creating a new socket instance
const io = socketio(server)
// Port based on dev or production
const port = process.env.PORT

// Setting the view engine. (Handlebars)
app.set('view engine', 'hbs')
// Notifying express where to look for static files (css, images, js)
app.use(express.static(path.join(__dirname, '../public')))

// On new connection (client requests server) log this message
io.on('connection', (socket) => {
  // Difference between io.emit and socket.emit is as follows
  // Socket is like a single connection (Browser)
  // Io is like the entire group of connections (All people who connected to the server)
  // So inorder to broadcast anything, we have to use io.emit()
  socket.on('join', ({ username, room }, callback) => {
    // Add user method either sends back error object or user object
    const response = addUser({ id: socket.id, username, room })
    if (response.error) return callback(response.error)
    // .join() allows the user to join a specific room
    socket.join(response.room)
    io.to(response.room).emit('roomData', { room: response.room, users: getAllUsers(response.room) })
    socket.broadcast.to(response.room).emit('message', generateTextMessage(`${response.username} has joined the chat`, 'Admin'))
    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    // Getting user first
    const user = getUser(socket.id)
    if (user === undefined) return callback('No user to send message')
    // Socket.broadcast is like the hybrid of socket and io. It basically emits all the connections except the sender's
    const filter = new Filter()
    if (filter.isProfane(message)) return callback('Sorry. No fowl language')
    io.to(user.room).emit('message', generateTextMessage(message, user.username))
    callback()
  })
  
  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id)
    if (user === undefined) return callback('No user to send location')
    // Socket.broadcast is like the hybrid of socket and io. It basically emits all the connections except the sender's
    io.to(user.room).emit('location', generateLocationMessage(location, user.username))
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    // to() ensures to broadcast message only to that room's persons
    if (user) { 
      io.to(user.room).emit('message', generateTextMessage(`${user.username} has left the room`, 'Admin'))
      io.to(user.room).emit('roomData', { room: user.room, users: getAllUsers(user.room) })
    }
  })
})

// Make sure to use server.listen instead of app.listen for socket.io to take place effectively
server.listen(port, () => {
  console.log(`Server started on port ${port}`)
})