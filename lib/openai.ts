import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage
})

export interface AIProcessingResult {
  tags: string[]
  summary?: string
  tasks: string[]
  transcription?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export async function processNoteWithAI(content: string, noteType: string): Promise<AIProcessingResult> {
  try {
    const prompt = `
Analyze the following ${noteType} note content and provide:
1. 3-5 relevant tags (single words, no hashtags)
2. A brief summary (max 100 words) if content is longer than 50 words
3. Extract any tasks or action items (look for imperative statements, to-dos, or bold text)
4. Determine sentiment (positive, negative, or neutral)

Content: "${content}"

Respond in JSON format:
{
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "brief summary here or null",
  "tasks": ["task 1", "task 2"],
  "sentiment": "positive|negative|neutral"
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes notes and extracts structured information. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    const parsed = JSON.parse(result) as AIProcessingResult
    
    // Validate and clean the response
    return {
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      summary: parsed.summary && parsed.summary.length > 10 ? parsed.summary : undefined,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      sentiment: parsed.sentiment || 'neutral'
    }

  } catch (error) {
    console.error('OpenAI processing error:', error)
    
    // Fallback to basic processing if API fails
    return {
      tags: extractBasicTags(content),
      summary: content.length > 100 ? content.substring(0, 100) + '...' : undefined,
      tasks: extractBasicTasks(content),
      sentiment: 'neutral'
    }
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: formData
    })

    if (!response.ok) throw new Error('Transcription failed')

    const result = await response.json()
    return result.text || 'Transcription failed'

  } catch (error) {
    console.error('Transcription error:', error)
    return 'Transcription unavailable - please check your OpenAI API key'
  }
}

export async function generateImageDescription(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image in 1-2 sentences. Focus on the main subject and key details."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 150
    })

    return response.choices[0]?.message?.content || 'Image description unavailable'

  } catch (error) {
    console.error('Image description error:', error)
    return 'Image description unavailable'
  }
}

// Fallback functions for when API fails
function extractBasicTags(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']
  
  return words
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 5)
}

function extractBasicTasks(content: string): string[] {
  const taskPatterns = [
    /\*\*(.*?)\*\*/g, // Bold text
    /- \[ \] (.*)/g,  // Markdown checkboxes
    /TODO:?\s*(.*)/gi, // TODO items
    /TASK:?\s*(.*)/gi  // TASK items
  ]

  const tasks: string[] = []
  
  taskPatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.replace(/\*\*|\[ \]|TODO:?|TASK:?|-/gi, '').trim()
        if (cleaned.length > 3) {
          tasks.push(cleaned)
        }
      })
    }
  })

  return Array.from(new Set(tasks)).slice(0, 5) // Remove duplicates and limit
}
