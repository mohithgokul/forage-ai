import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useApp(appId: string) {
  const [app, setApp] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchApp = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/api/apps/${appId}`)
      setApp(data.app)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (appId) fetchApp()
  }, [appId])

  return { app, isLoading, error, refetch: fetchApp }
}
