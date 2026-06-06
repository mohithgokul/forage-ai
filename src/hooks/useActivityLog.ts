import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useActivityLog(appId: string) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/api/apps/${appId}/activity`)
      setLogs(data.logs)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (appId) fetchLogs()
  }, [appId])

  return { logs, isLoading, refetch: fetchLogs }
}
