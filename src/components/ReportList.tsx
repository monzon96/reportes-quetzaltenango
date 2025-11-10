import { useEffect, useState } from 'react'
import { useReportStore } from '../store/useReportStore'
import type { Report } from '../types'

export function ReportList() {
  const { reports, loading, fetchReports, validateReport } = useReportStore()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const categoryIcons: Record<Report['category'], string> = {
    vial: '🚧',
    alumbrado: '💡',
    basura: '🗑️',
    mobiliario: '🪑',
    otro: '📋'
  }

  const statusColors = {
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    resolved: '#10b981'
  }

  const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    resolved: 'Resuelto'
  }

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || '#6b7280'
  }

  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando reportes...</p>
        </div>
      </div>
    )
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length
  const resolvedCount = reports.filter(r => r.status === 'resolved').length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      {/* Header con estadísticas */}
      <div style={{
        background: 'linear-gradient(to right, #2563eb, #4f46e5)',
        color: 'white',
        padding: '16px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', margin: '0 0 12px 0' }}>
          Reportes Ciudadanos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{pendingCount}</p>
            <p style={{ color: '#bfdbfe', margin: 0 }}>Pendientes</p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{inProgressCount}</p>
            <p style={{ color: '#bfdbfe', margin: 0 }}>En Progreso</p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{resolvedCount}</p>
            <p style={{ color: '#bfdbfe', margin: 0 }}>Resueltos</p>
          </div>
        </div>
      </div>

      {/* Lista de reportes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#6b7280', fontWeight: '500', margin: 0 }}>No hay reportes aún</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>Los reportes aparecerán aquí</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                style={{
                  width: '100%',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
              >
                <div style={{ display: 'flex', gap: '12px', padding: '12px' }}>
                  {/* Imagen miniatura */}
                  {report.image_url ? (
                    <img
                      src={report.image_url}
                      alt="Reporte"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '32px'
                    }}>
                      {categoryIcons[report.category]}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{
                        fontWeight: 'bold',
                        color: '#111827',
                        textTransform: 'capitalize',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {categoryIcons[report.category]} {report.category}
                      </h3>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '500',
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          flexShrink: 0,
                          backgroundColor: getStatusColor(report.status) + '33',
                          color: getStatusColor(report.status)
                        }}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    
                    <p style={{
                      color: '#6b7280',
                      fontSize: '12px',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.4',
                      margin: '0 0 8px 0'
                    }}>
                      {report.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#9ca3af' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {new Date(report.created_at).toLocaleDateString('es-GT')}
                      </span>
                      {report.validations_count > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: '500' }}>
                          ✓ {report.validations_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedReport && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 50
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="animate-slide-up"
            style={{
              background: 'white',
              borderRadius: '24px 24px 0 0',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '48px' }}>
                    {categoryIcons[selectedReport.category]}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      margin: 0
                    }}>
                      {selectedReport.category}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                      {new Date(selectedReport.created_at).toLocaleDateString('es-GT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  style={{
                    fontSize: '24px',
                    color: '#9ca3af',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  ✕
                </button>
              </div>

              {/* Estado */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  fontSize: '14px',
                  marginBottom: '16px',
                  backgroundColor: getStatusColor(selectedReport.status) + '33',
                  color: getStatusColor(selectedReport.status)
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(selectedReport.status)
                  }}
                ></span>
                {getStatusLabel(selectedReport.status)}
              </div>

              {/* Imagen */}
              {selectedReport.image_url && (
                <img
                  src={selectedReport.image_url}
                  alt="Reporte"
                  style={{
                    width: '100%',
                    height: '256px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    marginBottom: '16px'
                  }}
                />
              )}

              {/* Descripción */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  Descripción
                </h4>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {selectedReport.description}
                </p>
              </div>

              {/* Ubicación */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '8px', margin: '0 0 8px 0' }}>
                  Ubicación
                </h4>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  📍 {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                </p>
              </div>

              {/* Validaciones */}
              {selectedReport.validations_count > 0 && (
                <div style={{
                  background: '#eff6ff',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <p style={{ color: '#1e40af', fontWeight: '500', fontSize: '14px', margin: 0 }}>
                    ✓ {selectedReport.validations_count} {selectedReport.validations_count === 1 ? 'persona validó' : 'personas validaron'} este reporte
                  </p>
                </div>
              )}

              {/* Acciones */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedReport.latitude},${selectedReport.longitude}`,
                      '_blank'
                    )
                  }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                >
                  📍 Ver en Mapa
                </button>
                <button
                  onClick={async () => {
                    await validateReport(selectedReport.id)
                    setSelectedReport(null)
                  }}
                  disabled={selectedReport.status === 'resolved'}
                  style={{
                    background: selectedReport.status === 'resolved' ? '#d1d5db' : '#10b981',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: selectedReport.status === 'resolved' ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (selectedReport.status !== 'resolved') {
                      e.currentTarget.style.background = '#059669'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedReport.status !== 'resolved') {
                      e.currentTarget.style.background = '#10b981'
                    }
                  }}
                >
                  ✓ Validar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}