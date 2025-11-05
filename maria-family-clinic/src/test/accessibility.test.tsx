import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DoctorCard } from '@/components/healthcare/doctor-card'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Form inputs should have proper labels', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" />
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Card should have proper structure', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('DoctorCard should have no accessibility violations', async () => {
    const { container } = render(
      <DoctorCard
        doctor={{
          id: '1',
          name: 'Sarah Smith',
          specialty: 'Cardiology',
          qualifications: 'MD, FACC',
          rating: 4.8,
        }}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Disabled buttons should be properly announced', async () => {
    const { container } = render(<Button disabled>Disabled</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
