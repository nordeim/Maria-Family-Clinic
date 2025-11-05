"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Navigation, 
  Home, 
  Shield, 
  Heart, 
  Calendar, 
  Search, 
  MapPin,
  Bell,
  Settings,
  User,
  BookOpen,
  Award,
  TrendingUp,
  FileText,
  Users,
  Stethoscope,
  Activity,
  Target,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  BarChart3,
  Clipboard,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  isActive?: boolean
  isDisabled?: boolean
  children?: NavigationItem[]
  description?: string
}

interface HealthierSGNavigationProps {
  userId?: string
  activeSection?: string
  onSectionChange?: (section: string) => void
  className?: string
  variant?: 'sidebar' | 'tabs' | 'breadcrumb' | 'floating'
  compact?: boolean
  showBadges?: boolean
  showDescriptions?: boolean
}

export function HealthierSGNavigation({
  userId,
  activeSection = 'dashboard',
  onSectionChange,
  className,
  variant = 'sidebar',
  compact = false,
  showBadges = true,
  showDescriptions = false
}: HealthierSGNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['program'])

  // Main navigation items
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-4 w-4" />,
      href: '/dashboard',
      description: 'Overview of your health and program status'
    },
    {
      id: 'program',
      label: 'Healthier SG Program',
      icon: <Shield className="h-4 w-4" />,
      description: 'Manage your Healthier SG participation',
      children: [
        {
          id: 'program-overview',
          label: 'Program Overview',
          icon: <FileText className="h-3 w-3" />,
          href: '/healthier-sg/overview',
          description: 'Your program status and benefits'
        },
        {
          id: 'program-eligibility',
          label: 'Eligibility & Enrollment',
          icon: <CheckCircle className="h-3 w-3" />,
          href: '/healthier-sg/eligibility',
          badge: 'Active',
          badgeVariant: 'default'
        },
        {
          id: 'program-goals',
          label: 'Health Goals',
          icon: <Target className="h-3 w-3" />,
          href: '/healthier-sg/goals',
          badge: '5 active',
          badgeVariant: 'secondary'
        },
        {
          id: 'program-milestones',
          label: 'Milestones',
          icon: <Award className="h-3 w-3" />,
          href: '/healthier-sg/milestones',
          badge: '2 pending',
          badgeVariant: 'outline'
        },
        {
          id: 'program-benefits',
          label: 'Benefits & Incentives',
          icon: <Star className="h-3 w-3" />,
          href: '/healthier-sg/benefits',
          badge: '$400 available',
          badgeVariant: 'default'
        }
      ]
    },
    {
      id: 'health',
      label: 'Health Management',
      icon: <Heart className="h-4 w-4" />,
      description: 'Track and manage your health',
      children: [
        {
          id: 'health-records',
          label: 'Health Records',
          icon: <FileText className="h-3 w-3" />,
          href: '/health/records'
        },
        {
          id: 'health-metrics',
          label: 'Health Metrics',
          icon: <Activity className="h-3 w-3" />,
          href: '/health/metrics',
          badge: 'Update needed',
          badgeVariant: 'outline'
        },
        {
          id: 'health-screening',
          label: 'Screenings',
          icon: <Clipboard className="h-3 w-3" />,
          href: '/health/screening',
          badge: 'Due',
          badgeVariant: 'secondary'
        },
        {
          id: 'health-goals',
          label: 'General Health Goals',
          icon: <Target className="h-3 w-3" />,
          href: '/health/goals'
        }
      ]
    },
    {
      id: 'providers',
      label: 'Healthcare Providers',
      icon: <Users className="h-4 w-4" />,
      description: 'Find and connect with healthcare providers',
      children: [
        {
          id: 'providers-clinics',
          label: 'Healthier SG Clinics',
          icon: <MapPin className="h-3 w-3" />,
          href: '/providers/clinics',
          badge: '12 nearby',
          badgeVariant: 'secondary'
        },
        {
          id: 'providers-doctors',
          label: 'Program Doctors',
          icon: <Stethoscope className="h-3 w-3" />,
          href: '/providers/doctors',
          badge: '5 certified',
          badgeVariant: 'default'
        },
        {
          id: 'providers-services',
          label: 'Program Services',
          icon: <Activity className="h-3 w-3" />,
          href: '/providers/services'
        }
      ]
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar className="h-4 w-4" />,
      href: '/appointments',
      description: 'Manage your appointments',
      children: [
        {
          id: 'appointments-upcoming',
          label: 'Upcoming',
          icon: <Calendar className="h-3 w-3" />,
          href: '/appointments/upcoming',
          badge: '2 scheduled',
          badgeVariant: 'default'
        },
        {
          id: 'appointments-history',
          label: 'History',
          icon: <FileText className="h-3 w-3" />,
          href: '/appointments/history'
        },
        {
          id: 'appointments-book',
          label: 'Book Appointment',
          icon: <Plus className="h-3 w-3" />,
          href: '/appointments/book'
        }
      ]
    },
    {
      id: 'search',
      label: 'Search & Find',
      icon: <Search className="h-4 w-4" />,
      description: 'Search for health information and services',
      children: [
        {
          id: 'search-clinics',
          label: 'Find Clinics',
          icon: <MapPin className="h-3 w-3" />,
          href: '/search/clinics'
        },
        {
          id: 'search-doctors',
          label: 'Find Doctors',
          icon: <Stethoscope className="h-3 w-3" />,
          href: '/search/doctors'
        },
        {
          id: 'search-services',
          label: 'Find Services',
          icon: <Activity className="h-3 w-3" />,
          href: '/search/services'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'View your health and program analytics',
      children: [
        {
          id: 'analytics-progress',
          label: 'Progress Reports',
          icon: <TrendingUp className="h-3 w-3" />,
          href: '/analytics/progress'
        },
        {
          id: 'analytics-benefits',
          label: 'Benefits Analytics',
          icon: <Star className="h-3 w-3" />,
          href: '/analytics/benefits'
        },
        {
          id: 'analytics-health',
          label: 'Health Trends',
          icon: <Activity className="h-3 w-3" />,
          href: '/analytics/health'
        }
      ]
    }
  ]

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isItemActive = (item: NavigationItem) => {
    return activeSection === item.id || 
           (item.children && item.children.some(child => activeSection === child.id))
  }

  const renderSidebarNavigation = () => {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Healthier SG
          </CardTitle>
          <CardDescription>
            Your integrated health management platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-1 p-4">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <div className="flex items-center">
                  {item.children ? (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start p-2 h-auto",
                        isItemActive(item) && "bg-green-50 text-green-700",
                        compact && "p-1"
                      )}
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {item.icon}
                        <span className={cn(compact && "text-sm")}>{item.label}</span>
                        {showBadges && item.badge && (
                          <Badge 
                            variant={item.badgeVariant || 'secondary'} 
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Link href={item.href!} className="flex-1">
                      <Button
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start p-2 h-auto",
                          activeSection === item.id && "bg-green-600 hover:bg-green-700",
                          compact && "p-1"
                        )}
                        onClick={() => onSectionChange?.(item.id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {item.icon}
                          <span className={cn(compact && "text-sm")}>{item.label}</span>
                          {showBadges && item.badge && (
                            <Badge 
                              variant={item.badgeVariant || 'secondary'} 
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </Link>
                  )}
                </div>
                
                {/* Children */}
                {item.children && expandedItems.includes(item.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link key={child.id} href={child.href!}>
                        <Button
                          variant={activeSection === child.id ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start p-2 h-auto text-sm",
                            activeSection === child.id && "bg-green-100 text-green-800",
                            compact && "p-1"
                          )}
                          onClick={() => onSectionChange?.(child.id)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {child.icon}
                            <span>{child.label}</span>
                            {showBadges && child.badge && (
                              <Badge 
                                variant={child.badgeVariant || 'secondary'} 
                                className="text-xs"
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </div>
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
                
                {showDescriptions && item.description && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </nav>
        </CardContent>
      </Card>
    )
  }

  const renderTabNavigation = () => {
    return (
      <div className={cn("w-full", className)}>
        <nav className="flex space-x-1 overflow-x-auto">
          {navigationItems.map((item) => (
            <div key={item.id} className="flex-shrink-0">
              {item.children ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      "whitespace-nowrap",
                      isItemActive(item) && "bg-green-50 text-green-700 border-green-200"
                    )}
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                    {expandedItems.includes(item.id) ? (
                      <ChevronDown className="h-4 w-4 ml-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                  
                  {/* Dropdown for children */}
                  {expandedItems.includes(item.id) && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-48">
                      {item.children.map((child) => (
                        <Link key={child.id} href={child.href!}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start",
                              activeSection === child.id && "bg-green-50 text-green-700"
                            )}
                            onClick={() => onSectionChange?.(child.id)}
                          >
                            {child.icon}
                            <span className="ml-1">{child.label}</span>
                            {showBadges && child.badge && (
                              <Badge 
                                variant={child.badgeVariant || 'secondary'} 
                                className="ml-auto text-xs"
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link href={item.href!}>
                  <Button
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={cn(
                      "whitespace-nowrap",
                      activeSection === item.id && "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => onSectionChange?.(item.id)}
                  >
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                    {showBadges && item.badge && (
                      <Badge 
                        variant={item.badgeVariant || 'secondary'} 
                        className="ml-1 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    )
  }

  const renderBreadcrumbNavigation = () => {
    const getBreadcrumbPath = (itemId: string): NavigationItem[] => {
      const findItem = (items: NavigationItem[], targetId: string): NavigationItem[] => {
        for (const item of items) {
          if (item.id === targetId) {
            return [item]
          }
          if (item.children) {
            const childPath = findItem(item.children, targetId)
            if (childPath.length > 0) {
              return [item, ...childPath]
            }
          }
        }
        return []
      }
      return findItem(navigationItems, itemId)
    }

    const breadcrumbPath = getBreadcrumbPath(activeSection)

    return (
      <nav className={cn("flex items-center space-x-2 text-sm", className)}>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        {breadcrumbPath.map((item, index) => (
          <React.Fragment key={item.id}>
            <span className="text-gray-400">/</span>
            {index === breadcrumbPath.length - 1 ? (
              <span className="font-medium text-gray-900 flex items-center gap-1">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link href={item.href!}>
                <Button variant="ghost" size="sm">
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </Button>
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    )
  }

  const renderFloatingNavigation = () => {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <div className="bg-white border rounded-lg shadow-lg p-2 space-y-1">
          {navigationItems.slice(0, 4).map((item) => (
            <Link key={item.id} href={item.href!}>
              <Button
                variant={activeSection === item.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  activeSection === item.id && "bg-green-600 hover:bg-green-700",
                  compact && "p-2"
                )}
                onClick={() => onSectionChange?.(item.id)}
              >
                {item.icon}
                <span className="ml-1">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  switch (variant) {
    case 'tabs':
      return renderTabNavigation()
    case 'breadcrumb':
      return renderBreadcrumbNavigation()
    case 'floating':
      return renderFloatingNavigation()
    case 'sidebar':
    default:
      return renderSidebarNavigation()
  }
}

export type { HealthierSGNavigationProps, NavigationItem }