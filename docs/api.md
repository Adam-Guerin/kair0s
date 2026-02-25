# Kair0s API Reference

Complete API documentation for the Kair0s AI Gateway service.

## 🚀 Base URL

```
Development: http://localhost:5173/api
Production: https://api.kair0s.com
```

## 🔐 Authentication

All API requests require authentication using API keys:

```http
Authorization: Bearer YOUR_API_KEY
```

### Getting API Keys

1. Log into your Kair0s dashboard
2. Navigate to Settings → API Keys
3. Generate a new API key
4. Copy and securely store your key

## 📋 API Endpoints

### Chat & AI Services

#### Send Chat Message

```http
POST /api/chat
```

**Request Body:**
```json
{
  "message": "Hello, how can you help me?",
  "provider": "openai",
  "model": "gpt-4-turbo",
  "context": {
    "source": "kair0s",
    "session_id": "optional-session-id"
  },
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chat_123456789",
  "message": "I'm here to help! What would you like to know?",
  "provider": "openai",
  "model": "gpt-4-turbo",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  },
  "timestamp": "2024-02-25T12:00:00Z"
}
```

#### Stream Chat Response

```http
POST /api/chat/stream
```

**Request Body:** Same as `/api/chat`

**Response:** Server-Sent Events (SSE)

```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify(requestData)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data.message);
    }
  }
}
```

#### Get Available Providers

```http
GET /api/providers
```

