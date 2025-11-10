import { useEffect, useState } from 'react'
import { useReportStore } from '../store/useReportStore'
import type { Report } from '../types'

export function AdminPanel() {
  const { reports, loading, fetchReports, updateReportStatus, deleteReport } = useReportStore()
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const categoryLabels: Record<Report['category'], string> = {
    vial: 'Vial',
    alumbrado: 'Alumbrado',
    basura: 'Basura',
    mobiliario: 'Mobiliario',
    otro: 'Otro'
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

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter)

  const pendingCount = reports.filter(r => r.status === 'pending').length
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length
  const resolvedCount = reports.filter(r => r.status === 'resolved').length

  const handleStatusChange = async (reportId: string, newStatus: Report['status']) => {
    try {
      await updateReportStatus(reportId, newStatus)
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus })
      }
      alert('✅ Estado actualizado correctamente')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('❌ Error al actualizar el estado')
    }
  }

  const handleDelete = async () => {
    if (!selectedReport) return
    
    try {
      await deleteReport(selectedReport.id)
      setSelectedReport(null)
      setShowDeleteConfirm(false)
      alert('✅ Reporte eliminado correctamente')
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('❌ Error al eliminar el reporte')
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #7c3aed',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(to right, #7c3aed, #a855f7)',
        color: 'white',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Panel Administrativo</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#e9d5ff', margin: '0 0 16px 0' }}>
          Gestiona todos los reportes ciudadanos
        </p>

        {/* Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px', textAlign: 'center' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{pendingCount}</p>
            <p style={{ color: '#e9d5ff', margin: 0 }}>Pendientes</p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{inProgressCount}</p>
            <p style={{ color: '#e9d5ff', margin: 0 }}>En Progreso</p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 4px 0' }}>{resolvedCount}</p>
            <p style={{ color: '#e9d5ff', margin: 0 }}>Resueltos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: filter === 'all' ? '#7c3aed' : '#f3f4f6',
              color: filter === 'all' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            Todos ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: filter === 'pending' ? '#f59e0b' : '#f3f4f6',
              color: filter === 'pending' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: filter === 'in_progress' ? '#3b82f6' : '#f3f4f6',
              color: filter === 'in_progress' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            En Progreso ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: filter === 'resolved' ? '#10b981' : '#f3f4f6',
              color: filter === 'resolved' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            Resueltos ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Lista de reportes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <p style={{ color: '#6b7280', fontWeight: '500', margin: 0 }}>No hay reportes en esta categoría</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredReports.map((report) => (
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

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{
                        fontWeight: 'bold',
                        color: '#111827',
                        textTransform: 'capitalize',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {categoryIcons[report.category]} {categoryLabels[report.category]}
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
                      <span>📍 {new Date(report.created_at).toLocaleDateString('es-GT')}</span>
                      {report.validations_count > 0 && (
                        <span style={{ color: '#2563eb', fontWeight: '500' }}>
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

      {/* Modal de gestión */}
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
          onClick={() => {
            setSelectedReport(null)
            setShowDeleteConfirm(false)
          }}
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
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize', margin: 0 }}>
                      {categoryLabels[selectedReport.category]}
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
                  onClick={() => {
                    setSelectedReport(null)
                    setShowDeleteConfirm(false)
                  }}
                  style={{
                    fontSize: '24px',
                    color: '#9ca3af',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Estado actual */}
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
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    marginBottom: '16px'
                  }}
                />
              )}

              {/* Descripción */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', margin: '0 0 8px 0', color: '#111827' }}>
                  Descripción
                </h4>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {selectedReport.description}
                </p>
              </div>

              {/* Ubicación */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', margin: '0 0 8px 0', color: '#111827' }}>
                  Ubicación
                </h4>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>
                  📍 Lat: {selectedReport.latitude.toFixed(6)}, Lng: {selectedReport.longitude.toFixed(6)}
                </p>
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
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🗺️ Ver en Google Maps
                </button>
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

              {/* Cambiar estado */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', margin: '0 0 8px 0', color: '#111827' }}>
                  Cambiar Estado
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'pending')}
                    disabled={selectedReport.status === 'pending'}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: selectedReport.status === 'pending' ? 'not-allowed' : 'pointer',
                      background: selectedReport.status === 'pending' ? '#f59e0b' : '#fef3c7',
                      color: selectedReport.status === 'pending' ? 'white' : '#92400e',
                      fontWeight: '500',
                      fontSize: '13px',
                      opacity: selectedReport.status === 'pending' ? 0.7 : 1
                    }}
                  >
                    ⏳ Pendiente
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'in_progress')}
                    disabled={selectedReport.status === 'in_progress'}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: selectedReport.status === 'in_progress' ? 'not-allowed' : 'pointer',
                      background: selectedReport.status === 'in_progress' ? '#3b82f6' : '#dbeafe',
                      color: selectedReport.status === 'in_progress' ? 'white' : '#1e40af',
                      fontWeight: '500',
                      fontSize: '13px',
                      opacity: selectedReport.status === 'in_progress' ? 0.7 : 1
                    }}
                  >
                    🔨 En Progreso
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, 'resolved')}
                    disabled={selectedReport.status === 'resolved'}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: selectedReport.status === 'resolved' ? 'not-allowed' : 'pointer',
                      background: selectedReport.status === 'resolved' ? '#10b981' : '#d1fae5',
                      color: selectedReport.status === 'resolved' ? 'white' : '#065f46',
                      fontWeight: '500',
                      fontSize: '13px',
                      opacity: selectedReport.status === 'resolved' ? 0.7 : 1
                    }}
                  >
                    ✅ Resuelto
                  </button>
                </div>
              </div>

              {/* Eliminar reporte */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Eliminar Reporte
                </button>
              ) : (
                <div style={{
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <p style={{ color: '#991b1b', fontWeight: '600', marginBottom: '12px', margin: '0 0 12px 0' }}>
                    ⚠️ ¿Estás seguro de eliminar este reporte?
                  </p>
                  <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', margin: '0 0 12px 0' }}>
                    Esta acción no se puede deshacer.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        background: 'white',
                        color: '#374151',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        background: '#dc2626',
                        color: 'white',
                        fontWeight: '500',
                        fontSize: '13px'
                      }}
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}