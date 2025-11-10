import { useState } from 'react'
import { useReportStore } from '../store/useReportStore'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../lib/supabase'
import type { Report } from '../types'

interface ReportFormProps {
  onSuccess?: () => void
}

export function ReportForm({ onSuccess }: ReportFormProps) {
  const [category, setCategory] = useState<Report['category']>('vial')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const { createReport } = useReportStore()
  const { user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !description || !user) return

    setLoading(true)

    try {
      // 1. Obtener ubicación
      let latitude = 14.8344
      let longitude = -91.5185

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocalización no disponible'))
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })
        latitude = position.coords.latitude
        longitude = position.coords.longitude
        console.log('✅ Ubicación obtenida:', latitude, longitude)
      } catch {
        console.warn('⚠️ No se pudo obtener ubicación GPS, usando Quetzaltenango por defecto')
      }

      // 2. Subir imagen si existe
      let imageUrl: string | null = null

      if (image) {
        console.log('📤 Subiendo imagen...')
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('report-images')
          .upload(fileName, image)

        if (uploadError) {
          console.error('❌ Error subiendo imagen:', uploadError)
          throw new Error('Error al subir la imagen: ' + uploadError.message)
        }

        console.log('✅ Imagen subida:', uploadData)

        const { data: { publicUrl } } = supabase.storage
          .from('report-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
        console.log('✅ URL pública:', imageUrl)
      }

      // 3. Crear reporte
      console.log('📝 Creando reporte...')
      await createReport({
        category,
        description,
        latitude,
        longitude,
        image_url: imageUrl,
        status: 'pending',
        user_id: user.id,
      })

      console.log('✅ Reporte creado exitosamente')

      // 4. Reset form
      setCategory('vial')
      setDescription('')
      setImage(null)

      alert('✅ Reporte creado exitosamente')
      onSuccess?.()
    } catch (error) {
      console.error('❌ Error completo:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert('❌ Error: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f9fafb' }}>
      <div style={{ padding: '24px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Crear Reporte
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Report['category'])}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="vial">🚧 Infraestructura Vial</option>
                <option value="alumbrado">💡 Alumbrado Público</option>
                <option value="basura">🗑️ Manejo de Desechos</option>
                <option value="mobiliario">🪑 Mobiliario Urbano</option>
                <option value="otro">📋 Otro</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                placeholder="Describe el problema en detalle..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Foto (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              />
              {image && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  📎 Archivo seleccionado: {image.name}
                </p>
              )}
            </div>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#1e40af',
                margin: 0
              }}>
                📍 La ubicación se obtendrá automáticamente al crear el reporte. Si no se puede obtener, se usará la ubicación del centro de Quetzaltenango.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.background = '#059669'
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.background = '#10b981'
              }}
            >
              {loading ? '⏳ Creando reporte...' : '✅ Crear Reporte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}