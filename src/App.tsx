import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { ref, onValue, set, update, push } from 'firebase/database'
import { db } from './firebase'
import FriendMarker from './FriendMarker'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './style.css'

const destinations = [
  { name: 'Sé da Guarda', lat: 40.538, lng: -7.27 },
  { name: 'Castelo de Ciudad Rodrigo', lat: 40.666, lng: -6.588 },
  { name: 'Plaza Mayor de Salamanca', lat: 40.965, lng: -5.664 }
]

const locationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const generateRoomId = () => Math.random().toString(36).substring(2, 7).toUpperCase()

function App() {
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [friends, setFriends] = useState<Record<string, any>>({})
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [lastSend, setLastSend] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [altitudeData, setAltitudeData] = useState<any[]>([])
  const [roomCreatedAt, setRoomCreatedAt] = useState<number | null>(null)

  useEffect(() => {
    if (!roomId) {
      console.log('ℹ️ Nenhum roomId definido, sem listeners.')
      return
    }

    console.log('🔍 Iniciando listeners para sala:', roomId)
    
    const roomRef = ref(db, `rooms/${roomId}/users`)
    const chatRef = ref(db, `rooms/${roomId}/chat`)

    const unsubFriends = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      console.log('📍 Dados de amigos recebidos:', data)
      if (data) setFriends(data)
      else setFriends({})
    }, (error) => {
      console.error('❌ Erro ao ler amigos:', error)
    })

    const unsubChat = onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      console.log('💬 Mensagens recebidas:', data)
      if (data) {
        const msgs = Object.values(data)
        setChatMessages(msgs as any[])
      }
    }, (error) => {
      console.error('❌ Erro ao ler chat:', error)
    })

    return () => {
      console.log('🛑 Removendo listeners da sala:', roomId)
      unsubFriends()
      unsubChat()
    }
  }, [roomId])

  const handleCreateRoom = async () => {
    const newId = generateRoomId()
    try {
      await set(ref(db, `rooms/${newId}`), { 
        createdAt: Date.now(),
        admin: userName || 'Admin'
      })
      setRoomId(newId)
      setRoomCreatedAt(Date.now())
      console.log('✅ Sala criada com sucesso:', newId)
    } catch (error) {
      console.error('❌ Erro ao criar sala:', error)
      alert('Erro ao criar sala. Verifica a consola.')
    }
  }

  const startSharing = () => {
    if (!userName || !roomId) {
      console.warn('⚠️ Faltam dados: userName ou roomId')
      return alert('Preenche o nome e ID!')
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        console.log('📍 GPS capturado:', { lat, lng })
        checkGeofencing(lat, lng)
        if (Date.now() - lastSend > 30000) {
          const userRef = ref(db, `rooms/${roomId}/users/${userName}`)
          update(userRef, {
            lat,
            lng,
            lastUpdate: Date.now(),
            altitude: position.coords.altitude || 0
          }).then(() => {
            console.log('✅ Posição enviada para Firebase:', { userName, lat, lng })
          }).catch(error => {
            console.error('❌ Erro ao enviar posição:', error)
          })
          setLastSend(Date.now())
          setAltitudeData(prev => [...prev.slice(-9), { time: new Date().toLocaleTimeString(), altitude: position.coords.altitude || 0 }])
        }
      },
      (error) => console.error('❌ Erro GPS:', error),
      locationOptions
    )
    setWatchId(id)
    setIsSharing(true)
    console.log('✅ Partilha de localização iniciada')
  }

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsSharing(false)
    }
  }

  const checkGeofencing = (lat: number, lng: number) => {
    destinations.forEach(dest => {
      const dist = haversine(lat, lng, dest.lat, dest.lng)
      if (dist < 1) {
        alert(`Estamos a chegar a ${dest.name}!`)
      }
    })
  }

  const sendChatMessage = (emoji: string) => {
    const chatRef = ref(db, `rooms/${roomId}/chat`)
    const newMessageRef = push(chatRef)
    set(newMessageRef, { text: `${userName}: ${emoji}`, timestamp: Date.now() })
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const calculateETA = (lat: number, lng: number): number => {
    const sal = destinations[2]
    return haversine(lat, lng, sal.lat, sal.lng)
  }

  const uptime = roomCreatedAt ? Math.floor((Date.now() - roomCreatedAt) / 1000 / 60) : 0

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <MapContainer center={[40.538, -7.27]} zoom={10} style={{ height: '70%', width: '100%' }}>
        <TileLayer
          url={isDarkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          attribution='© OpenStreetMap contributors'
        />
        {destinations.map(dest => (
          <Marker key={dest.name} position={[dest.lat, dest.lng]}>
            <Popup>{dest.name}</Popup>
          </Marker>
        ))}
        {Object.entries(friends).map(([name, data]: [string, any]) => (
          <FriendMarker
            key={name}
            name={name}
            coords={[data.lat, data.lng]}
            isDriving={Date.now() - data.lastUpdate < 60000}
          />
        ))}
      </MapContainer>
      <div style={{ height: '30%', padding: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={altitudeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="altitude" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="control-panel">
        <h2>Dashboard de Viagem</h2>
        <div className="input-group">
          <label>ID da Sala:</label>
          <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Ex: ABC12" />
        </div>
        {!roomId && (
          <button onClick={handleCreateRoom} className="btn-share">Criar Sala</button>
        )}
        {roomId && (
          <div>
            <div className="input-group">
              <label>Seu Nome:</label>
              <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Ex: Amigo1" />
            </div>
            <button onClick={isSharing ? stopSharing : startSharing} className={isSharing ? "btn-stop" : "btn-share"}>
              {isSharing ? 'Parar Compartilhar' : 'Começar Compartilhar'}
            </button>
            <button onClick={toggleDarkMode} className="btn-toggle">Modo Noite</button>
          </div>
        )}
        <div className="friends-list">
          <h3>Amigos Online ({Object.keys(friends).length})</h3>
          <ul>
            {Object.entries(friends).map(([name, data]: [string, any]) => (
              <li key={name}>
                <span className={`status-dot ${Date.now() - data.lastUpdate < 60000 ? 'status-online' : 'status-offline'}`}></span>
                {name} - ETA: {calculateETA(data.lat, data.lng).toFixed(1)} km
              </li>
            ))}
          </ul>
        </div>
        <div className="chat">
          <h3>Chat Rápido</h3>
          <div className="emoji-buttons">
            <button onClick={() => sendChatMessage('☕')}>☕ Café</button>
            <button onClick={() => sendChatMessage('⛽')}>⛽ Combustível</button>
            <button onClick={() => sendChatMessage('🚗')}>🚗 Trânsito</button>
            <button onClick={() => sendChatMessage('🏁')}>🏁 Chegamos</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => <p key={i}>{msg.text}</p>)}
          </div>
        </div>
      </div>
      <footer className="trip-footer">
        <div className="footer-section">
          <span className="status-badge">● Live</span>
          <p>Rota: Fundão → Salamanca</p>
        </div>
        <div className="footer-section tech-stack">
          <p>Build with React & Firebase</p>
          <a href="https://github.com/aldirpedro" target="_blank">GitHub</a>
        </div>
        <div className="footer-section">
          <p>{new Date().toLocaleDateString('pt-PT')} | Uptime: {uptime} min</p>
        </div>
      </footer>
    </div>
  )
}

export default App