const socket = io()
const chatForm = document.querySelector('.chat__form')
const inputEl = document.querySelector('input[type="text"]')
const locationBtn = document.querySelector('#location')
const messagesContainer = document.querySelector('.messages__container')
const sidebar = document.querySelector('#sidebar')

// Parse Query strings
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Sending message
chatForm.addEventListener('submit', (event) => {
  event.preventDefault()
  locationBtn.setAttribute('disabled', 'disabled')
  socket.emit('sendMessage', inputEl.value, messageError => {
    locationBtn.removeAttribute('disabled')
    inputEl.value = ''
    inputEl.focus()
    if (messageError) return alert(messageError)
  })
})

// Sending location
locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Your browser doesn\'t support geolocation')
  }
  locationBtn.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition(position => {
    let { latitude, longitude } = position.coords
    socket.emit('sendLocation', { latitude, longitude }, error => {
      locationBtn.removeAttribute('disabled')
      if (error) alert(error)
      console.log('Location shared !')
    })
  })
})

// Socket listening for message emit command
socket.on('message', ({ text, createdAt, username }) => {
  const markup = `
    <div class="message">
      <p>
        <span class="message__name">${username}</span>
        <span class="message__meta">${moment(createdAt).format('h:mm a')}</span>
      </p>
      <p>${text}</p>
    </div>
  `
  messagesContainer.insertAdjacentHTML('beforeend', markup)
})

// Socket listening for location emit command
socket.on('location', ({ location, createdAt, username }) => {
  const { latitude, longitude } = location
  const markup = `
    <div class="message">
      <p>
        <span class="message__name">${username}</span>
        <span class="message__meta">${moment(createdAt).format('h:mm a')}</span>
      </p>
      <p><a target="_blank" href="https://google.com/maps?q=${latitude},${longitude}">Location details</a></p>
    </div>
  `
  messagesContainer.insertAdjacentHTML('afterbegin', markup)
})

// Socket listening for room Data
socket.on('roomData', ({room, users}) => {
  sidebar.innerHTML = ''
  const markup = `
    <h2 class="room-title">${room}</h2>
    <h3 class="list-title">Users</h3>
    <ul class="users">${generateUsersMarkup(users)}</ul>
  `
  sidebar.insertAdjacentHTML('afterbegin', markup)
})

socket.emit('join', { username, room }, cbData => {
  if (cbData) { alert(cbData); location.href = '/' }
})

const generateUsersMarkup = users => {
  let markup = ``
  users.forEach(user => markup += `<li>${user.username}</li>`)
  return markup
}
