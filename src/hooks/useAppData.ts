import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useAppData(appId: string, tableName: string, params: any) {
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/api/apps/${appId}/data/${tableName}`, { params })
      setRecords(data.records)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (appId && tableName) fetchData()
  }, [appId, tableName, JSON.stringify(params)])

  return { records, pagination, isLoading, error, refetch: fetchData }
}
