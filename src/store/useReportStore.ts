import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Report } from '../types'

interface ReportStore {
  reports: Report[]
  loading: boolean
  fetchReports: () => Promise<void>
  createReport: (report: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'validations_count'>) => Promise<void>
  validateReport: (reportId: string) => Promise<void>
  updateReportStatus: (reportId: string, status: Report['status']) => Promise<void>
  deleteReport: (reportId: string) => Promise<void>
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  loading: false,

  fetchReports: async () => {
    console.log('🔍 Fetching reports...')
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          validations:report_validations(count)
        `)
        .order('created_at', { ascending: false })

      console.log('📊 Raw data from Supabase:', data)
      console.log('⚠️ Error from Supabase:', error)

      if (error) throw error

      const reportsWithCounts = data.map((report) => ({
        ...report,
        validations_count: report.validations?.[0]?.count || 0,
      }))

      console.log('✅ Reports with counts:', reportsWithCounts)

      set({ reports: reportsWithCounts, loading: false })
    } catch (error) {
      console.error('❌ Error fetching reports:', error)
      set({ loading: false })
    }
  },

  createReport: async (report) => {
    console.log('📝 Creating report with data:', report)
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([report])
        .select()
        .single()

      console.log('📊 Created report data:', data)
      console.log('⚠️ Create error:', error)

      if (error) throw error

      set((state) => ({
        reports: [{ ...data, validations_count: 0 }, ...state.reports],
      }))

      console.log('✅ Report created successfully')
    } catch (error) {
      console.error('❌ Error creating report:', error)
      throw error
    }
  },

  validateReport: async (reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('report_validations')
        .insert([{ report_id: reportId, user_id: user.id }])

      if (error) throw error

      await get().fetchReports()
    } catch (error) {
      console.error('Error validating report:', error)
      throw error
    }
  },

  updateReportStatus: async (reportId: string, status: Report['status']) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)

      if (error) throw error

      set((state) => ({
        reports: state.reports.map((r) =>
          r.id === reportId ? { ...r, status } : r
        ),
      }))
    } catch (error) {
      console.error('Error updating report status:', error)
      throw error
    }
  },

  deleteReport: async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      set((state) => ({
        reports: state.reports.filter((r) => r.id !== reportId),
      }))
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  },
}))