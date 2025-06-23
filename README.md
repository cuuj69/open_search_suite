# OpenSearch Suite Backend

A production-grade NestJS backend with GraphQL and OpenSearch integration for advanced search and recommendation capabilities.

## 🚀 Features

- **GraphQL API** with Apollo Server
- **OpenSearch Integration** with AWS SDK support
- **Advanced Search** with filtering, pagination, and fuzzy matching
- **Document Management** (CRUD operations)
- **Health Monitoring** with Terminus
- **Production Ready** with security middleware and validation
- **TypeScript** with full type safety
- **Docker Support** for easy deployment

## 🛠 Tech Stack

- **NestJS** - Progressive Node.js framework
- **GraphQL** - Query language for APIs
- **Apollo Server** - GraphQL server implementation
- **OpenSearch** - Distributed search and analytics engine
- **AWS SDK** - AWS services integration
- **TypeScript** - Type-safe JavaScript
- **Class Validator** - Validation decorators
- **Helmet** - Security middleware
- **Jest** - Testing framework

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenSearch instance (local or AWS)
- Docker (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd opensearch-suite-backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Application Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# OpenSearch Configuration
OPENSEARCH_URL=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# AWS Configuration (for AWS OpenSearch Service)
USE_AWS_AUTH=false
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### 3. Start OpenSearch

#### Option A: Docker (Recommended for Development)

```bash
docker-compose up -d
```

#### Option B: AWS OpenSearch Service

1. Create an OpenSearch domain in AWS
2. Update your `.env` file with AWS credentials
3. Set `USE_AWS_AUTH=true`

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at:
- **API**: http://localhost:3000/api/v1
- **GraphQL Playground**: http://localhost:3000/graphql
- **Health Check**: http://localhost:3000/api/v1/health

## 📚 GraphQL API

### Mutations

#### Create Document

```graphql
mutation CreateDocument($input: CreateSearchDocumentInput!) {
  createSearchDocument(input: $input) {
    success
    message
    document {
      id
      title
      content
      category
      tags
      price
      rating
      createdAt
      updatedAt
    }
  }
}
```

Variables:
```json
{
  "input": {
    "title": "Sample Product",
    "content": "This is a sample product description",
    "category": "electronics",
    "tags": ["gadget", "tech"],
    "price": 99.99,
    "rating": 4.5
  }
}
```

#### Update Document

```graphql
mutation UpdateDocument($id: String!, $input: UpdateSearchDocumentInput!) {
  updateSearchDocument(id: $id, input: $input) {
    success
    message
    document {
      id
      title
      content
      category
      tags
      price
      rating
      updatedAt
    }
  }
}
```

#### Delete Document

```graphql
mutation DeleteDocument($id: String!) {
  deleteSearchDocument(id: $id) {
    success
    message
  }
}
```

### Queries

#### Search Documents

```graphql
query SearchDocuments($input: SearchQueryInput!) {
  searchDocuments(input: $input) {
    documents {
      id
      title
      content
      category
      tags
      price
      rating
      createdAt
      updatedAt
      formattedPrice
      formattedRating
      excerpt
    }
    total
    took
  }
}
```

Variables:
```json
{
  "input": {
    "query": "electronics",
    "category": "electronics",
    "minPrice": 50,
    "maxPrice": 200,
    "minRating": 4.0,
    "from": 0,
    "size": 10
  }
}
```

#### Get Document by ID

```graphql
query GetDocument($id: String!) {
  getSearchDocument(id: $id) {
    id
    title
    content
    category
    tags
    price
    rating
    createdAt
    updatedAt
    formattedPrice
    formattedRating
    excerpt
  }
}
```

#### Get Categories and Tags

```graphql
query GetMetadata {
  categories: getCategories
  tags: getTags
}
```

#### Health Check

```graphql
query HealthCheck {
  healthCheck
}
```

## 🔧 Configuration

### OpenSearch Index Mapping

The application automatically creates an index with the following mapping:

```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "english"
      },
      "category": {
        "type": "keyword"
      },
      "tags": {
        "type": "keyword"
      },
      "price": {
        "type": "float"
      },
      "rating": {
        "type": "float"
      },
      "createdAt": {
        "type": "date"
      },
      "updatedAt": {
        "type": "date"
      }
    }
  }
}
```

### Search Features

- **Full-text search** with fuzzy matching
- **Category filtering**
- **Tag filtering**
- **Price range filtering**
- **Rating filtering**
- **Pagination**
- **Sorting** by relevance and date

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

### Build and Run

```bash
# Build the image
docker build -t opensearch-suite-backend .

# Run the container
docker run -p 3000:3000 --env-file .env opensearch-suite-backend
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📊 Monitoring

### Health Endpoints

- `GET /api/v1/health` - Application health check
- `GET /api/v1/health/opensearch` - OpenSearch connection status

### Logging

The application uses structured logging with different levels:
- `error` - Error messages
- `warn` - Warning messages
- `info` - Information messages
- `debug` - Debug messages

## 🔒 Security

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Request validation
- **Rate Limiting** - API rate limiting (configurable)
- **SSL/TLS** - Secure connections

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# OpenSearch (AWS)
OPENSEARCH_URL=https://your-opensearch-domain.region.es.amazonaws.com
USE_AWS_AUTH=true
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=info
```

### Performance Optimization

- Enable compression
- Use connection pooling
- Implement caching strategies
- Monitor performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the GraphQL schema

## 🔄 Changelog

### v1.0.0
- Initial release
- GraphQL API with OpenSearch integration
- Document CRUD operations
- Advanced search capabilities
- Health monitoring
- Production-ready configuration 