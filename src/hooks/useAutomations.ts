import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useAutomations(appId: string) {
  const [automations, setAutomations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAutomations = async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/api/apps/${appId}/automations`)
      setAutomations(data.automations)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (appId) fetchAutomations()
  }, [appId])

  const createAutomation = async (payload: any) => {
    await api.post(`/api/apps/${appId}/automations`, payload)
    await fetchAutomations()
  }

  const toggleAutomation = async (id: string, enabled: boolean) => {
    await api.patch(`/api/apps/${appId}/automations/${id}`, { enabled })
    await fetchAutomations()
  }

  const deleteAutomation = async (id: string) => {
    await api.delete(`/api/apps/${appId}/automations/${id}`)
    await fetchAutomations()
  }

  return { automations, isLoading, createAutomation, toggleAutomation, deleteAutomation }
}
