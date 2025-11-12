import { useEffect, useState } from 'react'
import { useAuthStore } from './store/useAuthStore'
import { Auth } from './components/Auth'
import { ReportForm } from './components/ReportForm'
import { ReportList } from './components/ReportList'
import { MapView } from './components/MapView'
import { AdminPanel } from './components/AdminPanel'
import { AdminMetrics } from './components/AdminMetrics'
import { ARView } from './components/ARView'

type View = 'map' | 'list' | 'create' | 'admin' | 'metrics' | 'ar'

function App() {
  const { user, userRole, loading, initialize, signOut } = useAuthStore()
  const [view, setView] = useState<View>('list')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleViewChange = (newView: View) => {
    setView(newView)
    setMenuOpen(false)
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #2563eb',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#374151', fontWeight: '500' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(to right, #2563eb, #3b82f6, #4f46e5)',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>📍</span>
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Reportes Xela</h1>
            {userRole === 'admin' && (
              <span style={{
                background: '#fbbf24',
                color: '#78350f',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '9999px'
              }}>
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={signOut}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Menu lateral */}
      {menuOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 40
            }}
            onClick={() => setMenuOpen(false)}
          />

          <div className="animate-slide-in-left" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            width: '288px',
            background: 'white',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: 'linear-gradient(to bottom right, #2563eb, #4f46e5)',
              color: 'white',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '4px', margin: 0 }}>Menú</h2>
                  <p style={{ fontSize: '14px', color: '#bfdbfe', margin: 0 }}>Navegación</p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <p style={{ fontSize: '12px', color: '#bfdbfe', marginBottom: '4px', margin: '0 0 4px 0' }}>Usuario</p>
                <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                {userRole === 'admin' && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    background: '#fbbf24',
                    color: '#78350f',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '4px 8px',
                    borderRadius: '9999px'
                  }}>
                    Administrador
                  </span>
                )}
              </div>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => handleViewChange('list')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: view === 'list' ? '#eff6ff' : 'transparent',
                    color: view === 'list' ? '#2563eb' : '#374151',
                    fontWeight: view === 'list' ? '500' : 'normal'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span style={{ fontSize: '14px' }}>Lista de Reportes</span>
                </button>

                <button
                  onClick={() => handleViewChange('create')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: view === 'create' ? '#eff6ff' : 'transparent',
                    color: view === 'create' ? '#2563eb' : '#374151',
                    fontWeight: view === 'create' ? '500' : 'normal'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span style={{ fontSize: '14px' }}>Crear Reporte</span>
                </button>

                <button
                  onClick={() => handleViewChange('map')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: view === 'map' ? '#eff6ff' : 'transparent',
                    color: view === 'map' ? '#2563eb' : '#374151',
                    fontWeight: view === 'map' ? '500' : 'normal'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span style={{ fontSize: '14px' }}>Mapa Interactivo</span>
                </button>

                <button
                  onClick={() => handleViewChange('ar')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: view === 'ar' ? '#eff6ff' : 'transparent',
                    color: view === 'ar' ? '#2563eb' : '#374151',
                    fontWeight: view === 'ar' ? '500' : 'normal'
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span style={{ fontSize: '14px' }}>Vista AR</span>
                </button>

                {userRole === 'admin' && (
                  <>
                    <div style={{
                      height: '1px',
                      background: '#e5e7eb',
                      margin: '8px 0'
                    }}></div>

                    <button
                      onClick={() => handleViewChange('metrics')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: view === 'metrics' ? '#eff6ff' : 'transparent',
                        color: view === 'metrics' ? '#2563eb' : '#374151',
                        fontWeight: view === 'metrics' ? '500' : 'normal'
                      }}
                    >
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span style={{ fontSize: '14px' }}>Métricas y Análisis</span>
                    </button>

                    <button
                      onClick={() => handleViewChange('admin')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: view === 'admin' ? '#eff6ff' : 'transparent',
                        color: view === 'admin' ? '#2563eb' : '#374151',
                        fontWeight: view === 'admin' ? '500' : 'normal'
                      }}
                    >
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span style={{ fontSize: '14px' }}>Panel Admin</span>
                    </button>
                  </>
                )}
              </div>
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={signOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  color: '#dc2626',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {view === 'list' && <ReportList />}
        {view === 'create' && <ReportForm onSuccess={() => handleViewChange('list')} />}
        {view === 'map' && <MapView />}
        {view === 'ar' && <ARView />}
        {view === 'metrics' && userRole === 'admin' && <AdminMetrics />}
        {view === 'admin' && userRole === 'admin' && <AdminPanel />}
      </main>
    </div>
  )
}

export default App// Version 1.0.1
