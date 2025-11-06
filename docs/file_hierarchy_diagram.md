# Maria Family Clinic - File Hierarchy Diagram

## 📁 **Complete Project Structure**

```
Maria-Family-Clinic/
│
├── 📁 healthcare-app-react/                 # Main React frontend application
│   ├── 📄 package.json                      # Node.js dependencies and scripts
│   ├── 📄 tsconfig.json                     # TypeScript configuration
│   ├── 📄 Dockerfile                        # Frontend containerization
│   ├── 📁 public/
│   │   ├── 📄 index.html                    # Main HTML template
│   │   ├── 📄 favicon.ico                   # Site favicon
│   │   └── 📁 assets/                       # Static assets (images, fonts)
│   │
│   ├── 📁 src/                              # Source code directory
│   │   ├── 📄 App.tsx                       # Main React application component
│   │   ├── 📄 index.tsx                     # Application entry point
│   │   ├── 📄 index.css                     # Global styles
│   │   │
│   │   ├── 📁 components/                   # Reusable React components
│   │   │   ├── 📁 AppointmentBooking/       # Appointment scheduling components
│   │   │   │   ├── 📄 Calendar.tsx          # Interactive calendar interface
│   │   │   │   ├── 📄 TimeSlotSelector.tsx  # Available time slots display
│   │   │   │   ├── 📄 BookingForm.tsx       # Appointment booking form
│   │   │   │   └── 📄 ConfirmationModal.tsx # Booking confirmation dialog
│   │   │   │
│   │   │   ├── 📁 PatientDashboard/         # Patient portal components
│   │   │   │   ├── 📄 PatientProfile.tsx    # Patient information display
│   │   │   │   ├── 📄 MedicalHistory.tsx    # Historical medical records
│   │   │   │   ├── 📄 AppointmentList.tsx   # List of upcoming appointments
│   │   │   │   ├── 📄 DocumentUpload.tsx    # File upload interface
│   │   │   │   └── 📄 NotificationCenter.tsx# Real-time notifications
│   │   │   │
│   │   │   ├── 📁 AdminDashboard/           # Healthcare provider interface
│   │   │   │   ├── 📄 AdminOverview.tsx     # Dashboard overview metrics
│   │   │   │   ├── 📄 PatientManagement.tsx # Patient database management
│   │   │   │   ├── 📄 ScheduleManagement.tsx# Provider schedule coordination
│   │   │   │   ├── 📄 AnalyticsPanel.tsx    # Performance analytics display
│   │   │   │   └── 📄 ReportGenerator.tsx   # Automated report generation
│   │   │   │
│   │   │   ├── 📁 ChatInterface/            # AI agent chat components
│   │   │   │   ├── 📄 ChatWindow.tsx        # Main chat interface
│   │   │   │   ├── 📄 MessageInput.tsx      # Message composition area
│   │   │   │   ├── 📄 MessageDisplay.tsx    # Chat message rendering
│   │   │   │   ├── 📄 TypingIndicator.tsx   # AI response indicator
│   │   │   │   ├── 📄 FileAttachment.tsx    # File attachment handling
│   │   │   │   └── 📄 EscalationNotice.tsx  # Human agent escalation alert
│   │   │   │
│   │   │   ├── 📁 Common/                   # Shared UI components
│   │   │   │   ├── 📄 Button.tsx            # Custom button component
│   │   │   │   ├── 📄 Modal.tsx             # Modal dialog wrapper
│   │   │   │   ├── 📄 FormField.tsx         # Form input wrapper
│   │   │   │   ├── 📄 LoadingSpinner.tsx    # Loading state indicator
│   │   │   │   ├── 📄 ErrorBoundary.tsx     # Error handling wrapper
│   │   │   │   └── 📄 Layout.tsx            # Application layout wrapper
│   │   │   │
│   │   │   └── 📁 Navigation/               # Navigation components
│   │   │       ├── 📄 Header.tsx            # Application header
│   │   │       ├── 📄 Sidebar.tsx           # Navigation sidebar
│   │   │       ├── 📄 Breadcrumbs.tsx       # Navigation breadcrumbs
│   │   │       └── 📄 Footer.tsx            # Application footer
│   │   │
│   │   ├── 📁 hooks/                        # Custom React hooks
│   │   │   ├── 📄 useAuth.ts                # Authentication state management
│   │   │   ├── 📄 useAppointments.ts        # Appointment data hooks
│   │   │   ├── 📄 usePatients.ts            # Patient data management
│   │   │   ├── 📄 useChat.ts                # AI chat functionality
│   │   │   ├── 📄 useWebSocket.ts           # Real-time connection management
│   │   │   ├── 📄 useLocalStorage.ts        # Client-side storage utilities
│   │   │   └── 📄 useNotifications.ts       # Notification management
│   │   │
│   │   ├── 📁 services/                     # API and external service integration
│   │   │   ├── 📄 api.ts                    # RESTful API client
│   │   │   ├── 📄 authService.ts            # Authentication service
│   │   │   ├── 📄 appointmentService.ts     # Appointment management API
│   │   │   ├── 📄 patientService.ts         # Patient data API
│   │   │   ├── 📄 chatService.ts            # AI chat API integration
│   │   │   ├── 📄 websocketService.ts       # WebSocket connection handler
│   │   │   ├── 📄 uploadService.ts          # File upload management
│   │   │   └── 📄 supabaseService.ts        # Supabase integration client
│   │   │
│   │   ├── 📁 types/                        # TypeScript type definitions
│   │   │   ├── 📄 api.ts                    # API response types
│   │   │   ├── 📄 auth.ts                   # Authentication types
│   │   │   ├── 📄 appointments.ts           # Appointment-related types
│   │   │   ├── 📄 patients.ts               # Patient data types
│   │   │   ├── 📄 chat.ts                   # Chat and AI types
│   │   │   ├── 📄 common.ts                 # Common utility types
│   │   │   └── 📄 index.ts                  # Central type exports
│   │   │
│   │   ├── 📁 utils/                        # Utility functions and helpers
│   │   │   ├── 📄 constants.ts              # Application constants
│   │   │   ├── 📄 helpers.ts                # General utility functions
│   │   │   ├── 📄 validation.ts             # Form and data validation
│   │   │   ├── 📄 formatters.ts             # Data formatting utilities
│   │   │   ├── 📄 storage.ts                # Local storage utilities
│   │   │   └── 📄 accessibility.ts          # Accessibility helper functions
│   │   │
│   │   ├── 📁 styles/                       # CSS and styling
│   │   │   ├── 📄 globals.css               # Global CSS variables and resets
│   │   │   ├── 📄 themes.ts                 # Theme configuration
│   │   │   ├── 📄 components.css            # Component-specific styles
│   │   │   └── 📁 animations/               # CSS animations and transitions
│   │   │       └── 📄 loading.css           # Loading state animations
│   │   │
│   │   └── 📁 contexts/                     # React context providers
│   │       ├── 📄 AuthContext.tsx           # Authentication context
│   │       ├── 📄 ThemeContext.tsx          # Theme management context
│   │       ├── 📄 NotificationContext.tsx   # Notification system context
│   │       └── 📄 AppContext.tsx            # Global application state
│   │
│   └── 📁 dist/                             # Built application output
│       ├── 📄 index.html                    # Compiled HTML
│       ├── 📁 assets/                       # Optimized static assets
│       │   ├── 📄 index-[hash].js           # Bundled JavaScript
│       │   ├── 📄 index-[hash].css          # Bundled stylesheets
│       │   └── 📁 images/                   # Optimized images
│       └── 📄 manifest.json                 # PWA manifest
│
├── 📁 customer-support-agent/               # AI agent backend services
│   ├── 📄 Dockerfile                        # Backend containerization
│   ├── 📄 docker-compose.yml               # Service orchestration
│   ├── 📄 requirements.txt                 # Python dependencies
│   ├── 📄 .env.example                     # Environment variables template
│   ├── 📄 main.py                          # FastAPI application entry point
│   │
│   ├── 📁 app/                             # Application source code
│   │   ├── 📄 __init__.py                  # Package initialization
│   │   │
│   │   ├── 📁 agents/                      # AI agent implementations
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 agent_factory.py         # Agent creation factory
│   │   │   ├── 📄 chat_agent.py            # Chat agent implementation
│   │   │   ├── 📄 escalation_agent.py      # Human handoff agent
│   │   │   └── 📄 healthcare_agent.py      # Healthcare-specific agent
│   │   │
│   │   ├── 📁 api/                         # REST API layer
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 dependencies.py          # FastAPI dependency injection
│   │   │   ├── 📄 middleware.py            # Request/response middleware
│   │   │   ├── 📄 exceptions.py            # Custom exception handlers
│   │   │   └── 📁 routes/                  # API endpoint definitions
│   │   │       ├── 📄 __init__.py
│   │   │       ├── 📄 auth.py              # Authentication endpoints
│   │   │       ├── 📄 chat.py              # Chat conversation endpoints
│   │   │       ├── 📄 appointments.py      # Appointment management
│   │   │       ├── 📄 patients.py          # Patient data endpoints
│   │   │       ├── 📄 health.py            # Health check endpoints
│   │   │       ├── 📄 metrics.py           # Prometheus metrics
│   │   │       └── 📄 upload.py            # File upload endpoints
│   │   │
│   │   ├── 📁 core/                        # Core application utilities
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 config.py                # Application configuration
│   │   │   ├── 📄 cache.py                 # Redis cache management
│   │   │   ├── 📄 logging.py               # Structured logging setup
│   │   │   ├── 📄 security.py              # Security utilities
│   │   │   └── 📄 validation.py            # Input validation utilities
│   │   │
│   │   ├── 📁 db/                          # Database layer
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 database.py              # Database connection management
│   │   │   ├── 📄 models.py                # SQLAlchemy database models
│   │   │   ├── 📄 schemas.py               # Pydantic request/response schemas
│   │   │   └── 📁 migrations/              # Database migration files
│   │   │       ├── 📄 versions/            # Alembic migration scripts
│   │   │       └── 📄 env.py               # Migration environment
│   │   │
│   │   ├── 📁 services/                    # Business logic services
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 appointment_service.py   # Appointment business logic
│   │   │   ├── 📄 patient_service.py       # Patient data management
│   │   │   ├── 📄 auth_service.py          # Authentication service
│   │   │   ├── 📄 notification_service.py  # Notification delivery
│   │   │   ├── 📄 ai_service.py            # AI agent service integration
│   │   │   └── 📄 file_service.py          # File upload processing
│   │   │
│   │   ├── 📁 tools/                       # AI agent tools and utilities
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 appointment_tool.py      # Appointment management tool
│   │   │   ├── 📄 patient_tool.py          # Patient data lookup tool
│   │   │   ├── 📄 escalation_tool.py       # Human agent escalation tool
│   │   │   ├── 📄 memory_tool.py           # Conversation memory tool
│   │   │   ├── 📄 rag_tool.py              # RAG knowledge base tool
│   │   │   └── 📄 attachment_tool.py       # File processing tool
│   │   │
│   │   ├── 📁 vector_store/                # Vector database integration
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 chroma_client.py         # ChromaDB client wrapper
│   │   │   ├── 📄 embeddings.py            # Embedding model integration
│   │   │   ├── 📄 knowledge_base.py        # Healthcare knowledge base
│   │   │   └── 📄 search.py                # Semantic search utilities
│   │   │
│   │   └── 📁 utils/                       # General utilities
│   │       ├── 📄 __init__.py
│   │       ├── 📄 datetime_utils.py        # Date/time handling
│   │       ├── 📄 text_processing.py       # Text analysis utilities
│   │       └── 📄 security_utils.py        # Security helper functions
│   │
│   ├── 📁 scripts/                         # Utility scripts
│   │   ├── 📄 deploy.sh                    # Deployment automation
│   │   ├── 📄 init_db.py                   # Database initialization
│   │   ├── 📄 populate_kb.py               # Knowledge base population
│   │   ├── 📄 backup.py                    # Database backup utility
│   │   └── 📄 health_check.py              # System health verification
│   │
│   ├── 📁 tests/                           # Test suite
│   │   ├── 📄 __init__.py
│   │   ├── 📄 conftest.py                  # pytest configuration
│   │   ├── 📁 unit/                        # Unit tests
│   │   │   ├── 📄 test_agents.py           # AI agent tests
│   │   │   ├── 📄 test_api.py              # API endpoint tests
│   │   │   ├── 📄 test_services.py         # Service layer tests
│   │   │   └── 📄 test_utils.py            # Utility function tests
│   │   ├── 📁 integration/                 # Integration tests
│   │   │   ├── 📄 test_database.py         # Database integration tests
│   │   │   ├── 📄 test_ai_integration.py   # AI service integration
│   │   │   └── 📄 test_file_upload.py      # File upload workflow tests
│   │   └── 📁 e2e/                         # End-to-end tests
│   │       ├── 📄 test_patient_journey.py  # Complete patient workflow
│   │       ├── 📄 test_admin_workflow.py   # Admin dashboard testing
│   │       └── 📄 test_ai_chat.py          # AI chat functionality tests
│   │
│   └── 📁 data/                            # Data files and configurations
│       ├── 📄 knowledge_base/              # Healthcare knowledge base
│       │   ├── 📄 medical_qa.json          # Medical Q&A dataset
│       │   ├── 📄 procedures.md            # Medical procedures database
│       │   ├── 📄 medications.json         # Medication information
│       │   └── 📄 faq.json                 # Frequently asked questions
│       └── 📁 embeddings/                  # Pre-computed embeddings
│           ├── 📄 medical_vocab.emb        # Medical vocabulary embeddings
│           └── 📄 symptom_embeddings.emb   # Symptom-related embeddings
│
├── 📁 healthcare-website/                   # Marketing and information website
│   ├── 📄 package.json                     # Website dependencies
│   ├── 📄 Dockerfile                       # Website containerization
│   ├── 📁 src/                             # Website source code
│   │   ├── 📄 index.html                   # Main website page
│   │   ├── 📄 about.html                   # About clinic page
│   │   ├── 📄 services.html                # Services offered page
│   │   ├── 📄 contact.html                 # Contact information
│   │   └── 📁 assets/                      # Website assets
│   │       ├── 📁 images/                  # Clinic photos and graphics
│   │       ├── 📁 css/                     # Website stylesheets
│   │       └── 📁 js/                      # JavaScript functionality
│   └── 📁 dist/                            # Built website output
│
├── 📁 supabase/                            # Supabase backend configuration
│   ├── 📄 config.toml                      # Supabase project configuration
│   ├── 📄 seed.sql                         # Database seed data
│   ├── 📁 functions/                       # Edge functions
│   │   ├── 📁 appointment-reminder/        # Automated appointment reminders
│   │   │   └── 📄 index.ts                 # Reminder function implementation
│   │   ├── 📁 patient-registration/        # Patient registration handler
│   │   │   └── 📄 index.ts                 # Registration function
│   │   └── 📁 notification-dispatch/       # Notification delivery
│   │       └── 📄 index.ts                 # Notification function
│   ├── 📁 migrations/                      # Database schema migrations
│   │   ├── 📄 20240101000000_initial.sql   # Initial schema setup
│   │   ├── 📄 20240102000000_patients.sql  # Patient table creation
│   │   ├── 📄 20240103000000_appointments.sql # Appointment system
│   │   └── 📄 20240104000000_ai_data.sql   # AI agent data structures
│   ├── 📁 auth/                            # Authentication configuration
│   │   └── 📄 policies.sql                 # Row Level Security policies
│   ├── 📁 storage/                         # File storage configuration
│   │   ├── 📄 buckets.json                 # Storage bucket definitions
│   │   └── 📁 policies.sql                 # Storage access policies
│   └── 📁 types/                           # TypeScript type definitions
│       └── 📄 database.types.ts            # Generated database types
│
├── 📁 monitoring/                           # Observability and monitoring
│   ├── 📁 prometheus/                      # Metrics collection configuration
│   │   ├── 📄 prometheus.yml               # Prometheus server configuration
│   │   ├── 📁 rules/                       # Alerting rules
│   │   │   ├── 📄 healthcare_alerts.yml    # Healthcare-specific alerts
│   │   │   ├── 📄 api_performance.yml      # API performance alerts
│   │   │   └── 📄 system_health.yml        # System health alerts
│   │   └── 📁 targets/                     # Monitoring targets
│   │       └── 📄 scrape_configs.yml       # Target discovery configuration
│   ├── 📁 grafana/                         # Visualization and dashboards
│   │   ├── 📁 provisioning/                # Grafana provisioning
│   │   │   ├── 📁 datasources/             # Data source configurations
│   │   │   │   └── 📄 prometheus.yml       # Prometheus data source
│   │   │   └── 📁 dashboards/              # Dashboard definitions
│   │   │       ├── 📄 healthcare_dashboard.json   # Healthcare metrics
│   │   │       ├── 📄 api_performance.json       # API performance dashboard
│   │   │       └── 📄 system_overview.json       # System overview dashboard
│   │   └── 📁 dashboards/                  # Custom dashboard definitions
│   ├── 📁 alertmanager/                    # Alert management
│   │   └── 📄 alertmanager.yml             # Alert routing configuration
│   └── 📁 loki/                            # Log aggregation (optional)
│       └── 📄 loki.yml                     # Log collection configuration
│
├── 📁 deployment/                          # Deployment configurations
│   ├── 📁 docker/                          # Docker configuration files
│   │   ├── 📄 docker-compose.yml           # Full stack orchestration
│   │   ├── 📄 docker-compose.dev.yml       # Development environment
│   │   ├── 📄 docker-compose.prod.yml      # Production configuration
│   │   ├── 📄 nginx.conf                   # Reverse proxy configuration
│   │   └── 📁 ssl/                         # SSL certificate management
│   │       └── 📄 README.md                # SSL setup instructions
│   ├── 📁 kubernetes/                      # K8s deployment manifests (optional)
│   │   ├── 📄 namespace.yml                # Kubernetes namespace
│   │   ├── 📄 configmap.yml                # Configuration management
│   │   ├── 📄 secrets.yml                  # Secret management
│   │   ├── 📄 deployment.yml               # Application deployment
│   │   ├── 📄 service.yml                  # Service definitions
│   │   └── 📄 ingress.yml                  # Ingress configuration
│   ├── 📁 terraform/                       # Infrastructure as Code (optional)
│   │   ├── 📄 main.tf                      # Main Terraform configuration
│   │   ├── 📄 variables.tf                 # Variable definitions
│   │   ├── 📄 outputs.tf                   # Output definitions
│   │   └── 📄 providers.tf                 # Cloud provider configuration
│   └── 📁 scripts/                         # Deployment automation
│       ├── 📄 deploy.sh                    # Automated deployment script
│       ├── 📄 rollback.sh                  # Rollback procedures
│       ├── 📄 backup.sh                    # Database backup automation
│       └── 📄 health_check.sh              # Post-deployment verification
│
├── 📁 docs/                                # Documentation suite
│   ├── 📄 README.md                        # Project overview documentation
│   ├── 📄 architecture.md                  # System architecture documentation
│   ├── 📄 api.md                           # API reference documentation
│   ├── 📄 deployment.md                    # Deployment guide
│   ├── 📄 development.md                   # Development guidelines
│   ├── 📄 security.md                      # Security documentation
│   ├── 📄 testing.md                       # Testing strategies
│   ├── 📄 monitoring.md                    # Monitoring and observability
│   ├── 📁 api/                             # API documentation
│   │   ├── 📄 openapi.yaml                 # OpenAPI specification
│   │   └── 📁 examples/                    # API usage examples
│   ├── 📁 diagrams/                        # Architecture diagrams
│   │   ├── 📄 system_architecture.puml     # System architecture diagram
│   │   ├── 📄 database_schema.sql          # Database schema visualization
│   │   ├── 📄 api_flow.puml                # API interaction flow
│   │   └── 📄 user_journey.puml            # User experience flow
│   └── 📁 guides/                          # User and developer guides
│       ├── 📄 user_guide.md                # End-user documentation
│       ├── 📄 admin_guide.md               # Administrator documentation
│       ├── 📄 developer_guide.md           # Developer onboarding guide
│       └── 📄 troubleshooting.md           # Common issues and solutions
│
├── 📁 testing/                             # Testing infrastructure
│   ├── 📁 playwright/                      # E2E testing with Playwright
│   │   ├── 📄 config.ts                    # Playwright configuration
│   │   ├── 📁 tests/                       # E2E test suite
│   │   │   ├── 📄 patient_booking.spec.ts  # Patient booking workflow
│   │   │   ├── 📄 admin_dashboard.spec.ts  # Admin functionality tests
│   │   │   ├── 📄 ai_chat.spec.ts          # AI chat interaction tests
│   │   │   └── 📄 file_upload.spec.ts      # File upload functionality
│   │   └── 📁 fixtures/                    # Test data and fixtures
│   ├── 📁 cypress/                         # Alternative E2E testing
│   │   ├── 📄 cypress.config.js            # Cypress configuration
│   │   └── 📁 e2e/                         # Cypress test suite
│   └── 📁 performance/                     # Performance testing
│       ├── 📄 load_test.js                 # Load testing configuration
│       └── 📄 stress_test.js               # Stress testing scripts
│
├── 📁 assets/                              # Project assets
│   ├── 📁 images/                          # Project images and graphics
│   │   ├── 📄 logo.png                     # Clinic logo
│   │   ├── 📄 screenshots/                 # Application screenshots
│   │   │   ├── 📄 dashboard.png            # Admin dashboard screenshot
│   │   │   ├── 📄 patient_portal.png       # Patient portal screenshot
│   │   │   └── 📄 mobile_view.png          # Mobile interface screenshot
│   │   └── 📁 icons/                       # Application icons
│   ├── 📁 docs/                            # Documentation assets
│   │   ├── 📄 clinic_brochure.pdf          # Marketing brochure
│   │   └── 📄 privacy_policy.pdf           # Privacy and compliance docs
│   └── 📁 templates/                       # Email and document templates
│       ├── 📄 appointment_reminder.html    # Email reminder template
│       ├── 📄 welcome_email.html           # Patient welcome email
│       └── 📄 medical_report_template.html # Medical report template
│
├── 📁 backup/                              # Backup and recovery
│   ├── 📄 daily_backup.sh                  # Automated daily backups
│   ├── 📄 weekly_backup.sh                 # Weekly comprehensive backup
│   ├── 📄 restore_procedure.md             # Data restoration guide
│   ├── 📁 automated/                       # Automated backup storage
│   └── 📁 manual/                          # Manual backup archive
│
├── 📁 scripts/                             # Utility and automation scripts
│   ├── 📄 setup.sh                         # Initial project setup
│   ├── 📄 lint.sh                          # Code linting automation
│   ├── 📄 test.sh                          # Test suite execution
│   ├── 📄 build.sh                         # Application build process
│   └── 📄 ci-cd/                           # CI/CD pipeline scripts
│       ├── 📄 build.yml                    # GitHub Actions build workflow
│       ├── 📄 test.yml                     # GitHub Actions test workflow
│       ├── 📄 deploy.yml                   # GitHub Actions deploy workflow
│       └── 📄 security-scan.yml            # Security scanning workflow
│
├── 📁 .github/                             # GitHub-specific configurations
│   ├── 📄 ISSUE_TEMPLATE/                  # Issue templates
│   │   ├── 📄 bug_report.md                # Bug report template
│   │   ├── 📄 feature_request.md           # Feature request template
│   │   └── 📄 question.md                  # Question template
│   ├── 📄 PULL_REQUEST_TEMPLATE.md         # PR description template
│   ├── 📄 workflows/                       # GitHub Actions workflows
│   │   ├── 📄 ci.yml                       # Continuous integration
│   │   ├── 📄 security.yml                 # Security scanning
│   │   └── 📄 deploy.yml                   # Automated deployment
│   └── 📄 dependabot.yml                   # Dependency update automation
│
├── 📄 .env.example                         # Environment variables template
├── 📄 .gitignore                           # Git ignore patterns
├── 📄 docker-compose.yml                   # Main orchestration file
├── 📄 Dockerfile                           # Root Dockerfile
├── 📄 docker-compose.override.yml          # Development overrides
├── 📄 docker-compose.prod.yml              # Production configuration
├── 📄 LICENSE                              # Project license
├── 📄 SECURITY.md                          # Security policy
├── 📄 CONTRIBUTING.md                      # Contribution guidelines
├── 📄 CODE_OF_CONDUCT.md                   # Code of conduct
├── 📄 CHANGELOG.md                         # Version changelog
├── 📄 version.txt                          # Current version information
└── 📄 README.md                            # Main project documentation
```

