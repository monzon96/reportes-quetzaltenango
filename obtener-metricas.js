import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://csuykuizpvusdrtrgdce.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXlrdWl6cHZ1c2RydHJnZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODkxODIsImV4cCI6MjA3NzM2NTE4Mn0.2KO5873M4rv5kQyuXhCTNAXeoluWZT-rFcyeE4sQ4fs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function obtenerMetricas() {
  console.log('📊 EXTRAYENDO MÉTRICAS DEL PROTOTIPO FUNCIONAL')
  console.log('='.repeat(70))
  console.log('')
  
  try {
    // 1. Total de reportes creados
    const { data: reportes, error: errorReportes } = await supabase
      .from('reports')
      .select('*')
    
    if (errorReportes) {
      console.error('❌ Error al obtener reportes:', errorReportes.message)
      return
    }
    
    const totalReportes = reportes?.length || 0
    console.log(`✅ Total de reportes en el sistema: ${totalReportes}`)
    
    if (totalReportes === 0) {
      console.log('\n⚠️  No hay reportes en la base de datos.')
      console.log('   Crea algunos reportes de prueba primero usando la app.')
      return
    }
    
    // 2. Reportes por categoría
    const categorias = {}
    reportes.forEach(r => {
      const cat = r.category || 'Sin categoría'
      categorias[cat] = (categorias[cat] || 0) + 1
    })
    
    console.log('\n📋 REPORTES POR CATEGORÍA:')
    Object.entries(categorias).forEach(([cat, count]) => {
      const porcentaje = ((count / totalReportes) * 100).toFixed(1)
      console.log(`   • ${cat}: ${count} (${porcentaje}%)`)
    })
    
    // 3. Reportes con geolocalización
    const conGPS = reportes.filter(r => r.latitude && r.longitude).length
    const porcentajeGPS = ((conGPS / totalReportes) * 100).toFixed(1)
    console.log(`\n📍 Reportes con geolocalización GPS: ${conGPS} (${porcentajeGPS}%)`)
    
    // 4. Reportes con foto
    const conFoto = reportes.filter(r => r.photo_url).length
    const porcentajeFoto = ((conFoto / totalReportes) * 100).toFixed(1)
    console.log(`📷 Reportes con evidencia fotográfica: ${conFoto} (${porcentajeFoto}%)`)
    
    // 5. Usuarios registrados
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('profiles')
      .select('*')
    
    const totalUsuarios = usuarios?.length || 0
    console.log(`\n👥 Usuarios registrados: ${totalUsuarios}`)
    
    // 6. Reportes por estado
    const estados = {}
    reportes.forEach(r => {
      const estado = r.status || 'pending'
      estados[estado] = (estados[estado] || 0) + 1
    })
    
    console.log('\n📊 REPORTES POR ESTADO:')
    Object.entries(estados).forEach(([estado, count]) => {
      const porcentaje = ((count / totalReportes) * 100).toFixed(1)
      const emoji = estado === 'resolved' ? '✅' : estado === 'in_progress' ? '🔄' : '⏳'
      console.log(`   ${emoji} ${estado}: ${count} (${porcentaje}%)`)
    })
    
    // 7. Validaciones comunitarias
    const { data: validaciones } = await supabase
      .from('validations')
      .select('*')
    
    const totalValidaciones = validaciones?.length || 0
    const promedioValidaciones = totalReportes > 0 ? (totalValidaciones / totalReportes).toFixed(1) : 0
    console.log(`\n✓ Validaciones comunitarias totales: ${totalValidaciones}`)
    console.log(`  (Promedio de ${promedioValidaciones} validaciones por reporte)`)
    
    // 8. Tiempo promedio de gestión (para reportes resueltos)
    const reportesResueltos = reportes.filter(r => 
      r.status === 'resolved' && r.created_at && r.updated_at
    )
    
    let promedioTiempo = null
    if (reportesResueltos.length > 0) {
      const tiempos = reportesResueltos.map(r => {
        const created = new Date(r.created_at)
        const updated = new Date(r.updated_at)
        const dias = (updated - created) / (1000 * 60 * 60 * 24)
        return dias
      })
      
      promedioTiempo = (tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(1)
      const minTiempo = Math.min(...tiempos).toFixed(1)
      const maxTiempo = Math.max(...tiempos).toFixed(1)
      
      console.log(`\n⏱️  Tiempo de gestión (reportes resueltos):`)
      console.log(`   • Promedio: ${promedioTiempo} días`)
      console.log(`   • Mínimo: ${minTiempo} días`)
      console.log(`   • Máximo: ${maxTiempo} días`)
      console.log(`   • Basado en: ${reportesResueltos.length} reportes resueltos`)
    } else {
      console.log(`\n⏱️  Tiempo de gestión: N/A (no hay reportes resueltos aún)`)
    }
    
    // 9. Actividad reciente
    const ultimos7Dias = new Date()
    ultimos7Dias.setDate(ultimos7Dias.getDate() - 7)
    
    const reportesRecientes = reportes.filter(r => 
      new Date(r.created_at) > ultimos7Dias
    ).length
    
    const ultimos30Dias = new Date()
    ultimos30Dias.setDate(ultimos30Dias.getDate() - 30)
    
    const reportesMes = reportes.filter(r => 
      new Date(r.created_at) > ultimos30Dias
    ).length
    
    console.log(`\n📅 Actividad reciente:`)
    console.log(`   • Últimos 7 días: ${reportesRecientes} reportes`)
    console.log(`   • Últimos 30 días: ${reportesMes} reportes`)
    
    // 10. Generar resumen para la presentación
    console.log('\n' + '='.repeat(70))
    console.log('📈 RESUMEN PARA SLIDE DE RESULTADOS')
    console.log('='.repeat(70))
    
    const resumen = `
VALIDACIÓN TÉCNICA DEL PROTOTIPO:

✅ Sistema funcional con ${totalReportes} reportes procesados
✅ ${totalUsuarios} usuarios validadores registrados
✅ ${porcentajeGPS}% de reportes con geolocalización GPS precisa
✅ ${porcentajeFoto}% de reportes con evidencia fotográfica
✅ ${totalValidaciones} validaciones comunitarias realizadas
${promedioTiempo ? `✅ Tiempo promedio de gestión: ${promedioTiempo} días (fase de pruebas)` : ''}
✅ ${reportesMes} reportes procesados en el último mes

CAPACIDADES TÉCNICAS DEMOSTRADAS:

• Captura automática de ubicación GPS
• Integración de cámara para evidencia fotográfica
• Sistema de validación comunitaria operativo
• Panel administrativo con visualización en mapa
• Autenticación y gestión de usuarios
• Backend en la nube escalable (Supabase)
`
    
    console.log(resumen)
    
    // 11. Generar archivo Markdown con el reporte
    const fechaReporte = new Date().toLocaleString('es-GT', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
    
    const markdown = `# REPORTE DE MÉTRICAS DEL PROTOTIPO
## Sistema de Gestión de Reportes Ciudadanos - Quetzaltenango

**Fecha de generación:** ${fechaReporte}

---

## RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| Total de reportes procesados | ${totalReportes} |
| Usuarios registrados | ${totalUsuarios} |
| Reportes con GPS preciso | ${conGPS} (${porcentajeGPS}%) |
| Reportes con evidencia fotográfica | ${conFoto} (${porcentajeFoto}%) |
| Validaciones comunitarias | ${totalValidaciones} |
| Promedio validaciones/reporte | ${promedioValidaciones} |
| Tiempo promedio de gestión | ${promedioTiempo ? promedioTiempo + ' días' : 'N/A (sin reportes resueltos)'} |
| Actividad últimos 7 días | ${reportesRecientes} reportes |
| Actividad últimos 30 días | ${reportesMes} reportes |

---

## DISTRIBUCIÓN POR CATEGORÍA

${Object.entries(categorias).map(([cat, count]) => {
  const pct = ((count / totalReportes) * 100).toFixed(1)
  return `- **${cat}**: ${count} reportes (${pct}%)`
}).join('\n')}

---

## DISTRIBUCIÓN POR ESTADO

${Object.entries(estados).map(([estado, count]) => {
  const pct = ((count / totalReportes) * 100).toFixed(1)
  return `- **${estado}**: ${count} reportes (${pct}%)`
}).join('\n')}

---

## ANÁLISIS DE TIEMPOS (Reportes Resueltos)

${reportesResueltos.length > 0 ? `
- **Promedio de gestión:** ${promedioTiempo} días
- **Tiempo mínimo:** ${Math.min(...reportesResueltos.map(r => (new Date(r.updated_at) - new Date(r.created_at)) / (1000*60*60*24))).toFixed(1)} días
- **Tiempo máximo:** ${Math.max(...reportesResueltos.map(r => (new Date(r.updated_at) - new Date(r.created_at)) / (1000*60*60*24))).toFixed(1)} días
- **Reportes analizados:** ${reportesResueltos.length}
` : 'No hay reportes resueltos aún para análisis de tiempos.'}

---

## INTERPRETACIÓN PARA LA DEFENSA DE TESIS

### Validación Técnica Lograda

${resumen}

### Comparación con Situación Actual

| Aspecto | Antes (Sistema Tradicional) | Con PWA (Prototipo) | Mejora |
|---------|----------------------------|---------------------|--------|
| Tiempo de respuesta | 45 días promedio | ${promedioTiempo || 'En medición'} días | ${promedioTiempo ? ((45 - parseFloat(promedioTiempo)) / 45 * 100).toFixed(0) + '%' : 'TBD'} |
| Precisión de ubicación | Manual, imprecisa | ${porcentajeGPS}% GPS automático | ✅ |
| Evidencia visual | Limitada | ${porcentajeFoto}% con fotos | ✅ |
| Transparencia | Baja | Validación comunitaria | ✅ |
| Reportes duplicados | ~35% | Sistema de detección | ✅ |

### Nota Metodológica

**Estos datos corresponden a la fase de validación técnica del prototipo.**

Para la validación completa del impacto, se recomienda:
- Piloto de 3 meses en zona específica de Quetzaltenango
- Métricas controladas de satisfacción ciudadana
- Comparación estadística con datos históricos municipales
- Evaluación de adopción y usabilidad

---

**🔬 Datos extraídos automáticamente desde Supabase**  
**📅 ${fechaReporte}**
`
    
    // Guardar archivo Markdown
    fs.writeFileSync('reporte-metricas.md', markdown)
    console.log('\n💾 Archivo generado: reporte-metricas.md')
    
    // Guardar JSON para otros usos
    const jsonData = {
      fecha: new Date().toISOString(),
      metricas: {
        totalReportes,
        totalUsuarios,
        reportesConGPS: conGPS,
        porcentajeGPS: parseFloat(porcentajeGPS),
        reportesConFoto: conFoto,
        porcentajeFoto: parseFloat(porcentajeFoto),
        totalValidaciones,
        promedioValidacionesPorReporte: parseFloat(promedioValidaciones),
        tiempoPromedioGestion: promedioTiempo ? parseFloat(promedioTiempo) : null,
        reportesUltimos7Dias: reportesRecientes,
        reportesUltimos30Dias: reportesMes,
        categorias,
        estados,
        reportesResueltos: reportesResueltos.length
      }
    }
    
    fs.writeFileSync('metricas.json', JSON.stringify(jsonData, null, 2))
    console.log('💾 Archivo generado: metricas.json')
    
    console.log('\n✅ Proceso completado exitosamente!')
    console.log('\n📄 Archivos generados:')
    console.log('   • reporte-metricas.md - Reporte completo en Markdown')
    console.log('   • metricas.json - Datos en formato JSON')
    console.log('\n💡 Usa estos datos para actualizar tu Slide 7 de Resultados')
    
  } catch (error) {
    console.error('\n❌ Error al obtener métricas:', error)
    console.log('\n🔍 Verifica:')
    console.log('   1. Que las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén correctas')
    console.log('   2. Que tengas conexión a internet')
    console.log('   3. Que las tablas existan en Supabase: reports, profiles, validations')
  }
}

// Ejecutar
obtenerMetricas()