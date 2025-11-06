'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { 
  Eye, 
  MoreHorizontal, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid3X3,
  List,
  Kanban,
  Assign,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  MapPin
} from 'lucide-react'
import { EnquiryData, EnquiryBulkActionRequest } from './types'
import { EnquiryDetail } from './enquiry-detail'
import { EnquiryBulkActions } from './enquiry-bulk-actions'
import { format, formatDistanceToNow, isAfter, subHours } from 'date-fns'
import { cn } from '@/lib/utils'

interface EnquiryListProps {
  enquiries: EnquiryData[]
  selectedEnquiry: EnquiryData | null
  onEnquirySelect: (enquiry: EnquiryData | null) => void
  onEnquiryUpdate: (enquiry: EnquiryData) => void
  onBulkAction: (enquiryIds: string[], action: string, parameters: any) => void
  view: 'list' | 'grid' | 'kanban'
  onViewChange: (view: 'list' | 'grid' | 'kanban') => void
  isLoading: boolean
  userRole: 'STAFF' | 'ADMIN'
}

export function EnquiryList({
  enquiries,
  selectedEnquiry,
  onEnquirySelect,
  onEnquiryUpdate,
  onBulkAction,
  view,
  onViewChange,
  isLoading,
  userRole
}: EnquiryListProps) {
  const [selectedEnquiries, setSelectedEnquiries] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof EnquiryData>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Sort and filter enquiries
  const sortedEnquiries = useMemo(() => {
    return [...enquiries].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [enquiries, sortField, sortDirection])

  const handleSort = (field: keyof EnquiryData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectEnquiry = (enquiryId: string, selected: boolean) => {
    if (selected) {
      setSelectedEnquiries(prev => [...prev, enquiryId])
    } else {
      setSelectedEnquiries(prev => prev.filter(id => id !== enquiryId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEnquiries(enquiries.map(e => e.id))
    } else {
      setSelectedEnquiries([])
    }
  }

  const handleBulkAction = (action: string, parameters?: any) => {
    onBulkAction(selectedEnquiries, action, parameters)
    setSelectedEnquiries([])
    setShowBulkActions(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive'
      case 'HIGH': return 'secondary'
      case 'NORMAL': return 'default'
      case 'LOW': return 'outline'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'secondary'
      case 'IN_PROGRESS': return 'default'
      case 'PENDING': return 'outline'
      case 'RESOLVED': return 'default'
      case 'CLOSED': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW': return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS': return <AlertTriangle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />
      case 'CLOSED': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = (enquiry: EnquiryData) => {
    if (enquiry.status === 'RESOLVED' || enquiry.status === 'CLOSED') return false
    
    const createdAt = new Date(enquiry.createdAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    // Define SLA targets
    const slaTargets = {
      URGENT: 2,      // 2 hours for urgent
      HIGH: 4,        // 4 hours for high priority
      NORMAL: 8,      // 8 hours for normal
      LOW: 24         // 24 hours for low
    }
    
    const target = slaTargets[enquiry.priority] || 8
    return hoursDiff > target
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (view === 'kanban') {
    return <KanbanView 
      enquiries={enquiries}
      selectedEnquiry={selectedEnquiry}
      onEnquirySelect={onEnquirySelect}
      onEnquiryUpdate={onEnquiryUpdate}
      userRole={userRole}
    />
  }

  if (view === 'grid') {
    return <GridView 
      enquiries={enquiries}
      selectedEnquiry={selectedEnquiry}
      onEnquirySelect={onEnquirySelect}
      onEnquiryUpdate={onEnquiryUpdate}
      userRole={userRole}
    />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Enquiries</CardTitle>
            <CardDescription>
              {enquiries.length} enquiry{enquiries.length !== 1 ? 's' : ''} found
              {selectedEnquiries.length > 0 && (
                <span className="ml-2 text-sm font-medium">
                  • {selectedEnquiries.length} selected
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {selectedEnquiries.length > 0 && (
              <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions ({selectedEnquiries.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Actions</DialogTitle>
                    <DialogDescription>
                      Perform actions on {selectedEnquiries.length} selected enquiries
                    </DialogDescription>
                  </DialogHeader>
                  <EnquiryBulkActions
                    selectedEnquiries={selectedEnquiries}
                    onAction={handleBulkAction}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <div className="flex border rounded-md">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('kanban')}
                className="rounded-l-none"
              >
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedEnquiries.length === enquiries.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('subject')}>
                  Subject
                  {sortField === 'subject' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')}>
                  Customer
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('type')}>
                  Type
                  {sortField === 'type' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('priority')}>
                  Priority
                  {sortField === 'priority' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')}>
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                  Created
                  {sortField === 'createdAt' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEnquiries.map((enquiry) => (
              <TableRow 
                key={enquiry.id} 
                className={cn(
                  "cursor-pointer",
                  selectedEnquiry?.id === enquiry.id && "bg-muted",
                  isOverdue(enquiry) && "border-l-4 border-l-red-500"
                )}
                onClick={() => onEnquirySelect(enquiry)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedEnquiries.includes(enquiry.id)}
                    onCheckedChange={(checked) => handleSelectEnquiry(enquiry.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{enquiry.subject}</span>
                      {isOverdue(enquiry) && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{enquiry.type}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{enquiry.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{enquiry.email}</span>
                      {enquiry.phone && (
                        <>
                          <Phone className="h-3 w-3" />
                          <span>{enquiry.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {enquiry.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getPriorityColor(enquiry.priority)} 
                    className="text-xs"
                  >
                    {enquiry.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(enquiry.status)}
                    <Badge 
                      variant={getStatusColor(enquiry.status)} 
                      className="text-xs"
                    >
                      {enquiry.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {format(new Date(enquiry.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {enquiry.assignedStaff ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{enquiry.assignedStaff.name}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEnquirySelect(enquiry)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {enquiry.assignedTo ? (
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Assign className="mr-2 h-4 w-4" />
                          Reassign
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <User className="mr-2 h-4 w-4" />
                          Assign to Me
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => e.stopPropagation()}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Enquiry Detail Dialog */}
      {selectedEnquiry && (
        <Dialog open={!!selectedEnquiry} onOpenChange={() => onEnquirySelect(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <EnquiryDetail
              enquiry={selectedEnquiry}
              onUpdate={onEnquiryUpdate}
              onClose={() => onEnquirySelect(null)}
              userRole={userRole}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

// Kanban Board View Component
function KanbanView({ enquiries, selectedEnquiry, onEnquirySelect, onEnquiryUpdate, userRole }: any) {
  const statusColumns = [
    { status: 'NEW', title: 'New', color: 'bg-blue-50 border-blue-200' },
    { status: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { status: 'PENDING', title: 'Pending', color: 'bg-orange-50 border-orange-200' },
    { status: 'RESOLVED', title: 'Resolved', color: 'bg-green-50 border-green-200' },
    { status: 'CLOSED', title: 'Closed', color: 'bg-gray-50 border-gray-200' }
  ]

  const getEnquiriesByStatus = (status: string) => 
    enquiries.filter(e => e.status === status)

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => (
        <div key={column.status} className="flex-shrink-0 w-80">
          <div className={`rounded-lg border-2 ${column.color} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.title}</h3>
              <Badge variant="secondary">
                {getEnquiriesByStatus(column.status).length}
              </Badge>
            </div>
            <div className="space-y-3">
              {getEnquiriesByStatus(column.status).map((enquiry) => (
                <Card 
                  key={enquiry.id} 
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedEnquiry?.id === enquiry.id && "ring-2 ring-primary"
                  )}
                  onClick={() => onEnquirySelect(enquiry)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{enquiry.subject}</h4>
                      <p className="text-xs text-muted-foreground">{enquiry.name}</p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={enquiry.priority === 'URGENT' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {enquiry.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(enquiry.createdAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Grid View Component  
function GridView({ enquiries, selectedEnquiry, onEnquirySelect, onEnquiryUpdate, userRole }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {enquiries.map((enquiry) => (
        <Card 
          key={enquiry.id} 
          className={cn(
            "cursor-pointer transition-colors",
            selectedEnquiry?.id === enquiry.id && "ring-2 ring-primary"
          )}
          onClick={() => onEnquirySelect(enquiry)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {enquiry.type.replace('_', ' ')}
              </Badge>
              <Badge 
                variant={enquiry.priority === 'URGENT' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {enquiry.priority}
              </Badge>
            </div>
            <CardTitle className="text-base">{enquiry.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{enquiry.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{enquiry.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={enquiry.status === 'RESOLVED' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {enquiry.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(enquiry.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}