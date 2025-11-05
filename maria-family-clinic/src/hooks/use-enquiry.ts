import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { 
  EnquiryData, 
  EnquiryListResponse,
  EnquiryCreateRequest,
  EnquiryUpdateRequest,
  EnquiryAssignmentRequest,
  EnquiryEscalationRequest,
  EnquiryFollowUpRequest,
  EnquirySatisfactionRequest,
  EnquirySearchRequest,
  EnquiryBulkActionRequest,
  EnquiryStats,
  EnquiryNotification
} from './types'
import { toast } from '@/hooks/use-toast'

export function useEnquiry() {
  const [isLoading, setIsLoading] = useState(false)

  // tRPC hooks
  const getAllQuery = trpc.enquiry.getAll.useMutation()
  const getByIdQuery = trpc.enquiry.getById.useMutation()
  const createMutation = trpc.enquiry.create.useMutation()
  const updateStatusMutation = trpc.enquiry.updateStatus.useMutation()
  const deleteMutation = trpc.enquiry.delete.useMutation()
  const getStatsQuery = trpc.enquiry.getStats.useMutation()
  const getTrendsQuery = trpc.enquiry.getTrends.useMutation()

  // Custom API functions
  const getAll = async (params: any): Promise<EnquiryListResponse> => {
    setIsLoading(true)
    try {
      const result = await getAllQuery.mutateAsync(params)
      return {
        data: result.data,
        pagination: result.pagination
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getById = async (id: string): Promise<EnquiryData> => {
    setIsLoading(true)
    try {
      const result = await getByIdQuery.mutateAsync({ id })
      return result
    } catch (error) {
      console.error('Failed to fetch enquiry:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const create = async (data: EnquiryCreateRequest): Promise<EnquiryData> => {
    setIsLoading(true)
    try {
      const result = await createMutation.mutateAsync(data)
      toast({
        title: "Success",
        description: "Enquiry created successfully.",
      })
      return result
    } catch (error) {
      console.error('Failed to create enquiry:', error)
      toast({
        title: "Error",
        description: "Failed to create enquiry. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, updates: Partial<EnquiryUpdateRequest>): Promise<EnquiryData> => {
    setIsLoading(true)
    try {
      const result = await updateStatusMutation.mutateAsync({ 
        id, 
        ...updates 
      })
      toast({
        title: "Success",
        description: "Enquiry status updated successfully.",
      })
      return result
    } catch (error) {
      console.error('Failed to update enquiry:', error)
      toast({
        title: "Error",
        description: "Failed to update enquiry. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const delete = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      await deleteMutation.mutateAsync({ id })
      toast({
        title: "Success",
        description: "Enquiry deleted successfully.",
      })
    } catch (error) {
      console.error('Failed to delete enquiry:', error)
      toast({
        title: "Error",
        description: "Failed to delete enquiry. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getStats = async (): Promise<EnquiryStats> => {
    setIsLoading(true)
    try {
      const result = await getStatsQuery.mutateAsync()
      return result
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getTrends = async (params: {
    startDate?: Date
    endDate?: Date
    groupBy?: 'day' | 'week' | 'month'
  } = {}): Promise<any[]> => {
    setIsLoading(true)
    try {
      const result = await getTrendsQuery.mutateAsync(params)
      return result
    } catch (error) {
      console.error('Failed to fetch trends:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Extended API functions
  const assignEnquiry = async (assignmentData: EnquiryAssignmentRequest): Promise<EnquiryData> => {
    setIsLoading(true)
    try {
      // This would typically call a custom endpoint
      const response = await fetch('/api/enquiry/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      })
      
      if (!response.ok) throw new Error('Failed to assign enquiry')
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Enquiry assigned successfully.",
      })
      return result
    } catch (error) {
      console.error('Failed to assign enquiry:', error)
      toast({
        title: "Error",
        description: "Failed to assign enquiry. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const escalateEnquiry = async (escalationData: EnquiryEscalationRequest): Promise<EnquiryData> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enquiry/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(escalationData)
      })
      
      if (!response.ok) throw new Error('Failed to escalate enquiry')
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Enquiry escalated successfully.",
      })
      return result
    } catch (error) {
      console.error('Failed to escalate enquiry:', error)
      toast({
        title: "Error",
        description: "Failed to escalate enquiry. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const createFollowUp = async (followUpData: EnquiryFollowUpRequest): Promise<any> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enquiry/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpData)
      })
      
      if (!response.ok) throw new Error('Failed to create follow-up')
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Follow-up scheduled successfully.",
      })
      return result
    } catch (error) {
      console.error('Failed to create follow-up:', error)
      toast({
        title: "Error",
        description: "Failed to schedule follow-up. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const submitSatisfaction = async (satisfactionData: EnquirySatisfactionRequest): Promise<any> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enquiry/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(satisfactionData)
      })
      
      if (!response.ok) throw new Error('Failed to submit satisfaction survey')
      
      const result = await response.json()
      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      })
      return result
    } catch (error) {
      console.error('Failed to submit satisfaction:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getNotifications = async (): Promise<EnquiryNotification[]> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enquiry/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const bulkAction = async (bulkActionData: EnquiryBulkActionRequest): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enquiry/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkActionData)
      })
      
      if (!response.ok) throw new Error('Failed to perform bulk action')
      
      toast({
        title: "Success",
        description: "Bulk action completed successfully.",
      })
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const searchEnquiries = async (searchData: EnquirySearchRequest): Promise<EnquiryListResponse> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enquiry/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData)
      })
      
      if (!response.ok) throw new Error('Failed to search enquiries')
      
      return await response.json()
    } catch (error) {
      console.error('Failed to search enquiries:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const getResponseTemplates = async (): Promise<any[]> => {
    try {
      const response = await fetch('/api/enquiry/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      return []
    }
  }

  const getFollowUps = async (enquiryId: string): Promise<any[]> => {
    try {
      const response = await fetch(`/api/enquiry/${enquiryId}/follow-ups`)
      if (!response.ok) throw new Error('Failed to fetch follow-ups')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error)
      return []
    }
  }

  return {
    // State
    isLoading,
    
    // Core operations
    getAll,
    getById,
    create,
    updateStatus,
    delete,
    getStats,
    getTrends,
    
    // Extended operations
    assignEnquiry,
    escalateEnquiry,
    createFollowUp,
    submitSatisfaction,
    getNotifications,
    bulkAction,
    searchEnquiries,
    getResponseTemplates,
    getFollowUps,
    
    // Raw tRPC hooks (for direct access if needed)
    queries: {
      getAll: getAllQuery,
      getById: getByIdQuery,
      getStats: getStatsQuery,
      getTrends: getTrendsQuery,
    },
    mutations: {
      create: createMutation,
      updateStatus: updateStatusMutation,
      delete: deleteMutation,
    }
  }
}