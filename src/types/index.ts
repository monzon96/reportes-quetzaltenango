export interface Report {
  id: string
  user_id: string
  category: 'vial' | 'alumbrado' | 'basura' | 'mobiliario' | 'otro'
  description: string
  latitude: number
  longitude: number
  image_url: string | null
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
  validations_count: number
}

export interface Validation {
  id: string
  report_id: string
  user_id: string
  created_at: string
}

// Elimina tu definición de User y usa el de Supabase
export type { User } from '@supabase/supabase-js'