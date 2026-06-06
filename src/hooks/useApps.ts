import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useApps() {
  const [apps, setApps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchApps = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get('/api/apps')
      setApps(data.apps)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  return { apps, isLoading, error, refetch: fetchApps }
}
