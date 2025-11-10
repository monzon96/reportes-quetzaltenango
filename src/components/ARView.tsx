import { useEffect, useRef, useState } from 'react'
import { useReportStore } from '../store/useReportStore'
import type { Report } from '../types'

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function ARView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [error, setError] = useState<string>('')
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [deviceOrientation, setDeviceOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null)
  const { reports, fetchReports } = useReportStore()

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const addDebug = (msg: string) => {
    console.log('AR:', msg)
  }

  useEffect(() => {
    if (!permissionsGranted) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        setDeviceOrientation({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        })
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [permissionsGranted])

  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      console.log('Asignando stream a video')
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => {
        console.error('Error en play:', e)
      })
    }
  }, [stream, permissionsGranted])

  const requestPermissions = async () => {
    setRequesting(true)
    setError('')
    addDebug('Iniciando...')

    try {
      addDebug('Solicitando ubicación...')
      
      const position: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        })
      })
      
      setUserLocation(position.coords)
      addDebug(`✓ Ubicación: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)

      addDebug('Solicitando cámara...')

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      
      addDebug(`✓ Stream obtenido (${mediaStream.getVideoTracks().length} tracks)`)
      
      setPermissionsGranted(true)
      setStream(mediaStream)
      
      addDebug('Solicitando orientación...')
      
      setTimeout(() => {
        if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
          const DeviceOrientationEvt = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
          if (typeof DeviceOrientationEvt.requestPermission === 'function') {
            DeviceOrientationEvt.requestPermission()
              .then((response) => {
                if (response === 'granted') {
                  addDebug('✓ Orientación concedida')
                } else {
                  addDebug('⚠️ Orientación denegada')
                }
              })
              .catch((err: Error) => {
                addDebug('✗ Error orientación: ' + err.message)
              })
          }
        }
      }, 500)
      
      addDebug('✓✓✓ TODO EXITOSO')
      setRequesting(false)
      
    } catch (err) {
      console.error('Error:', err)
      setRequesting(false)
      
      let errorMsg = '❌ '
      
      if (err instanceof GeolocationPositionError) {
        errorMsg += err.code === 1 ? 'Permiso denegado' : 'Error ubicación'
      } else if (err instanceof DOMException) {
        errorMsg += err.name === 'NotAllowedError' ? 'Permiso cámara denegado' : err.name
      } else if (err instanceof Error) {
        errorMsg += err.message
      } else {
        errorMsg += 'Error desconocido'
      }
      
      setError(errorMsg)
      addDebug('ERROR: ' + errorMsg)
    }
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    const θ = Math.atan2(y, x)
    
    return ((θ * 180) / Math.PI + 360) % 360
  }

  const nearbyReports = userLocation
    ? reports.filter((report) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          report.latitude,
          report.longitude
        )
        return distance <= 500
      })
    : []

  const getReportPosition = (report: Report) => {
    if (!userLocation || !deviceOrientation) return null

    const bearing = calculateBearing(
      userLocation.latitude,
      userLocation.longitude,
      report.latitude,
      report.longitude
    )

    const deviceHeading = deviceOrientation.alpha
    const relativeBearing = (bearing - deviceHeading + 360) % 360

    const fov = 60
    const isVisible = relativeBearing < fov / 2 || relativeBearing > 360 - fov / 2

    if (!isVisible) return null

    let normalizedAngle = relativeBearing
    if (normalizedAngle > 180) normalizedAngle -= 360
    
    const screenX = (normalizedAngle / fov) * window.innerWidth + window.innerWidth / 2

    return {
      x: screenX,
      bearing: bearing,
      relativeBearing: relativeBearing
    }
  }

  const categoryIcons: Record<Report['category'], string> = {
    vial: '🚧',
    alumbrado: '💡',
    basura: '🗑️',
    mobiliario: '🪑',
    otro: '📋'
  }

  const categoryColors: Record<Report['category'], string> = {
    vial: '#ef4444',
    alumbrado: '#f59e0b',
    basura: '#10b981',
    mobiliario: '#3b82f6',
    otro: '#6b7280'
  }

  if (!permissionsGranted) {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', width: '100%', color: 'white' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>📸</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Vista AR</h2>
          <p style={{ fontSize: '14px', marginBottom: '32px', opacity: 0.9 }}>
            Mueve tu cámara para ver reportes cercanos
          </p>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={requestPermissions}
            disabled={requesting}
            style={{
              background: 'white',
              color: '#667eea',
              padding: '16px 32px',
              borderRadius: '9999px',
              fontWeight: 'bold',
              fontSize: '18px',
              border: 'none',
              cursor: requesting ? 'not-allowed' : 'pointer',
              opacity: requesting ? 0.5 : 1,
              marginBottom: '24px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
          >
            {requesting ? '⏳ Activando...' : '🎯 Activar AR'}
          </button>

          <div style={{ marginTop: '24px', fontSize: '12px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Permisos necesarios:</p>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'left'
            }}>
              <p>📍 Ubicación</p>
              <p>📷 Cámara</p>
              <p>🧭 Orientación</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', background: 'black', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000',
          zIndex: 1
        }}
      />

      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 10 }}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '16px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '500' }}>📍 Ubicación</p>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                {userLocation?.latitude.toFixed(5)}, {userLocation?.longitude.toFixed(5)}
              </p>
              {deviceOrientation && (
                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                  🧭 {Math.round(deviceOrientation.alpha)}°
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', fontWeight: '500' }}>🎯 Reportes</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{nearbyReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {!deviceOrientation && (
        <button
          onClick={() => {
            if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
              const DeviceOrientationEvt = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
              if (typeof DeviceOrientationEvt.requestPermission === 'function') {
                DeviceOrientationEvt.requestPermission()
                  .then((response) => {
                    console.log('Orientación:', response)
                    if (response !== 'granted') {
                      alert('Permiso de orientación denegado')
                    }
                  })
                  .catch((err: Error) => {
                    alert('Error: ' + err.message)
                  })
              }
            }
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            background: '#f59e0b',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            cursor: 'pointer'
          }}
        >
          🧭 Activar Brújula
        </button>
      )}

      {nearbyReports.map((report) => {
        if (!userLocation) return null
        
        const position = getReportPosition(report)
        if (!position) return null

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          report.latitude,
          report.longitude
        )

        return (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report)}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'left 0.1s ease-out'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                background: categoryColors[report.category],
                boxShadow: `0 0 30px ${categoryColors[report.category]}`
              }}>
                {categoryIcons[report.category]}
              </div>
              
              {report.validations_count > 0 && (
                <div style={{
                  marginTop: '4px',
                  background: '#2563eb',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  ✓ {report.validations_count}
                </div>
              )}
              
              <div style={{
                marginTop: '8px',
                background: 'rgba(0,0,0,0.8)',
                padding: '4px 12px',
                borderRadius: '9999px',
                color: 'white',
                fontSize: '12px'
              }}>
                {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`}
              </div>
            </div>
          </button>
        )
      })}

      {!deviceOrientation && (
        <div style={{ position: 'absolute', bottom: '96px', left: '16px', right: '16px', zIndex: 10 }}>
          <div style={{
            background: 'rgba(251, 191, 36, 0.9)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#78350f', fontWeight: 'bold', fontSize: '14px' }}>
              🧭 Toca el botón para activar la brújula
            </p>
          </div>
        </div>
      )}

      {selectedReport && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '16px',
          zIndex: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {categoryIcons[selectedReport.category]}
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'capitalize' }}>
              {selectedReport.category}
            </h3>
            
            {selectedReport.image_url && (
              <img 
                src={selectedReport.image_url} 
                alt="Reporte" 
                style={{
                  width: '100%',
                  height: '192px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '12px'
                }}
              />
            )}
            
            <p style={{ color: '#374151', fontSize: '14px', marginBottom: '16px' }}>
              {selectedReport.description}
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedReport.latitude},${selectedReport.longitude}`,
                    '_blank'
                  )
                }}
                style={{
                  flex: 1,
                  background: '#2563eb',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                📍 Ir
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  flex: 1,
                  background: '#e5e7eb',
                  color: '#1f2937',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}