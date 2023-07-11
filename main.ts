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

app.get("/categories/", async (req, res) => {
  try {
    const recommendations = {
      hits: {
        hits: [
          {
            _source: {
              source: "youtube",
              topics: [
                {
                  metrics: 1400000,
                  id: "98a0384e-aed4-432a-bb1e-cf59f5811e23",
                  name: "The Corvette Z06 is the best sounding american car",
                },
                {
                  metrics: 1136378,
                  id: "46691b36-85bc-4ec9-9c1b-410370f63c69",
                  name: "1,100HP Lucid Air v tuned BMW M3: Drag Race",
                },
                {
                  metrics: 731234,
                  id: "9c2ac983-5409-42d8-8578-6b1c74449b94",
                  name: "FIRST DRIVE: Rolls-Royce Spectre - 576bhp, £330k Electric Masterpiece | Top Gear",
                },
              ],
            },
          },
          {
            _source: {
              source: "reddit",
              topics: [
                {
                  metrics: 2282,
                  id: "98a0384e-aed4-432a-bb1e-cf59f5811e23",
                  name: "Lexus LC500",
                },
                {
                  metrics: 1609,
                  id: "46691b36-85bc-4ec9-9c1b-410370f63c69",
                  name: "2023 Audi R8 GT vs The Cheapest Audi R8 You Can Buy",
                },
                {
                  metrics: 1490,
                  id: "9c2ac983-5409-42d8-8578-6b1c74449b94",
                  name: "2022 Subaru BRZ",
                },
                {
                  metrics: 1397,
                  id: "9c2ac983-5409-42d8-8578-6b1c74449b92",
                  name: "2019 Ferrari 488 Pista",
                },
                {
                  metrics: 1103,
                  id: "9c2ac983-5409-42d8-8578-6b1c74449b90",
                  name: "Lamborghini Miura Paradise",
                },
              ],
            },
          },
        ],
      },
    };
​
    const hits = recommendations.hits.hits;
​
    const response = hits.map((hit) => {
      const sourceItem = hit._source;
      return {
        source: sourceItem.source,
        topics: sourceItem.topics,
      };
    });
​
    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving categories." });
  }
});

app.post('/generate', async (req, res) => {
  const { topic } = req.body

  if (!topic) return res.status(400).json({ message: 'Please provide a topic.' })

  try {
    // const formattedTopic = `Write article with keywords for: ${topic}.`
    // console.log('formattedTopic', formattedTopic)
    // const gpt3Response: any = await generateSuggestionsFromPrompt(formattedTopic)
    // // const encodedText: string = encodeURIComponent(gpt3Response);
    const response = {
      title: 'The 2024 Lexus LC 500: Unveiling Elegance and Power',
      slug: '2024-lexus-lc-500-unveiling-elegance-and-power',
      body: "The 2024 Lexus LC 500: Unveiling Elegance and Power. The 2024 Lexus LC 500 is a showstopper on the road with its sophisticated blend of aggressive sportiness and understated elegance. Its sculpted design creates a stunning silhouette that seems to be in motion even when it is stationary. The LC 500 features a low, wide stance with a long wheelbase and a sleek, aerodynamic profile. Its signature Lexus spindle grille, broad shoulders, and dramatic LED taillights add character to its sophisticated appeal. Inside, the 2024 Lexus LC 500 impresses with its meticulous attention to detail. The cabin exudes an atmosphere of luxury and refinement, with its top-quality materials such as hand-stitched leather, Alcantara, and brushed aluminum, giving passengers a rich sensory experience. The well-crafted ergonomic design provides a driver-centric cockpit, ensuring an intuitive and comfortable driving experience. At the heart of the LC 500 is a naturally aspirated 5.0-liter V8 engine, producing a powerful 471 horsepower and 398 pound-feet of torque. Paired with a swift and smooth 10-speed automatic transmission, the LC 500 accelerates from 0 to 60 mph in just 4.4 seconds, offering exhilarating performance that is not often associated with Lexus vehicles. The Active Sport Exhaust system contributes to the visceral experience, delivering a deep and aggressive engine sound that underscores the LC's sporting prowess. The 2024 Lexus LC 500 offers a surprisingly comfortable ride despite its performance credentials. The Adaptive Variable Suspension system with 650 levels of damping force ensures excellent ride comfort and handling stability, adapting to road conditions and driving style in real-time. The electric power steering offers precise control, while the high-performance Brembo brakes provide confident stopping power. For a more customized experience, the Drive Mode Select feature lets drivers choose from several driving modes to adjust the vehicle's performance characteristics. The 2024 Lexus LC 500 is packed with advanced technology features. The infotainment system includes a 10.3-inch high-resolution split-screen multimedia display, Apple CarPlay, Android Auto, and a premium Mark Levinson audio system. The touchpad interface can be tricky to get used to but provides a clean and clutter-free dashboard. On the safety front, the LC 500 comes with the Lexus Safety System+ as standard. This includes Pre-Collision System with Pedestrian Detection, Lane Departure Alert with Lane Keep Assist, All-Speed Dynamic Radar Cruise Control, and Intelligent High Beams. Additionally, the LC 500 also features Blind Spot Monitor with Rear Cross-Traffic Alert, ensuring high levels of safety for both driver and passengers. The 2024 Lexus LC 500 is more than just a luxury sports coupe. It is an embodiment of Lexus's commitment to providing exceptional driving experiences, combining refined luxury with captivating performance. The LC 500 not only redefines Lexus's sports coupe lineup but also challenges the norms of the luxury automobile segment. This car truly delivers an experience that will inspire the senses and quicken the pulse of anyone fortunate enough to take the wheel.",
      metDescription: 'Explore the luxurious 2024 Lexus LC 500, a captivating blend of sportiness and elegance. Discover its design, performance, handling, comfort, and advanced technology features.',
      keywords: ['2024 Lexus LC 500', 'luxury sports coupe', 'car review', 'Lexus', 'LC 500', 'vehicle design', 'car performance', 'handling and comfort', 'advanced technology', 'safety features'],
      cars: [{
        make: 'Lexus',
        model: 'LC 500',
        year: '2024'
      }]
    }

    return res.status(200).json({ message: response })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'An error occurred during content generation and upload.' })
  }
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