**Response:**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo",
          "context_length": 128000,
          "pricing": {
            "input": 0.01,
            "output": 0.03
          }
        },
        {
          "id": "gpt-3.5-turbo",
          "name": "GPT-3.5 Turbo",
          "context_length": 16384,
          "pricing": {
            "input": 0.001,
            "output": 0.002
          }
        }
      ]
    },
    {
      "id": "anthropic",
      "name": "Anthropic",
      "models": [
        {
          "id": "claude-3-opus",
          "name": "Claude 3 Opus",
          "context_length": 200000,
          "pricing": {
            "input": 0.015,
            "output": 0.075
          }
        }
      ]
    }
  ]
}
```

### Transcription Services

#### Create Transcription

```http
POST /api/transcription
```

**Request Body (multipart/form-data):**
```
audio: [audio file]
language: en
model: whisper-1
response_format: json
timestamp_granularities: word
```

**Response:**
```json
{
  "id": "transcription_123456789",
  "text": "Hello, this is a transcription of the audio file.",
  "language": "en",
  "duration": 30.5,
  "words": [
    {
      "word": "Hello",
      "start": 0.0,
      "end": 0.5
    },
    {
      "word": "this",
      "start": 0.6,
      "end": 0.9
    }
  ],
  "confidence": 0.98
}
```

#### Get Transcription Status

```http
GET /api/transcription/{id}
```

**Response:**
```json
{
  "id": "transcription_123456789",
  "status": "completed",
  "progress": 100,
  "result": {
    "text": "Transcription text here...",
    "language": "en"
  }
}
```

### Session Management

#### Create Session

```http
POST /api/sessions
```

**Request Body:**
```json
{
  "name": "Meeting with Client",
  "type": "meeting",
  "participants": ["user1@example.com", "user2@example.com"],
  "settings": {
    "record_audio": true,
    "transcribe": true,
    "ai_summary": true
  }
}
```

**Response:**
```json
{
  "id": "session_123456789",
  "name": "Meeting with Client",
  "status": "active",
  "created_at": "2024-02-25T12:00:00Z",
  "join_url": "https://app.kair0s.com/join/session_123456789"
}
```

#### Get Session Details

```http
GET /api/sessions/{id}
```

**Response:**
```json
{
  "id": "session_123456789",
  "name": "Meeting with Client",
  "status": "completed",
  "duration": 3600,
  "participants": [
    {
      "email": "user1@example.com",
      "speaking_time": 1800,
      "messages_count": 15
    }
  ],
  "transcription": {
    "id": "transcription_123456789",
    "text": "Full transcription..."
  },
  "summary": {
    "key_points": ["Discussed project timeline", "Agreed on deliverables"],
    "action_items": ["Send proposal by Friday", "Schedule follow-up meeting"]
  }
}
```

### User Management

#### Get User Profile

```http
GET /api/user/profile
```

**Response:**
```json
{
  "id": "user_123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "pro",
  "usage": {
    "api_calls": 1500,
    "transcription_minutes": 120,
    "storage_used": "2.5GB"
  },
  "limits": {
    "api_calls": 10000,
    "transcription_minutes": 500,
    "storage": "10GB"
  }
}
```

#### Update User Settings

```http
PUT /api/user/settings
```

**Request Body:**
```json
{
  "default_provider": "openai",
  "default_model": "gpt-4-turbo",
  "language": "en",
  "timezone": "UTC",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

## 📊 Usage & Analytics

#### Get Usage Statistics

```http
GET /api/usage
```

**Query Parameters:**
- `period`: `day`, `week`, `month`, `year`
- `start_date`: ISO date string
- `end_date`: ISO date string

**Response:**
```json
{
  "period": "month",
  "usage": {
    "api_calls": 1500,
    "transcription_minutes": 120,
    "cost": 25.50
  },
  "breakdown": {
    "openai": {
      "calls": 800,
      "cost": 15.00
    },
    "anthropic": {
      "calls": 700,
      "cost": 10.50
    }
  }
}
```

## 🔧 Configuration

#### Get API Configuration

```http
GET /api/config
```

**Response:**
```json
{
  "version": "1.0.0",
  "features": {
    "streaming": true,
    "transcription": true,
    "meetings": true,
    "plugins": true
  },
  "limits": {
    "max_file_size": "100MB",
    "max_concurrent_requests": 10,
    "rate_limit": "1000/hour"
  }
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "message",
      "issue": "Message cannot be empty"
    },
    "request_id": "req_123456789"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Request validation failed | 400 |
| `UNAUTHORIZED` | Invalid or missing API key | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Rate limit exceeded | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | 503 |

### Rate Limiting

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔄 Webhooks

### Configure Webhooks

```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["transcription.completed", "session.ended"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload Example:**
```json
{
  "event": "transcription.completed",
  "data": {
    "id": "transcription_123456789",
    "text": "Transcription completed",
    "language": "en"
  },
  "timestamp": "2024-02-25T12:00:00Z"
}
```

## 🧪 Testing

### SDK Examples

#### JavaScript/TypeScript

```typescript
import { Kair0sClient } from '@kair0s/client';

const client = new Kair0sClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.kair0s.com'
});

// Send chat message
const response = await client.chat.create({
  message: 'Hello, world!',
  provider: 'openai',
  model: 'gpt-4-turbo'
});

// Stream response
const stream = client.chat.stream({
  message: 'Tell me a story',
  provider: 'anthropic',
  model: 'claude-3-opus'
});

for await (const chunk of stream) {
  console.log(chunk.message);
}
```

#### Python

```python
from kair0s import Kair0sClient

client = Kair0sClient(api_key='your-api-key')

# Send chat message
response = client.chat.create(
    message='Hello, world!',
    provider='openai',
    model='gpt-4-turbo'
)

# Create transcription
transcription = client.transcription.create(
    audio_file=open('audio.wav', 'rb'),
    language='en'
)
```

## 📚 SDK Libraries

- **JavaScript/TypeScript**: `@kair0s/client`
- **Python**: `kair0s-python`
- **Go**: `github.com/kair0s/go-client`
- **Ruby**: `kair0s-ruby`

## 🆘 Support

For API support:

- **Documentation**: [docs.kair0s.com](https://docs.kair0s.com)
- **API Status**: [status.kair0s.com](https://status.kair0s.com)
- **Support Email**: api-support@kair0s.com
- **GitHub Issues**: [github.com/adam-guerin/kair0s/issues](https://github.com/adam-guerin/kair0s/issues)

---

**Last updated: February 25, 2024**
