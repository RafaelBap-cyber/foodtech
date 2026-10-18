import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function Mapa({ ongs = [] }) {
  const centro = [-22.9056, -47.0608]

  return (
    <MapContainer
      center={centro}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {ongs
        .filter(
          (ong) =>
            Number.isFinite(Number(ong.latitude)) &&
            Number.isFinite(Number(ong.longitude)) &&
            ong.latitude !== null &&
            ong.longitude !== null
        )
        .map((ong) => (
          <Marker
            key={ong.id}
            position={[Number(ong.latitude), Number(ong.longitude)]}
          >
            <Popup>{ong.nome}</Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}

export default Mapa

/* para colocar as ONGs disponiveis*/