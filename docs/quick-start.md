# Quick Start Guide

Get up and running with Kair0s AI Gateway in 5 minutes!

## 🚀 5-Minute Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/adam-guerin/kair0s.git
cd kair0s

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### Step 2: Configure API Keys

Edit `.env` file with your API keys:

```bash
# Add your OpenAI API key
OPENAI_API_KEY=sk-your-openai-key-here

# Add your Anthropic API key (optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Leave other settings as default for now
```

### Step 3: Start the Application

```bash
# Start development server
pnpm dev

# The app will open at http://localhost:5173
```

That's it! 🎉 You now have Kair0s running locally.

## 💬 Your First Chat

### 1. Open the Web Interface

Navigate to [http://localhost:5173](http://localhost:5173)

### 2. Start a Conversation

```typescript
// In the chat interface, type:
Hello! Can you help me understand what Kair0s does?
```

### 3. Switch AI Providers

Try different AI models:

- **OpenAI GPT-4**: Balanced performance
- **Anthropic Claude**: Advanced reasoning
- **Custom models**: Your own integrations

## 🎤 First Transcription

### 1. Upload Audio File

```bash
# Supported formats: MP3, WAV, M4A, OGG
# Maximum file size: 100MB
```

### 2. Get Transcription

The system will automatically:
- Detect the language
- Transcribe the audio
- Provide confidence scores
- Identify different speakers

### 3. Ask Questions About Content

```typescript
// Example questions:
"Summarize the main points from this meeting."
"What action items were mentioned?"
"Who spoke the most during the meeting?"
```

## 🏗️ Understanding the Interface

### Main Components

```
┌─────────────────────────────────────────────────────────┐
│  Kair0s AI Gateway                                      │
├─────────────────────────────────────────────────────────┤
│  [Chat] [Transcription] [Sessions] [Settings]           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │   Chat      │  │         Transcription          │   │
│  │ Interface   │  │         Panel                   │   │
│  │             │  │                                 │   │
│  │ Hello! 👋   │  │ 📤 Upload audio file           │   │
│  │ How can I   │  │ 🎤 Start recording             │   │
│  │ help you?   │  │ 📝 View transcription          │   │
│  └─────────────┘  └─────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Session History & Analytics                            │
└─────────────────────────────────────────────────────────┘
```

### Navigation

- **Chat**: AI conversation interface
- **Transcription**: Audio processing and transcription
- **Sessions**: Meeting management and history
- **Settings**: Configuration and preferences

## 🔧 Basic Configuration

### 1. Set Default AI Provider

```typescript
// In Settings → AI Providers
Default Provider: OpenAI
Default Model: GPT-4 Turbo
Temperature: 0.7
Max Tokens: 1000
```

### 2. Configure Transcription

```typescript
// In Settings → Transcription
Default Language: Auto-detect
Speaker Diarization: Enabled
Confidence Threshold: 0.8
Output Format: JSON
```

### 3. Set Up API Keys

```typescript
// In Settings → API Keys
OpenAI: sk-***************************
Anthropic: sk-ant-*******************
Pluely: pluely-**********************
```

## 📊 Try These Features

### 1. Multi-Provider Chat

```typescript
// Test with different providers
// OpenAI
"What are the benefits of microservices architecture?"

// Anthropic
"Explain quantum computing in simple terms."

// Compare responses
"Which explanation was clearer and why?"
```

### 2. Real-time Transcription

```typescript
// Start a live transcription session
1. Click "Start Recording"
2. Speak for 30 seconds
3. Watch real-time transcription
4. Stop recording
5. Review the full transcription
```

### 3. Meeting Intelligence

```typescript
// Create a meeting session
1. Click "New Session"
2. Name: "Team Standup"
3. Enable recording and transcription
4. Start the session
5. Upload audio or record live
6. Get AI-generated summary
```

## 🎯 Common Use Cases

### 1. Content Creation

```typescript
// Generate blog post ideas
"Give me 10 blog post ideas about AI ethics"

// Improve writing
"Rewrite this paragraph to be more engaging: [your text]"

// Create outlines
"Create an outline for a technical article about React hooks"
```

### 2. Meeting Analysis

```typescript
// After meeting transcription
"Extract action items from this meeting"
"Who were the main speakers?"
"What were the key decisions made?"
```

### 3. Code Assistance

```typescript
// Code review
"Review this TypeScript code for potential issues: [code]"

// Debugging
"Why is this React component not re-rendering?"

// Optimization
"How can I improve the performance of this function?"
```

### 4. Learning & Research

```typescript
// Explain concepts
"Explain the difference between REST and GraphQL"

// Research assistance
"What are the latest trends in AI for 2024?"

// Study help
"Create a study plan for learning machine learning"
```

## 🔍 Advanced Features to Explore

### 1. Context Management

```typescript
// Maintain conversation context
Chat 1: "I'm working on a React project"
Chat 2: "How do I handle state management?"
// The AI remembers you're working with React
```

### 2. Custom Prompts

```typescript
// Create reusable prompts
const codeReviewPrompt = "Review this code for:
- Performance issues
- Security vulnerabilities
- Best practices violations
- Code style consistency"
```

### 3. API Integration

```typescript
// Use the API directly
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Hello, world!',
    provider: 'openai',
    model: 'gpt-4-turbo'
  })
});
```

## 📈 Monitor Your Usage

### Check Statistics

```typescript
// In the dashboard
- API calls today: 45
- Transcription minutes: 23
- Cost this month: $12.50
- Active sessions: 2
```

### Performance Metrics

```typescript
// Response times
- OpenAI GPT-4: ~2 seconds
- Anthropic Claude: ~3 seconds
- Transcription: ~1 minute per 10 minutes of audio
```

## 🛠️ Troubleshooting Common Issues

### 1. API Key Errors

```bash
# Check your API key is valid
curl -H "Authorization: Bearer YOUR_OPENAI_KEY" \
     https://api.openai.com/v1/models

# Common fixes:
- Check for typos in API key
- Ensure key has credits
- Verify key permissions
```

### 2. Slow Responses

```typescript
// Try these optimizations:
- Use smaller models (GPT-3.5 instead of GPT-4)
- Reduce max_tokens parameter
- Lower temperature for faster responses
- Use streaming for long responses
```

### 3. Transcription Issues

```typescript
# Audio quality tips:
- Use clear audio (no background noise)
- Speak clearly and at moderate pace
- Use supported formats (MP3, WAV, M4A)
- Keep files under 100MB
```

## 🎁 Pro Tips

### 1. Keyboard Shortcuts

```typescript
// In the chat interface:
Ctrl + Enter: Send message
Ctrl + /: Clear chat
Ctrl + K: Search history
Ctrl + S: Save conversation
```

### 2. Prompt Engineering

```typescript
// Better prompts get better results:
❌ "Tell me about AI"
✅ "Explain how AI transformers work in 3 paragraphs"

❌ "Fix my code"
✅ "Debug this React component that's not rendering: [code]"
```

### 3. Cost Optimization

```typescript
// Reduce API costs:
- Use GPT-3.5 for simple tasks
- Set reasonable max_tokens limits
- Cache frequent responses
- Use streaming for long content
```

## 📚 Next Steps

Now that you're familiar with the basics:

1. **[Explore the API](./api.md)** - Build custom integrations
2. **[Read the User Guide](./user-guide/ui.md)** - Master all features
3. **[Check Development Setup](./development/setup.md)** - Start contributing
4. **[Join the Community](https://discord.gg/kair0s)** - Connect with other users

## 🆘 Need Help?

- **Documentation**: [docs.kair0s.com](https://docs.kair0s.com)
- **GitHub Issues**: [Report problems](https://github.com/adam-guerin/kair0s/issues)
- **Discord**: [Live chat support](https://discord.gg/kair0s)
- **Email**: support@kair0s.com

---

**Happy AI hacking! 🚀**

---

**Last updated: February 25, 2024**
