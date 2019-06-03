const users = []
// 1. Add a new user
const addUser = ({ id, username, room }) => {
  // Checking if empty values are sent
  if (!username || !room) return { error: 'Username and room is required' }

  // trimming and lower casing both username and room
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Find if existing user exists in the same room
  const existingUser = users.find(user => user.username === username && user.room === room)
  if (existingUser) return { error: 'Username already exists' }

  // Return the user after pushing to the array
  users.push({ id, username, room })
  return { id, username, room }
}

// 2. Remove an existing user by id
const removeUser = id => {
  if (!id) return { error: 'id is required' }
  const userIndex = users.findIndex(user => user.id === id)
  if (userIndex !== -1) return users.splice(userIndex, 1)[0]
}

// 3. Get user by id
const getUser = id => {
  if (!id) return { error: 'id is required' }
  const userIndex = users.findIndex(user => user.id === id)
  if (userIndex === -1) return undefined
  return users[userIndex]
}

// 4. Get all users in a specific room
const getAllUsers = room => {
  room = room.trim().toLowerCase()
  if (!room) return { error: 'Room must be specified' }
  return users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getAllUsers }
