const generateTextMessage = (text, username) => ({ username, text, createdAt: Date.now() })
const generateLocationMessage = (location, username) => ({ username, location, createdAt: Date.now() })
module.exports = { generateTextMessage, generateLocationMessage }