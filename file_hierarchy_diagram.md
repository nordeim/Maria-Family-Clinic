# Customer Support Agent - File Hierarchy Diagram

## Complete Project Structure

```
customer-support-agent/
├── .github/                          # GitHub Actions CI/CD workflows
│   └── workflows/                    # Automated testing and deployment pipelines
├── backend/                          # FastAPI backend application
│   ├── app/                          # Main application code
│   │   ├── agents/                   # AI agent implementations
│   │   │   ├── agent_factory.py      # Factory for creating different agent types
│   │   │   └── chat_agent.py         # Core chat agent with AI orchestration
│   │   ├── api/                      # API layer and middleware
│   │   │   ├── dependencies.py       # FastAPI dependency injection
│   │   │   ├── middleware.py         # Request/response middleware
│   │   │   └── routes/               # API endpoint definitions
│   │   │       ├── chat.py           # Chat session and message endpoints
│   │   │       ├── health.py         # Health check and status endpoints
│   │   │       └── metrics.py        # Prometheus metrics endpoints
│   │   ├── core/                     # Core application infrastructure
│   │   │   ├── cache.py              # Redis caching implementation
│   │   │   ├── config.py             # Application configuration management
│   │   │   ├── logging.py            # Structured logging setup
│   │   │   └── security.py           # JWT authentication and security
│   │   ├── db/                       # Database layer
│   │   │   ├── database.py           # SQLAlchemy database connection
│   │   │   ├── migrations/           # Alembic database migrations
│   │   │   └── models.py             # Database schema models
│   │   ├── tools/                    # Agent tools and utilities
│   │   │   ├── attachment_tool.py    # Document attachment processing
│   │   │   ├── escalation_tool.py    # Human agent escalation mechanism
│   │   │   ├── memory_tool.py        # Conversation memory management
│   │   │   └── rag_tool.py           # Retrieval-Augmented Generation
│   │   ├── vector_store/             # Vector database integration
│   │   │   ├── chroma_client.py      # ChromaDB client for vector search
│   │   │   └── embeddings.py         # EmbeddingGemma-300m integration
│   │   └── main.py                   # FastAPI application entry point
│   ├── scripts/                      # Deployment and utility scripts
│   │   ├── deploy.sh                 # Production deployment automation
│   │   ├── init_db.py                # Database initialization
│   │   ├── populate_kb.py            # Knowledge base population
│   │   └── rollback.sh               # Deployment rollback procedures
│   ├── tests/                        # Comprehensive test suite
│   │   ├── unit/                     # Unit tests for individual components
│   │   ├── integration/              # Integration tests for API endpoints
│   │   └── e2e/                      # End-to-end testing scenarios
│   ├── Dockerfile                    # Backend containerization configuration
│   ├── docker-compose.yml            # Development Docker Compose setup
│   └── requirements.txt              # Python dependencies specification
├── frontend/                         # React TypeScript frontend
│   ├── public/                       # Static assets
│   │   └── index.html                # Main HTML template
│   ├── src/                          # Source code
│   │   ├── components/               # React UI components
│   │   │   ├── AttachmentUpload/     # File upload component
│   │   │   ├── ChatWindow/           # Main chat interface
│   │   │   ├── EscalationNotice/     # Human agent escalation UI
│   │   │   ├── Message/              # Individual message component
│   │   │   ├── MessageInput/         # Message input interface
│   │   │   ├── SourceCitation/       # AI response citation display
│   │   │   └── TypingIndicator/      # Real-time typing status
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useChat.ts            # Chat state management
│   │   │   ├── useLocalStorage.ts    # Local storage persistence
│   │   │   └── useWebSocket.ts       # WebSocket connection management
│   │   ├── services/                 # API and external service clients
│   │   │   ├── api.ts                # REST API client
│   │   │   ├── storage.ts            # Local storage service
│   │   │   └── websocket.ts          # WebSocket communication
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── api.ts                # API response types
│   │   │   ├── chat.ts               # Chat-related types
│   │   │   └── index.ts              # Main type exports
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.ts          # Application constants
│   │   │   ├── helpers.ts            # General helper functions
│   │   │   └── validation.ts         # Input validation utilities
│   │   ├── App.tsx                   # Main React application component
│   │   └── index.tsx                 # Application entry point
│   ├── Dockerfile                    # Frontend containerization
│   ├── package.json                  # Node.js dependencies and scripts
│   └── tsconfig.json                 # TypeScript configuration
├── monitoring/                       # Observability and monitoring stack
│   ├── prometheus/                   # Metrics collection configuration
│   │   ├── prometheus.yml            # Main Prometheus configuration
│   │   └── rules/                    # Alert and recording rules
│   ├── grafana/                      # Visualization and dashboards
│   │   ├── provisioning/             # Grafana provisioning configuration
│   │   └── dashboards/               # Pre-configured dashboards
│   └── alertmanager/                 # Alert management
│       └── alertmanager.yml          # Alert routing configuration
├── docs/                             # Comprehensive documentation
│   ├── api.md                        # API endpoint documentation
│   ├── architecture.md               # Detailed architecture documentation
│   └── deployment.md                 # Deployment guide
├── scripts/                          # Root-level utility scripts
├── .env.example                      # Environment variables template
├── .env.prod                         # Production environment configuration
├── .gitignore                        # Git ignore patterns
├── CLAUDE.md                         # AI development guidelines
├── DB_initialization_examples.txt    # Database setup examples
├── Deployment_Checklist.md           # Production deployment checklist
├── Design_Decisions_Document.md      # Architecture decision records
├── GEMINI.md                         # Gemini model documentation
├── KB_loading_examples.txt           # Knowledge base loading examples
├── Minor_Discrepancies_and_Areas_for_Refinement.md # Known issues
├── Project_Architecture_Document.md  # Complete architecture documentation
├── README.md                         # This comprehensive README
├── Runbook.md                        # Operations runbook
├── codebase_review.md                # Code quality review
├── docker-compose.prod.yml           # Production Docker Compose
├── docker-compose.yml                # Development Docker Compose
├── file_structure.txt                # This file structure documentation
└── grafana_dashboard.json            # Pre-configured Grafana dashboards

## Key Component Descriptions

### Backend Components
- **agents/**: AI agent implementations using Microsoft Agent Framework
- **api/routes/**: RESTful API endpoints for chat, health, and metrics
- **core/**: Infrastructure components (config, security, caching, logging)
- **db/**: Database layer with SQLAlchemy models and migrations
- **tools/**: Specialized tools for RAG, memory, attachments, and escalation
- **vector_store/**: ChromaDB integration for vector similarity search

### Frontend Components
- **components/**: Modular React components for chat interface
- **hooks/**: Custom hooks for state management and WebSocket communication
- **services/**: API clients and external service integrations
- **types/**: TypeScript definitions for type safety
- **utils/**: Utility functions and constants

### Infrastructure Components
- **monitoring/**: Prometheus metrics, Grafana dashboards, and alerting
- **scripts/**: Deployment automation and database management
- **docs/**: Comprehensive documentation for all aspects of the system

### Configuration Files
- **docker-compose.yml**: Development environment orchestration
- **docker-compose.prod.yml**: Production environment configuration
- **.env.example**: Template for environment variables
- **requirements.txt**: Python dependency specifications
- **package.json**: Node.js dependency specifications
