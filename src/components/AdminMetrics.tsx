import { useEffect, useState } from 'react'
import { useReportStore } from '../store/useReportStore'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Report } from '../types'

export function AdminMetrics() {
  const { reports, fetchReports } = useReportStore()
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('30days')

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Filtrar reportes por rango de tiempo
  const getFilteredReports = () => {
    if (timeRange === 'all') return reports

    const now = new Date()
    const startDate = timeRange === '7days' 
      ? subDays(now, 7) 
      : subDays(now, 30)

    return reports.filter(r => new Date(r.created_at) >= startDate)
  }

  const filteredReports = getFilteredReports()

  // Métricas generales
  const totalReports = filteredReports.length
  const pendingReports = filteredReports.filter(r => r.status === 'pending').length
  const inProgressReports = filteredReports.filter(r => r.status === 'in_progress').length
  const resolvedReports = filteredReports.filter(r => r.status === 'resolved').length
  const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0'
  const avgValidations = totalReports > 0 
    ? (filteredReports.reduce((sum, r) => sum + r.validations_count, 0) / totalReports).toFixed(1)
    : '0'

  // Datos para gráfico de barras - Reportes por categoría
  const categoryData = [
    { name: 'Vial', value: filteredReports.filter(r => r.category === 'vial').length, icon: '🚧' },
    { name: 'Alumbrado', value: filteredReports.filter(r => r.category === 'alumbrado').length, icon: '💡' },
    { name: 'Basura', value: filteredReports.filter(r => r.category === 'basura').length, icon: '🗑️' },
    { name: 'Mobiliario', value: filteredReports.filter(r => r.category === 'mobiliario').length, icon: '🪑' },
    { name: 'Otro', value: filteredReports.filter(r => r.category === 'otro').length, icon: '📋' }
  ].filter(d => d.value > 0)

  // Datos para gráfico circular - Estado de reportes
  const statusData = [
    { name: 'Pendientes', value: pendingReports, color: '#f59e0b' },
    { name: 'En Progreso', value: inProgressReports, color: '#3b82f6' },
    { name: 'Resueltos', value: resolvedReports, color: '#10b981' }
  ].filter(d => d.value > 0)

  // Datos para gráfico de líneas - Reportes en el tiempo
  const getTimeSeriesData = () => {
    const days = timeRange === '7days' ? 7 : 30
    const data: { date: string; reportes: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      
      const count = filteredReports.filter(r => {
        const reportDate = new Date(r.created_at)
        return reportDate >= dayStart && reportDate <= dayEnd
      }).length

      data.push({
        date: format(date, 'dd MMM', { locale: es }),
        reportes: count
      })
    }

    return data
  }

  const timeSeriesData = getTimeSeriesData()

  // Top 5 reportes con más validaciones
  const topValidatedReports = [...filteredReports]
    .sort((a, b) => b.validations_count - a.validations_count)
    .slice(0, 5)

  const categoryIcons: Record<Report['category'], string> = {
    vial: '🚧',
    alumbrado: '💡',
    basura: '🗑️',
    mobiliario: '🪑',
    otro: '📋'
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Métricas y Análisis</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#e9d5ff', margin: 0 }}>
          Dashboard de rendimiento y estadísticas
        </p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Selector de rango de tiempo */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '20px',
          background: 'white',
          padding: '8px',
          borderRadius: '12px',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setTimeRange('7days')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: timeRange === '7days' ? '#667eea' : 'transparent',
              color: timeRange === '7days' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            Últimos 7 días
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: timeRange === '30days' ? '#667eea' : 'transparent',
              color: timeRange === '30days' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            Últimos 30 días
          </button>
          <button
            onClick={() => setTimeRange('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: timeRange === 'all' ? '#667eea' : 'transparent',
              color: timeRange === 'all' ? 'white' : '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            Todo el tiempo
          </button>
        </div>

        {/* Tarjetas de métricas principales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📊
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Total Reportes</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{totalReports}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ✅
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Tasa de Resolución</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{resolutionRate}%</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ⏳
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Pendientes</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{pendingReports}</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ✓
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Validaciones Promedio</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{avgValidations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Gráfico de líneas - Tendencia temporal */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
              📈 Tendencia de Reportes
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '13px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="reportes" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico circular - Estado de reportes */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
              🎯 Estado de Reportes
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '13px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de barras - Reportes por categoría */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
            📊 Reportes por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '13px'
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 reportes más validados */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
            🏆 Reportes Más Validados
          </h3>
          {topValidatedReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topValidatedReports.map((report, index) => (
                <div
                  key={report.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : index === 2 ? '#f97316' : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ fontSize: '24px', flexShrink: 0 }}>
                    {categoryIcons[report.category]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#111827',
                      margin: '0 0 4px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {report.description}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {format(new Date(report.created_at), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    background: '#dbeafe',
                    borderRadius: '9999px',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '16px' }}>✓</span>
                    <span style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '14px' }}>
                      {report.validations_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px', margin: 0 }}>
              No hay reportes validados aún
            </p>
          )}
        </div>
      </div>
    </div>
  )
}