## 📊 **Project Statistics**

| **Category** | **Count** | **Description** |
|--------------|-----------|-----------------|
| **Total Files** | 200+ | Complete project file count |
| **React Components** | 50+ | Frontend UI components |
| **API Endpoints** | 25+ | RESTful API endpoints |
| **Database Models** | 15+ | SQLAlchemy models |
| **AI Agent Tools** | 8+ | Microsoft Agent Framework tools |
| **Test Files** | 30+ | Unit, integration, and E2E tests |
| **Documentation** | 20+ | Comprehensive documentation files |
| **Configuration** | 25+ | Docker, deployment, and monitoring configs |

## 🎯 **Key Architectural Layers**

### **Frontend Layer** (`healthcare-app-react/`)
- **Component Architecture**: Modular, reusable React components
- **State Management**: React Context + Custom hooks
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

### **Backend Layer** (`customer-support-agent/`)
- **API Framework**: FastAPI with async capabilities
- **AI Integration**: Microsoft Agent Framework orchestration
- **Database**: Multi-database architecture (PostgreSQL, SQLite, Redis, ChromaDB)
- **Security**: JWT authentication, input validation, rate limiting
- **Monitoring**: Prometheus metrics, structured logging

### **Infrastructure Layer** (`supabase/`, `monitoring/`, `deployment/`)
- **Backend Services**: Supabase authentication, storage, edge functions
- **Monitoring**: Prometheus + Grafana observability stack
- **Deployment**: Docker containerization with production optimization
- **CI/CD**: GitHub Actions automated workflows

