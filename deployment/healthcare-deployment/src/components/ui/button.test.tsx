import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'
import userEvent from '@testing-library/user-event'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    const handleClick = () => {
      clicked = true
    }

    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    
    await user.click(button)
    expect(clicked).toBe(true)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
  })

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')

    rerender(<Button variant="outline">Cancel</Button>)
    expect(screen.getByRole('button', { name: /cancel/i })).toHaveClass('border')

    rerender(<Button variant="success">Confirm</Button>)
    expect(screen.getByRole('button', { name: /confirm/i })).toHaveClass('bg-success')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button', { name: /small/i })).toHaveClass('h-9')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button', { name: /large/i })).toHaveClass('h-11')
  })

  it('has proper keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Button>Press Enter</Button>)
    const button = screen.getByRole('button', { name: /press enter/i })
    
    await user.tab()
    expect(button).toHaveFocus()
  })

  it('has proper ARIA attributes', () => {
    render(<Button aria-label="Close dialog">X</Button>)
    expect(screen.getByLabelText(/close dialog/i)).toBeInTheDocument()
  })
})
