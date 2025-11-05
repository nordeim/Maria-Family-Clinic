# Development Guidelines

## Overview

These guidelines establish the development standards, practices, and procedures for the My Family Clinic platform. They ensure code quality, consistency, maintainability, and adherence to healthcare software development best practices.

## Code Style & Standards

### TypeScript Configuration

#### TypeScript Setup
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/server/*": ["./src/server/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Strict TypeScript Rules
```typescript
// Always use strict type checking
const strictConfig = {
  // Enable all strict checks
  strict: true,
  
  // No implicit any
  noImplicitAny: true,
  
  // No implicit this
  noImplicitThis: true,
  
  // Always strict null checks
  strictNullChecks: true,
  
  // Strict function types
  strictFunctionTypes: true,
  
  // Strict property initialization
  strictPropertyInitialization: true,
  
  // No implicit returns
  noImplicitReturns: true,
  
  // No fallthrough cases in switch
  noFallthroughCasesInSwitch: true,
  
  // No unchecked indexed access
  noUncheckedIndexedAccess: true,
  
  // Exact optional property types
  exactOptionalPropertyTypes: true,
};
```

### ESLint Configuration

#### ESLint Rules
```javascript
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'jsx-a11y',
    'react-hooks',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // React specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger': 'warn',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-unknown-property': 'error',
    
    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/interactive-supports-focus': 'error',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    
    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};
```

### Prettier Configuration

#### Code Formatting
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "bracketSameLine": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

## Component Development Patterns

### React Component Guidelines

#### Functional Components with TypeScript
```typescript
// Preferred: Functional components with hooks
interface DoctorCardProps {
  doctor: Doctor;
  onSelect?: (doctorId: string) => void;
  isSelected?: boolean;
  className?: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onSelect,
  isSelected = false,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Use proper hooks pattern
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: availability } = useDoctorAvailability(doctor.id);
  
  // Handle click events properly
  const handleCardClick = useCallback(() => {
    if (onSelect) {
      onSelect(doctor.id);
    }
  }, [doctor.id, onSelect]);
  
  // Render with proper accessibility
  return (
    <article
      className={`doctor-card ${className} ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={t('doctor.card.label', { name: doctor.name })}
      aria-expanded={isExpanded}
    >
      <header className="doctor-card__header">
        <img
          src={doctor.profile?.photo || '/default-doctor.png'}
          alt={`Dr. ${doctor.name}`}
          className="doctor-card__photo"
          loading="lazy"
        />
        <div className="doctor-card__info">
          <h3 className="doctor-card__name">{doctor.name}</h3>
          <p className="doctor-card__specialty">
            {doctor.specialties.join(', ')}
          </p>
        </div>
      </header>
      
      <div className="doctor-card__details">
        <div className="doctor-card__rating">
          <StarRating rating={doctor.rating} />
          <span>({doctor.reviewCount} reviews)</span>
        </div>
        
        {availability && (
          <div className="doctor-card__availability">
            <span className="availability-label">Next available:</span>
            <time dateTime={availability.date}>
              {format(new Date(availability.date), 'MMM d, yyyy')}
            </time>
          </div>
        )}
      </div>
      
      <button
        className="doctor-card__expand"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        aria-expanded={isExpanded}
        aria-controls={`doctor-${doctor.id}-details`}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
      
      {isExpanded && (
        <div
          id={`doctor-${doctor.id}-details`}
          className="doctor-card__expanded"
        >
          <p className="doctor-card__bio">{doctor.profile?.bio}</p>
          <div className="doctor-card__languages">
            <h4>Languages:</h4>
            <ul>
              {doctor.languages.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
};
```

#### Custom Hooks Pattern
```typescript
// Use custom hooks for business logic
export const useDoctorSearch = (filters: DoctorSearchFilters) => {
  const [queryKey, setQueryKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { data: doctors, pagination } = useQuery({
    queryKey: ['doctors', filters, queryKey],
    queryFn: () => doctorService.search({ ...filters, query: queryKey }),
    enabled: !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const search = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQueryKey(searchQuery);
    
    try {
      await refetch();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [refetch]);
  
  return {
    doctors: doctors || [],
    pagination,
    isLoading,
    error,
    search,
    queryKey,
  };
};
```

### Component Composition Patterns

#### Compound Components
```typescript
// Modal component with composition pattern
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModalContext = createContext<{
  onClose: () => void;
}>({ onClose: () => {} });

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;
  
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className={`modal-content modal-content--${size}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

Modal.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-footer">{children}</div>
);

// Usage
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>
    <h2>Confirm Appointment</h2>
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to book this appointment?</p>
  </Modal.Body>
  <Modal.Footer>
    <button onClick={onClose}>Cancel</button>
    <button onClick={handleConfirm}>Confirm</button>
  </Modal.Footer>
</Modal>
```

#### Render Props Pattern
```typescript
// Data fetching component with render props
interface DataFetchProps<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  children: (data: {
    data: T;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export const DataFetch = <T,>({
  queryKey,
  queryFn,
  loading = <div>Loading...</div>,
  error = <div>Error occurred</div>,
  children,
}: DataFetchProps<T>) => {
  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn,
  });
  
  if (isLoading) return loading;
  if (queryError) return error;
  
  return children({
    data: data!,
    isLoading,
    error: queryError,
    refetch,
  });
};

// Usage
<DataFetch
  queryKey={['clinics', filters]}
  queryFn={() => clinicService.getAll(filters)}
>
  {({ data, isLoading, refetch }) => (
    <ClinicList clinics={data} onRefresh={refetch} />
  )}
</DataFetch>
```

---

## Accessibility Guidelines

### WCAG 2.2 AA Compliance

#### Semantic HTML Structure
```html
<!-- Proper heading hierarchy -->
<main>
  <h1>Book an Appointment</h1>
  
  <section aria-labelledby="clinic-selection">
    <h2 id="clinic-selection">Select a Clinic</h2>
    <!-- Content -->
  </section>
  
  <section aria-labelledby="doctor-selection">
    <h2 id="doctor-selection">Choose a Doctor</h2>
    <!-- Content -->
  </section>
</main>

<!-- Proper form labels and descriptions -->
<form>
  <div className="form-field">
    <label htmlFor="email">Email Address</label>
    <input
      type="email"
      id="email"
      name="email"
      aria-describedby="email-help"
      aria-required="true"
    />
    <p id="email-help" className="field-description">
      We'll use this to send your appointment confirmation
    </p>
  </div>
  
  <div className="form-field">
    <fieldset>
      <legend>Preferred Contact Method</legend>
      <div className="radio-group">
        <input type="radio" id="email-contact" name="contact" value="email" />
        <label htmlFor="email-contact">Email</label>
        
        <input type="radio" id="phone-contact" name="contact" value="phone" />
        <label htmlFor="phone-contact">Phone</label>
      </div>
    </fieldset>
  </div>
</form>

<!-- Proper button semantics -->
<button type="button" onClick={handleAction}>
  Book Appointment
</button>

<button type="button" onClick={handleAction} aria-describedby="button-help">
  Submit Form
</button>
<p id="button-help" className="button-description">
  This will submit your appointment request
</p>

<!-- Loading states with aria-live -->
<div role="status" aria-live="polite" aria-busy={isLoading}>
  {isLoading && (
    <div className="loading-spinner">
      <span className="sr-only">Loading clinics...</span>
    </div>
  )}
</div>

<!-- Error states -->
<div role="alert" aria-live="assertive">
  {error && (
    <div className="error-message">
      <h3>Error</h3>
      <p>{error.message}</p>
    </div>
  )}
</div>

<!-- Skip links for keyboard navigation -->
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<!-- Focus management -->
<div
  ref={focusRef}
  tabIndex={-1}
  className="focused-element"
>
  This element will receive focus
</div>
```

#### ARIA Attributes Usage
```typescript
// Proper ARIA implementation in React components
const AccessibleDropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  label,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => prev > 0 ? prev - 1 : prev);
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(options[focusedIndex]);
          setIsOpen(false);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isOpen, focusedIndex, options, onSelect]);
  
  return (
    <div
      ref={dropdownRef}
      className="dropdown"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={label}
      tabIndex={0}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={handleKeyDown}
    >
      <span className="dropdown-display">
        {focusedIndex >= 0 ? options[focusedIndex].label : 'Select an option'}
      </span>
      
      {isOpen && (
        <ul
          role="listbox"
          className="dropdown-options"
          aria-label={label}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={index === focusedIndex}
              className={index === focusedIndex ? 'focused' : ''}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### Color and Contrast Guidelines

#### Color Accessibility
```css
/* Ensure sufficient contrast ratios */
:root {
  /* Primary colors with WCAG AA compliance */
  --color-primary: #0056b3;
  --color-primary-contrast: #ffffff;
  --color-primary-hover: #004494;
  --color-primary-focus: #003366;
  
  /* Text colors */
  --color-text-primary: #1a1a1a; /* 15.75:1 contrast on white */
  --color-text-secondary: #4a4a4a; /* 7.5:1 contrast on white */
  --color-text-muted: #757575; /* 4.5:1 contrast on white */
  
  /* Background colors */
  --color-background: #ffffff;
  --color-background-secondary: #f8f9fa;
  --color-background-tertiary: #e9ecef;
  
  /* Border colors */
  --color-border: #dee2e6;
  --color-border-focus: #0056b3;
  --color-border-error: #dc3545;
  --color-border-success: #28a745;
  
  /* Status colors with proper contrast */
  --color-error: #dc3545;
  --color-error-text: #ffffff; /* 6.25:1 contrast */
  --color-success: #28a745;
  --color-success-text: #ffffff; /* 6.25:1 contrast */
  --color-warning: #ffc107;
  --color-warning-text: #1a1a1a; /* 13.33:1 contrast */
  
  /* Interactive states */
  --color-focus: #0056b3;
  --color-focus-ring: rgba(0, 86, 179, 0.25);
}