### **Documentation Layer** (`docs/`, `guides/`)
- **API Documentation**: OpenAPI specifications with examples
- **Architecture Diagrams**: System design and flow documentation
- **User Guides**: End-user and administrator documentation
- **Development**: Technical documentation for contributors

## 🔧 **Technology Integration Points**

### **AI Agent Integration**
- **Microsoft Agent Framework**: Orchestrates AI agent workflows
- **RAG Implementation**: ChromaDB vector database for knowledge retrieval
- **Embedding Model**: EmbeddingGemma-300m for semantic understanding
- **Tool Ecosystem**: Specialized tools for healthcare domain

### **Real-time Communication**
- **WebSocket Infrastructure**: Bidirectional real-time communication
- **Event-driven Architecture**: Pub/sub pattern for system events
- **Notification System**: Multi-channel notification delivery

### **Data Flow Architecture**
- **Frontend ↔ Backend**: RESTful API + WebSocket
- **Backend ↔ AI Agent**: Microsoft Agent Framework API
- **AI Agent ↔ Knowledge Base**: Vector search and RAG
- **Database Cluster**: PostgreSQL + Redis + ChromaDB coordination

This comprehensive file hierarchy provides a complete picture of the Maria Family Clinic healthcare platform's architecture, showing how all components work together to deliver a sophisticated, AI-powered healthcare management system.