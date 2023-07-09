import express from 'express'
import fs from 'fs'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

import {
  downloadFromGoogleStorage,
  generateVoice,
  generateSuggestionsFromPrompt,
  generateImageFromPrompt,
  generateContentFromPrompt,
  generateVideoBasedOnPrompt
} from './utils'

dotenv.config()

const app = express()
app.use(cors())

// Parse JSON bodies
app.use(bodyParser.json())

app.get('/categories/', async (req, res) => {
  try {
    const recommendations = {
      hits: {
        hits: [
          {
            _source: {
              item_id: 'motortrend-article-news-98a0384e-aed4-432a-bb1e-cf59f5811e23',
              content: {
                primary: 'article',
                secondary: 'news'
              },
              event: {
                type: 'click'
              },
              attributes: {
                article: {
                  id: '98a0384e-aed4-432a-bb1e-cf59f5811e23',
                  title: 'TVR Announces Comeback with Gordon Murray Design, Cosworth V-8 Power',
                  authors: 'Eric Weiner'
                },
                session_id: '-2692120873218701822'
              },
              user_id: '3430023021207935000',
              timestamp: '2023-06-13T21:11:40.004Z'
            }
          },
          {
            _source: {
              item_id: 'motortrend-article-news-46691b36-85bc-4ec9-9c1b-410370f63c69',
              content: {
                primary: 'article',
                secondary: 'news'
              },
              event: {
                type: 'click'
              },
              attributes: {
                article: {
                  id: '46691b36-85bc-4ec9-9c1b-410370f63c69',
                  title: 'Toyota Teases Iconic Land Cruiser&#x27;s Likely Return to U.S.',
                  authors: 'Justin Westbrook,Alisa Priddle,Manufacturer'
                },
                session_id: '-388885061026897551'
              },
              user_id: '6313679408649969000',
              timestamp: '2023-06-13T21:12:24.175Z'
            }
          },
          {
            _source: {
              item_id: 'motortrend-article-reviews-9c2ac983-5409-42d8-8578-6b1c74449b94',
              content: {
                primary: 'article',
                secondary: 'reviews'
              },
              event: {
                type: 'click'
              },
              attributes: {
                article: {
                  id: '9c2ac983-5409-42d8-8578-6b1c74449b94',
                  title: '2023 Honda Pilot vs. 2024 Mazda CX-90: Head vs. Heart in This 3-Row Battle',
                  authors: 'Scott Evans,Brandon Lim'
                },
                session_id: '-6206744200385971269'
              },
              user_id: '6815719862573843000',
              timestamp: '2023-06-13T21:13:06.838Z'
            }
          }
        ]
      }
    }

    const hits = recommendations.hits.hits

    const response = hits.map((hit) => {
      const sourceItem = hit._source
      return {
        item_id: sourceItem.item_id,
        content: sourceItem.content,
        event: sourceItem.event,
        attributes: sourceItem.attributes,
        user_id: sourceItem.user_id,
        timestamp: sourceItem.timestamp
      }
    })

    res.status(200).json(response)
  } catch (error) {
    console.error('Error retrieving categories:', error)
    res.status(500).json({ message: 'An error occurred while retrieving categories.' })
  }
})

app.post('/generate-suggestions', async (req, res) => {
  const { topic } = req.body

  if (!topic) return res.status(400).json({ message: 'Please provide a topic.' })

  try {
    const formattedTopic = `Provide a topic of: ${topic} in JSON format.`
    console.log('formattedTopic', formattedTopic)
    const gpt3Response = await generateSuggestionsFromPrompt(formattedTopic)
    console.log('gpt3Response', gpt3Response)
    return res.status(200).json({ message: gpt3Response })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'An error occurred during content generation and upload.' })
  }
})

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