/* Focus indicators */
.focusable:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--color-focus-ring);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #000000;
    --color-background: #ffffff;
    --color-border: #000000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Testing Standards

### Unit Testing with Vitest

#### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};
```

#### Component Testing Patterns
```typescript
// Component testing with proper accessibility testing
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorProvider } from '@/test/providers/DoctorProvider';

describe('DoctorCard', () => {
  const mockDoctor = {
    id: '1',
    name: 'Dr. John Smith',
    specialties: ['Cardiology', 'Internal Medicine'],
    rating: 4.5,
    reviewCount: 25,
    profile: {
      bio: 'Experienced cardiologist with 15 years of practice',
      photo: '/doctor.jpg',
    },
    languages: ['English', 'Chinese'],
  };

  it('should render doctor information correctly', () => {
    render(
      <DoctorProvider>
        <DoctorCard doctor={mockDoctor} />
      </DoctorProvider>
    );
    
    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    expect(screen.getByText('Cardiology, Internal Medicine')).toBeInTheDocument();
    expect(screen.getByText('(25 reviews)')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const onSelect = vi.fn();
    
    render(
      <DoctorProvider>
        <DoctorCard doctor={mockDoctor} onSelect={onSelect} />
      </DoctorProvider>
    );
    
    const card = screen.getByRole('button', { name: /Dr\. John Smith/i });
    
    fireEvent.click(card);
    
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('1');
    });
  });

  it('should be keyboard accessible', () => {
    render(
      <DoctorProvider>
        <DoctorCard doctor={mockDoctor} onSelect={vi.fn()} />
      </DoctorProvider>
    );
    
    const card = screen.getByRole('button', { name: /Dr\. John Smith/i });
    
    expect(card).toHaveAttribute('tabIndex', '0');
    
    // Test keyboard navigation
    fireEvent.keyDown(card, { key: 'Enter' });
    
    // Component should handle keyboard events
    expect(card).toBeInTheDocument();
  });

  it('should display rating with proper ARIA labels', () => {
    render(
      <DoctorProvider>
        <DoctorCard doctor={mockDoctor} />
      </DoctorProvider>
    );
    
    const rating = screen.getByLabelText(/4\.5 out of 5 stars/i);
    expect(rating).toBeInTheDocument();
  });

  it('should expand content when expand button is clicked', async () => {
    render(
      <DoctorProvider>
        <DoctorCard doctor={mockDoctor} />
      </DoctorProvider>
    );
    
    const expandButton = screen.getByRole('button', { name: 'Show more' });
    
    fireEvent.click(expandButton);
    
    await waitFor(() => {
      expect(screen.getByText('Experienced cardiologist with 15 years of practice')).toBeInTheDocument();
      expect(screen.getByText('Languages:')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });
});
```

#### Hook Testing Patterns
```typescript
// Custom hook testing
import { renderHook, act } from '@testing-library/react';
import { useDoctorSearch } from '@/hooks/useDoctorSearch';
import { DoctorProvider } from '@/test/providers/DoctorProvider';

describe('useDoctorSearch', () => {
  it('should search doctors with filters', async () => {
    const { result } = renderHook(
      () => useDoctorSearch({ specialty: 'cardiology' }),
      { wrapper: DoctorProvider }
    );
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.doctors).toBeDefined();
    expect(Array.isArray(result.current.doctors)).toBe(true);
  });

  it('should handle search queries', async () => {
    const { result } = renderHook(
      () => useDoctorSearch({}),
      { wrapper: DoctorProvider }
    );
    
    act(() => {
      result.current.search('cardiologist');
    });
    
    expect(result.current.queryKey).toBe('cardiologist');
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock the service to throw an error
    vi.mocked(doctorService.search).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(
      () => useDoctorSearch({}),
      { wrapper: DoctorProvider }
    );
    
    act(() => {
      result.current.search('invalid doctor');
    });
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### Integration Testing

#### API Integration Tests
```typescript
// Integration test for tRPC endpoints
import { describe, it, expect } from 'vitest';
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { doctorRouter } from '@/server/api/routers/doctor';
import { prisma } from '@/server/db';

const createCaller = createCallerFactory(doctorRouter);

describe('Doctor API Integration', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.doctor.deleteMany();
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.doctor.deleteMany();
  });

  it('should create and retrieve a doctor', async () => {
    const mockDoctorData = {
      name: 'Dr. Test Doctor',
      medicalLicense: 'TEST123',
      specialties: ['General Practice'],
      languages: ['English'],
      qualifications: ['MBBS'],
      experience: 10,
    };

    const caller = createCaller({
      user: { id: 'admin-user', role: 'SYSTEM_ADMIN' },
    });

    // Create doctor
    const createdDoctor = await caller.create({
      data: mockDoctorData,
    });

    expect(createdDoctor.name).toBe('Dr. Test Doctor');
    expect(createdDoctor.medicalLicense).toBe('TEST123');

    // Retrieve doctor
    const retrievedDoctor = await caller.getById({
      id: createdDoctor.id,
    });

    expect(retrievedDoctor.id).toBe(createdDoctor.id);
    expect(retrievedDoctor.name).toBe('Dr. Test Doctor');
  });

  it('should validate required fields', async () => {
    const caller = createCaller({
      user: { id: 'admin-user', role: 'SYSTEM_ADMIN' },
    });

    await expect(
      caller.create({
        data: {
          name: 'Dr. Incomplete',
          // Missing required fields
        } as any,
      })
    ).rejects.toThrow('Validation error');
  });

  it('should handle pagination correctly', async () => {
    // Create multiple doctors
    const doctors = Array.from({ length: 15 }, (_, i) => ({
      name: `Dr. Doctor ${i + 1}`,
      medicalLicense: `TEST${i + 1}`,
      specialties: ['General Practice'],
      languages: ['English'],
      qualifications: ['MBBS'],
      experience: 10,
    }));

    const caller = createCaller({
      user: { id: 'admin-user', role: 'SYSTEM_ADMIN' },
    });

    // Create all doctors
    for (const doctor of doctors) {
      await caller.create({ data: doctor });
    }

    // Test first page
    const firstPage = await caller.getAll({
      page: 1,
      limit: 10,
    });

    expect(firstPage.data).toHaveLength(10);
    expect(firstPage.pagination.page).toBe(1);
    expect(firstPage.pagination.total).toBe(15);
    expect(firstPage.pagination.pages).toBe(2);

    // Test second page
    const secondPage = await caller.getAll({
      page: 2,
      limit: 10,
    });

    expect(secondPage.data).toHaveLength(5);
    expect(secondPage.pagination.page).toBe(2);
  });
});
```

### End-to-End Testing

#### E2E Test Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Examples
```typescript
// e2e/appointment-booking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Appointment Booking Flow', () => {
  test('should complete appointment booking process', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Search for clinics
    await page.click('[data-testid="search-clinics"]');
    await page.fill('[data-testid="search-input"]', 'cardiology');
    await page.click('[data-testid="search-button"]');
    
    // Verify search results
    await expect(page.locator('[data-testid="clinic-card"]')).toHaveCount(5);
    
    // Select a clinic
    await page.click('[data-testid="clinic-card"]:first-child');
    
    // Verify clinic details page
    await expect(page.locator('h1')).toContainText('Clinic Name');
    await expect(page.locator('[data-testid="doctor-list"]')).toBeVisible();
    
    // Select a doctor
    await page.click('[data-testid="doctor-card"]:first-child');
    
    // Check doctor availability
    await expect(page.locator('[data-testid="availability-calendar"]')).toBeVisible();
    
    // Select appointment date
    await page.click('[data-testid="available-slot"]:first-child');
    
    // Fill patient details
    await page.fill('[data-testid="patient-name"]', 'John Doe');
    await page.fill('[data-testid="patient-email"]', 'john@example.com');
    await page.fill('[data-testid="patient-phone"]', '+65-1234-5678');
    
    // Confirm booking
    await page.click('[data-testid="confirm-booking"]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirmation-number"]')).toBeVisible();
  });

  test('should handle accessibility requirements', async ({ page }) => {
    await page.goto('/');
    
    // Check for skip links
    await expect(page.locator('a.skip-link')).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="skip-link"]')).toBeFocused();
    
    // Test form accessibility
    await page.goto('/book-appointment');
    const form = page.locator('form');
    await expect(form.locator('label')).toHaveCount(4); // All form fields should have labels
    
    // Test ARIA attributes
    await expect(page.locator('[role="status"][aria-live="polite"]')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate and test mobile-specific interactions
    await page.goto('/');
    await page.tap('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    
    // Test mobile appointment booking
    await page.tap('[data-testid="book-appointment"]');
    await expect(page.locator('[data-testid="appointment-form"]')).toBeVisible();
    
    // Fill form using mobile-friendly inputs
    await page.tap('[data-testid="clinic-selector"]');
    await page.tap('[data-testid="clinic-option"]:first-child');
    
    // Test mobile calendar
    await page.tap('[data-testid="date-selector"]');
    await expect(page.locator('[data-testid="mobile-calendar"]')).toBeVisible();
  });
});
```

---

## Git Workflow & Branching Strategy

### Branch Strategy

#### Git Flow Implementation
```bash
# Main branches
main                 # Production-ready code
develop             # Integration branch for features

# Feature branches
feature/*           # New features and enhancements
bugfix/*           # Bug fixes for current release
hotfix/*           # Critical fixes for production

# Release branches
release/*          # Release preparation and testing
```

#### Branch Naming Conventions
```bash
# Feature branches
feature/doctor-search-functionality
feature/appointment-reminder-system
feature/healthier-sg-integration

# Bug fix branches
bugfix/appointment-cancellation-error
bugfix/search-filter-not-working
bugfix/mobile-calendar-display

# Hot fix branches
hotfix/security-vulnerability-fix
hotfix/production-data-corruption
hotfix/critical-payment-failure

# Release branches
release/v1.2.0
release/v1.1.0
```

### Commit Message Standards

#### Conventional Commits Format
```typescript
// Commit message structure
type(scope?): subject

body?

footer?
```

#### Commit Types
```bash
# Feature development
feat: add doctor search functionality
feat(clinic): implement clinic rating system
feat(appointment): add appointment rescheduling feature

# Bug fixes
fix: resolve appointment booking timeout issue
fix(security): patch XSS vulnerability in contact form
fix(ui): correct button alignment on mobile

# Documentation
docs: update API documentation for doctor endpoints
docs(README): add installation instructions
docs(workflow): document code review process

# Refactoring
refactor: simplify appointment validation logic
refactor(api): optimize database queries in doctor service
refactor(ui): remove unused CSS classes

# Performance improvements
perf: optimize clinic search query performance
perf(ui): implement virtual scrolling for large lists
perf(cache): add Redis caching for doctor availability

# Testing
test: add unit tests for appointment booking flow
test(integration): add E2E tests for clinic search
test(api): add integration tests for doctor endpoints

# Build and CI/CD
build: update dependencies to latest versions
build: add Docker containerization
ci: implement automated security scanning
ci: add performance testing pipeline

# Security
security: implement rate limiting for API endpoints
security: add CSRF protection to forms
security: update encryption library version

# Database changes
db: add indexes for appointment queries
db: migrate clinic table to support PostGIS
db: add audit logging triggers

# Revert commits
revert: feat: add appointment reminders
// This reverts commit 1234567890abcdef1234567890abcdef12345678
```

#### Commit Message Examples
```bash
# Good commit messages
feat(appointment): add confirmation email after booking
- Implement email confirmation service
- Add email template for appointment confirmations
- Include appointment details and clinic information
- Test email delivery with various email providers

fix(security): resolve XSS vulnerability in contact form
- Sanitize user input in contact form fields
- Add input validation for all form fields
- Implement Content Security Policy headers
- Fixes CVE-2024-XXXXX

perf(search): optimize doctor search query performance
- Add database indexes for frequently queried fields
- Implement query result caching with Redis
- Reduce search response time from 2.1s to 0.3s
- Benchmarked with 10,000 doctor records

docs(api): document Healthier SG eligibility endpoints
- Add OpenAPI documentation for eligibility assessment
- Include request/response examples
- Document error codes and handling
- Update API changelog

# Bad commit messages
fix bug
update stuff
changes
wip
asdf
```

### Pull Request Guidelines

#### PR Template
```markdown
<!-- .github/pull_request_template.md -->
## Description
Brief description of changes made in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update
- [ ] Security fix (non-breaking change which resolves a security vulnerability)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed (if applicable)

## Security
- [ ] No sensitive data exposed
- [ ] Authentication/authorization tested
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection implemented

## Accessibility
- [ ] WCAG 2.2 AA compliance verified
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility tested
- [ ] Color contrast meets requirements
- [ ] Focus management implemented

## Performance
- [ ] No performance regressions introduced
- [ ] Bundle size impact assessed
- [ ] Database query optimization verified
- [ ] Caching strategy implemented where applicable

## Documentation
- [ ] Code comments added for complex logic
- [ ] API documentation updated
- [ ] User-facing documentation updated
- [ ] README.md updated if needed

## Screenshots/Videos
If this PR includes UI changes, please add screenshots or screen recordings.

## Related Issues
Closes #issue_number

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

### Code Review Process

#### Review Checklist
```markdown
## Code Review Checklist

### Functionality
- [ ] Code implements the requested feature correctly
- [ ] Edge cases are handled properly
- [ ] Error handling is comprehensive
- [ ] No breaking changes introduced (unless intended)

### Code Quality
- [ ] Code follows established style guidelines
- [ ] Functions are appropriately sized and focused
- [ ] Variable names are descriptive and meaningful
- [ ] No code duplication
- [ ] Proper separation of concerns

### Security
- [ ] Input validation implemented
- [ ] Authentication/authorization checks in place
- [ ] No sensitive data exposure
- [ ] SQL injection prevention
- [ ] XSS protection implemented
- [ ] CSRF protection for state-changing operations

### Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] Unnecessary re-renders avoided
- [ ] Memory leaks prevented
- [ ] Bundle size impact assessed

### Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful and comprehensive
- [ ] Edge cases are tested
- [ ] Integration with existing tests verified
- [ ] Test descriptions are clear

### Accessibility
- [ ] Semantic HTML used appropriately
- [ ] ARIA attributes used correctly
- [ ] Keyboard navigation supported
- [ ] Screen reader compatibility
- [ ] Color contrast requirements met
- [ ] Focus management implemented

### Documentation
- [ ] Code comments added for complex logic
- [ ] Function/variable names are self-documenting
- [ ] API changes documented
- [ ] Breaking changes clearly documented
```

---

## Deployment Procedures

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Check formatting
        run: npm run format:check
        
      - name: Type checking
        run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:coverage
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run security audit
        run: npm audit --audit-level moderate
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-format, unit-tests, security-scan]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: .next/

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [build]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: .next/
          
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [e2e-tests]
    if: github.ref == 'refs/heads/develop'
    
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # Add deployment commands here
          
  deploy-production:
    runs-on: ubuntu-latest
    needs: [e2e-tests]
    if: github.ref == 'refs/heads/main'
    
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # Add deployment commands here
```

### Environment Configuration

#### Environment-Specific Configurations
```typescript
// src/config/environments.ts
export const environments = {
  development: {
    NODE_ENV: 'development',
    DATABASE_URL: process.env.DATABASE_URL_DEV,
    REDIS_URL: process.env.REDIS_URL_DEV,
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET_DEV,
    LOG_LEVEL: 'debug',
    ENABLE_DEBUG: true,
    MOCK_EXTERNAL_SERVICES: true,
    ENABLE_PERFORMANCE_MONITORING: false,
  },
  
  staging: {
    NODE_ENV: 'staging',
    DATABASE_URL: process.env.DATABASE_URL_STAGING,
    REDIS_URL: process.env.REDIS_URL_STAGING,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL_STAGING,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET_STAGING,
    LOG_LEVEL: 'info',
    ENABLE_DEBUG: false,
    MOCK_EXTERNAL_SERVICES: false,
    ENABLE_PERFORMANCE_MONITORING: true,
  },
  
  production: {
    NODE_ENV: 'production',
    DATABASE_URL: process.env.DATABASE_URL_PROD,
    REDIS_URL: process.env.REDIS_URL_PROD,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL_PROD,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET_PROD,
    LOG_LEVEL: 'warn',
    ENABLE_DEBUG: false,
    MOCK_EXTERNAL_SERVICES: false,
    ENABLE_PERFORMANCE_MONITORING: true,
  },
};

export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env as keyof typeof environments];
};
```

### Rollback Procedures

#### Automated Rollback Process
```typescript
// scripts/rollback.ts
import { execSync } from 'child_process';

interface RollbackOptions {
  environment: 'staging' | 'production';
  version?: string;
  force?: boolean;
}

class RollbackManager {
  async rollback(options: RollbackOptions): Promise<void> {
    const { environment, version, force = false } = options;
    
    console.log(`Initiating rollback for ${environment} environment`);
    
    if (!force && !this.confirmRollback()) {
      console.log('Rollback cancelled');
      return;
    }
    
    try {
      // 1. Backup current state
      await this.backupCurrentState(environment);
      
      // 2. Revert database migrations if needed
      if (await this.hasDatabaseChanges(environment)) {
        await this.revertDatabaseMigrations(environment);
      }
      
      // 3. Rollback application deployment
      await this.rollbackApplication(environment, version);
      
      // 4. Verify rollback
      await this.verifyRollback(environment);
      
      // 5. Clear caches
      await this.clearCaches(environment);
      
      console.log(`Rollback completed successfully for ${environment}`);
      
    } catch (error) {
      console.error(`Rollback failed: ${error}`);
      await this.handleRollbackFailure(environment, error);
      throw error;
    }
  }
  
  private async verifyRollback(environment: string): Promise<void> {
    const checks = [
      this.checkApplicationHealth(environment),
      this.checkDatabaseConnectivity(environment),
      this.checkCriticalEndpoints(environment),
      this.verifyDataIntegrity(environment),
    ];
    
    const results = await Promise.all(checks);
    const failedChecks = results.filter(result => !result.success);
    
    if (failedChecks.length > 0) {
      throw new Error(`Rollback verification failed: ${failedChecks.map(c => c.message).join(', ')}`);
    }
  }
  
  private async handleRollbackFailure(environment: string, error: Error): Promise<void> {
    console.error(`Handling rollback failure for ${environment}`);
    
    // Log the failure
    await this.logRollbackFailure(environment, error);
    
    // Notify operations team
    await this.notifyOperationsTeam(environment, error);
    
    // Attempt manual intervention if needed
    if (error.message.includes('critical')) {
      await this.triggerManualIntervention(environment);
    }
  }
}
```

---

## Performance Optimization

### Code Splitting & Lazy Loading

#### Dynamic Imports
```typescript
// Route-based code splitting
import dynamic from 'next/dynamic';

const DoctorList = dynamic(
  () => import('@/components/DoctorList'),
  {
    loading: () => <DoctorListSkeleton />,
    ssr: false, // Disable SSR for client-heavy components
  }
);

const AdminDashboard = dynamic(
  () => import('@/pages/admin/dashboard'),
  {
    loading: () => <div>Loading dashboard...</div>,
    ssr: true, // Enable SSR for SEO-critical pages
  }
);

// Component-level lazy loading
const HeavyAnalyticsComponent = dynamic(
  () => import('@/components/Analytics/HeavyChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
```

#### Optimized Bundle Management
```typescript
// next.config.ts
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['images.myfamilyclinic.sg'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 1 day
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    // Analyze bundle size in development
    if (dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    // Optimize for production
    if (!dev && !isServer) {
      // Split vendor bundles
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      };
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
};
```

### Database Query Optimization

#### Efficient Query Patterns
```typescript
// Use select to limit returned fields
const doctor = await prisma.doctor.findUnique({
  select: {
    id: true,
    name: true,
    specialties: true,
    rating: true,
    profile: {
      select: {
        photo: true,
        bio: true,
      },
    },
  },
  where: { id: doctorId },
});

// Use include sparingly and selectively
const clinicWithDoctors = await prisma.clinic.findUnique({
  include: {
    doctors: {
      select: {
        id: true,
        name: true,
        specialties: true,
      },
    },
    services: {
      select: {
        id: true,
        name: true,
        price: true,
      },
    },
  },
  where: { id: clinicId },
});

// Batch queries for related data
const clinicIds = clinics.map(c => c.id);
const [clinicServices, clinicOperatingHours] = await Promise.all([
  prisma.clinicService.findMany({
    where: { clinicId: { in: clinicIds } },
    select: {
      clinicId: true,
      service: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  }),
  prisma.operatingHours.findMany({
    where: { clinicId: { in: clinicIds } },
  }),
]);
```

#### Query Performance Monitoring
```typescript
// Query performance logger
class QueryPerformanceMonitor {
  async logQuery(query: string, duration: number, params?: any): Promise<void> {
    // Log slow queries
    if (duration > 1000) {
      console.warn(`Slow query detected (${duration}ms):`, {
        query: query.substring(0, 200),
        duration,
        params,
        timestamp: new Date(),
      });
    }
    
    // Store metrics for monitoring
    await this.storeMetrics({
      query: this.hashQuery(query),
      duration,
      timestamp: new Date(),
      paramsCount: params ? Object.keys(params).length : 0,
    });
  }
  
  async analyzeQueryPatterns(): Promise<QueryAnalysis> {
    const metrics = await this.getRecentMetrics();
    
    return {
      slowQueries: metrics.filter(m => m.duration > 1000),
      frequentQueries: this.groupByQuery(metrics),
      optimizationSuggestions: await this.generateSuggestions(metrics),
    };
  }
}
```

---

## Code Documentation Standards

### JSDoc Comments

#### Function Documentation
```typescript
/**
 * Searches for doctors based on provided criteria
 * 
 * @param filters - Search criteria including specialty, location, availability
 * @param pagination - Pagination parameters (page, limit)
 * @param sorting - Sort options (field, direction)
 * 
 * @returns Promise containing paginated doctor results with metadata
 * 
 * @throws {ValidationError} When invalid filters are provided
 * @throws {DatabaseError} When database operation fails
 * 
 * @example
 * ```typescript
 * const doctors = await searchDoctors({
 *   filters: {
 *     specialty: 'cardiology',
 *     location: { lat: 1.3521, lng: 103.8198, radius: 10 },
 *     isAvailable: true,
 *   },
 *   pagination: { page: 1, limit: 20 },
 *   sorting: { field: 'rating', direction: 'desc' },
 * });
 * ```
 * 
 * @since 1.0.0
 * @deprecated Use {@link DoctorSearchService.searchDoctors} instead
 */
export async function searchDoctors(
  filters: DoctorSearchFilters,
  pagination: PaginationOptions = { page: 1, limit: 10 },
  sorting: SortOptions = { field: 'name', direction: 'asc' }
): Promise<PaginatedResult<Doctor>> {
  // Implementation
}

/**
 * Represents search filters for finding doctors
 * 
 * @property {string[]} [specialties] - Medical specialties to filter by
 * @property {LocationFilter} [location] - Geographic location filter
 * @property {boolean} [isAvailable] - Filter by current availability
 * @property {string} [searchQuery] - Text search in name and bio
 */
interface DoctorSearchFilters {
  specialties?: string[];
  location?: LocationFilter;
  isAvailable?: boolean;
  searchQuery?: string;
}
```

#### Complex Algorithm Documentation
```typescript
/**
 * Calculates optimal doctor matching score based on multiple factors
 * 
 * The algorithm uses a weighted scoring system:
 * 1. Specialty match (40% weight) - Exact matches get full points
 * 2. Distance factor (30% weight) - Closer doctors score higher
 * 3. Availability (20% weight) - Available doctors preferred
 * 4. Rating (10% weight) - Higher rated doctors get slight boost
 * 
 * Formula: score = (specialtyMatch * 0.4) + (distanceScore * 0.3) + 
 *           (availabilityScore * 0.2) + (ratingScore * 0.1)
 * 
 * @param doctor - Doctor candidate to score
 * @param criteria - User's search criteria
 * @param userLocation - User's current location
 * 
 * @returns Score between 0 and 1, where 1 is the best match
 * 
 * @example
 * ```typescript
 * const score = calculateDoctorMatchScore(
 *   doctor,
 *   { specialties: ['cardiology'] },
 *   { lat: 1.3521, lng: 103.8198 }
 * );
 * // Returns: 0.85 (high cardiology match, good distance, available)
 * ```
 */
function calculateDoctorMatchScore(
  doctor: Doctor,
  criteria: SearchCriteria,
  userLocation: Coordinates
): number {
  // Specialty matching
  const specialtyScore = calculateSpecialtyMatch(doctor, criteria.specialties);
  
  // Distance calculation
  const distance = calculateDistance(doctor.clinic.latitude, doctor.clinic.longitude, userLocation);
  const distanceScore = Math.max(0, 1 - (distance / 50)); // 50km max range
  
  // Availability
  const availabilityScore = doctor.isAvailable ? 1 : 0;
  
  // Rating normalization
  const ratingScore = doctor.rating / 5;
  
  // Weighted final score
  return (
    (specialtyScore * 0.4) +
    (distanceScore * 0.3) +
    (availabilityScore * 0.2) +
    (ratingScore * 0.1)
  );
}
```

### README Documentation

#### Component README Template
```markdown
# DoctorCard Component

## Overview

A reusable React component that displays doctor information in a card format, supporting both list and detailed views with accessibility features.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `doctor` | `Doctor` | - | Doctor data object |
| `onSelect` | `(id: string) => void` | - | Callback when doctor is selected |
| `isSelected` | `boolean` | `false` | Whether the card appears selected |
| `variant` | `'default' \| 'compact'` | `'default'` | Display variant |
| `showAvailability` | `boolean` | `true` | Show availability information |
| `className` | `string` | `''` | Additional CSS classes |

## Usage

```tsx
import { DoctorCard } from '@/components/DoctorCard';

function DoctorList({ doctors, onDoctorSelect }) {
  return (
    <div className="doctor-list">
      {doctors.map(doctor => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          onSelect={onDoctorSelect}
          variant="default"
          showAvailability={true}
        />
      ))}
    </div>
  );
}
```

## Accessibility

- Uses semantic HTML (`<article>` element)
- Supports keyboard navigation (Enter/Space to select)
- Includes proper ARIA labels and descriptions
- Provides visual and textual feedback for selection state
- Images include descriptive alt text
- Focus management implemented for screen readers

## Styling

The component uses Tailwind CSS classes with the following structure:

- `doctor-card` - Base card styling
- `doctor-card--selected` - Selected state styling
- `doctor-card__header` - Header section
- `doctor-card__photo` - Doctor photo
- `doctor-card__info` - Doctor information
- `doctor-card__rating` - Rating display
- `doctor-card__availability` - Availability information

## Performance

- Images are lazy-loaded using Next.js Image component
- Click handlers are memoized to prevent unnecessary re-renders
- Rating component is optimized for minimal DOM updates

## Testing

```bash
# Run component tests
npm run test:unit -- --testPathPattern=DoctorCard

# Run accessibility tests
npm run test:a11y -- DoctorCard

# Run visual regression tests
npm run test:visual -- DoctorCard
```

## Related Components

- [`DoctorList`](./DoctorList.md) - Container component for multiple DoctorCards
- [`DoctorFilters`](./DoctorFilters.md) - Search and filter controls
- [`DoctorAvailability`](./DoctorAvailability.md) - Availability calendar component

## Changelog

### v2.1.0
- Added compact variant
- Improved accessibility with ARIA labels
- Enhanced keyboard navigation

### v2.0.0
- Complete component refactor
- Added TypeScript support
- Improved accessibility features

## License

MIT License - see [LICENSE.md](../../LICENSE.md) for details.
```

---

## Performance Monitoring & Optimization

### Web Vitals Monitoring

#### Core Web Vitals Tracking
```typescript
// lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function trackWebVitals() {
  // Largest Contentful Paint
  getCLS((metric) => {
    console.log('LCP:', metric.value);
    // Send to analytics
    sendToAnalytics('LCP', {
      value: metric.value,
      id: metric.id,
    });
  });

  // First Input Delay
  getFID((metric) => {
    console.log('FID:', metric.value);
    sendToAnalytics('FID', {
      value: metric.value,
      id: metric.id,
    });
  });

  // First Contentful Paint
  getFCP((metric) => {
    console.log('FCP:', metric.value);
    sendToAnalytics('FCP', {
      value: metric.value,
      id: metric.id,
    });
  });

  // Largest Contentful Paint (updated metric)
  getLCP((metric) => {
    console.log('LCP:', metric.value);
    sendToAnalytics('LCP', {
      value: metric.value,
      id: metric.id,
    });
  });

  // Time to First Byte
  getTTFB((metric) => {
    console.log('TTFB:', metric.value);
    sendToAnalytics('TTFB', {
      value: metric.value,
      id: metric.id,
    });
  });
}
```

#### Performance Monitoring Hook
```typescript
// hooks/usePerformanceMonitor.ts
import { useEffect } from 'react';

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log component render time
      console.log(`${componentName} render time: ${renderTime}ms`);
      
      // Send to monitoring service
      if (renderTime > 16) { // > 1 frame at 60fps
        sendToAnalytics('component_render_time', {
          component: componentName,
          renderTime,
          timestamp: Date.now(),
        });
      }
    };
  }, [componentName]);
}

// Usage
function DoctorCard({ doctor }) {
  usePerformanceMonitor('DoctorCard');
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Bundle Size Analysis

#### Bundle Analysis Script
```typescript
// scripts/analyze-bundle.ts
import { analyze } from 'webpack-bundle-analyzer';
import fs from 'fs';
import path from 'path';

async function analyzeBundle() {
  try {
    // Generate bundle stats
    const { build } = await import('../next.config.js');
    
    // Run webpack bundle analyzer
    const results = await analyze({
      stats: './.next/stats.json',
      analyzerMode: 'static',
      openAnalyzer: false,
      outputPath: './bundle-analysis',
    });
    
    // Generate bundle report
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: results.assets.reduce((sum, asset) => sum + asset.size, 0),
      chunks: results.chunks.map(chunk => ({
        name: chunk.names[0],
        size: chunk.size,
        modules: chunk.modules.length,
      })),
      largestAssets: results.assets
        .sort((a, b) => b.size - a.size)
        .slice(0, 10),
      recommendations: generateRecommendations(results),
    };
    
    // Save report
    fs.writeFileSync(
      './bundle-analysis/report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('Bundle analysis completed');
    console.log(`Total bundle size: ${report.totalSize} bytes`);
    console.log('Largest assets:', report.largestAssets.map(a => a.name));
  } catch (error) {
    console.error('Bundle analysis failed:', error);
  }
}

function generateRecommendations(results: any): string[] {
  const recommendations = [];
  
  // Check for large chunks
  const largeChunks = results.chunks.filter((chunk: any) => chunk.size > 500 * 1024);
  if (largeChunks.length > 0) {
    recommendations.push('Consider code splitting to reduce chunk sizes');
  }
  
  // Check for duplicate modules
  const moduleUsage = new Map();
  results.modules.forEach((module: any) => {
    if (module.issuer && module.name) {
      const key = module.name;
      moduleUsage.set(key, (moduleUsage.get(key) || 0) + 1);
    }
  });
  
  const duplicateModules = Array.from(moduleUsage.entries())
    .filter(([, count]) => count > 1);
  
  if (duplicateModules.length > 0) {
    recommendations.push('Remove duplicate dependencies');
  }
  
  return recommendations;
}
```

---

## Conclusion

These development guidelines ensure:

1. **Consistent Code Quality**: Standardized patterns and practices across the codebase
2. **Maintainable Architecture**: Clear component structure and separation of concerns
3. **Accessibility Compliance**: WCAG 2.2 AA compliance built into development process
4. **Comprehensive Testing**: Multiple layers of testing from unit to E2E
5. **Efficient Deployment**: Automated CI/CD with proper rollback procedures
6. **Performance Optimization**: Built-in performance monitoring and optimization
7. **Security-First Development**: Security considerations integrated into all development phases

Following these guidelines will result in a robust, secure, and maintainable healthcare platform that meets the highest standards of quality and compliance.