import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useReportStore } from '../store/useReportStore'
import type { Report } from '../types'
import L from 'leaflet'

// Importar CSS de Leaflet
import 'leaflet/dist/leaflet.css'

// Fix para iconos de Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
const categoryColors: Record<Report['category'], string> = {
  vial: '#ef4444',
  alumbrado: '#f59e0b',
  basura: '#10b981',
  mobiliario: '#3b82f6',
  otro: '#6b7280'
}

const statusLabels: Record<Report['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  resolved: 'Resuelto'
}

export function MapView() {
  const { reports, fetchReports } = useReportStore()

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const quetzaltenangoCenter: [number, number] = [14.8334, -91.5181]

  return (
    <div className="h-full w-full">
      <MapContainer
        center={quetzaltenangoCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((report: Report) => {
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${categoryColors[report.category]};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
              ">
                ${report.validations_count}
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })

          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={icon}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg capitalize">
                      {report.category.replace('_', ' ')}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        report.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : report.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {statusLabels[report.status]}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {report.description}
                  </p>

                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt="Reporte"
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>✓ {report.validations_count} validaciones</span>
                    <span>•</span>
                    <span>
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}