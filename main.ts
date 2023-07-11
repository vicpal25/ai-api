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
                  metrics: '1.4M',
                  id: "98a0384e-aed4-432a-bb1e-cf59f5811e23",
                  name: "The Corvette Z06 is the best sounding american car",
                },
                {
                  metrics: '1.1M',
                  id: "46691b36-85bc-4ec9-9c1b-410370f63c69",
                  name: "1,100HP Lucid Air v tuned BMW M3: Drag Race",
                },
                {
                  metrics: '73K',
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
                  metrics: '2k',
                  id: "98a0384e-aed4-432a-bb1e-cf59f5811e23",
                  name: "The 2024 Lexus LC 500: Unveiling Elegance and Power",
                },
                {
                  metrics: '1k',
                  id: "46691b36-85bc-4ec9-9c1b-410370f63c69",
                  name: "2023 Audi R8 GT vs The Cheapest Audi R8 You Can Buy",
                },
                {
                  metrics: '1k',
                  id: "9c2ac983-5409-42d8-8578-6b1c74449b94",
                  name: "2022 Subaru BRZ",
                },
                {
                  metrics: '1k',
                  id: "9c2ac983-5409-42d8-8578-6b1c74449b92",
                  name: "2019 Ferrari 488 Pista",
                },
                {
                  metrics: '1k',
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

    const articles = [{
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
    },{
      "title": "The Corvette Z06 is the best sounding american car",
       "slug": "unleashing-the-beast-the-corvette-z06-the-best-sounding-american-car",
       "body": " When it comes to American muscle cars, the Corvette Z06 stands tall as the epitome of raw power, adrenaline-pumping performance, and a symphony of engine notes that make enthusiasts weak at the knees. From the roaring V8 engine to its iconic design, the Corvette Z06 is widely celebrated as the best sounding American car on the road. Let's dive into the remarkable attributes that make the Corvette Z06 a true auditory masterpiece. The Corvette Z06 delivers a performance that is nothing short of extraordinary. Equipped with a monstrous V8 engine, this American legend produces an awe-inspiring soundtrack that reverberates through the air. With its immense horsepower and torque, the Z06 can unleash a symphony of power and acceleration that echoes with every press of the pedal. The thunderous growl emanating from the exhaust system is a testament to its unrivaled performance capabilities. Under the hood of the Corvette Z06 resides a heart-pounding V8 engine that commands attention. The harmonious blend of power and precision generates a spine-tingling soundtrack that sends shivers down the spine of automotive enthusiasts. The unmistakable roar produced by the V8 engine is a reminder of the engineering marvel that lies within, as it effortlessly propels the Z06 to astonishing speeds. It's an auditory experience like no other. The Corvette Z06's exterior design is not just visually striking, but it also plays a significant role in enhancing its acoustic presence. The aerodynamic bodylines, muscular curves, and aggressive stance all contribute to the car's ability to project an intoxicating symphony of engine notes. From the distinctive quad exhaust pipes to the sculpted air intakes, every element is carefully crafted to amplify the Z06's aural signature. As a true American icon, the Corvette Z06 has left an indelible mark on automotive history. Its lineage spans decades, evolving with each generation to become an emblem of power and performance. The throaty roar of the Corvette Z06 has become synonymous with the American automotive spirit, captivating the hearts of enthusiasts around the world. It represents the pinnacle of American engineering and a celebration of automotive excellence.",
       "metDescription": " The Corvette Z06 is not just a vehicle; it's an auditory experience that ignites passion and excitement in all who encounter it. With its unmatched performance, exhilarating V8 engine, iconic design, and timeless legacy, the Z06 proudly holds the title of the best sounding American car. From the moment the engine roars to life, it captivates both the driver and onlookers, creating an unforgettable symphony of power and performance. The Corvette Z06 is a true testament to American automotive craftsmanship and an embodiment of the thrill of the open road. ",
       "keywords": [
           "Corvette Z06",
           "luxury sports coupe",
           "American car",
           "performance",
           "exhilarating",
           "V8 engine",
           "iconic design"
       ],
       "cars": [
           {
               "make": " Chevrolet",
               "model": " Corvette"
           }
       ]
    },
    {
      "title": "1,100HP Lucid Air v tuned BMW M3: Drag Race",
       "slug": "electrifying-power-versus-legendary-performance-lucid-air-with-1,100hp-takes-on-the-tuned-bmw-m3-in-a-drag-race",
       "body": "In a clash of electrifying power and legendary performance, the highly anticipated Lucid Air with a jaw-dropping 1,100 horsepower goes head-to-head against the tuned BMW M3 in an exhilarating drag race. The Lucid Air, an all-electric luxury sedan pushing boundaries in the EV realm, takes on the iconic BMW M3, renowned for its exceptional performance and track prowess. Let's delve into the showdown between these automotive powerhouses and witness the clash between electrification and performance engineering. The Lucid Air represents a new era of electric vehicles, redefining what's possible in terms of performance and sustainability. With an astonishing 1,100 horsepower at its disposal, the Lucid Air's electric powertrain propels it off the line with lightning-fast acceleration. Its instant torque delivery, thanks to advanced electric motors, catapults the car to incredible speeds in the blink of an eye. The Lucid Air showcases the potential of electric power and demonstrates the future of high-performance vehicles. The BMW M3 has long been hailed as a legendary performer, known for its agile handling and thrilling acceleration. The tuned version of the M3 takes its performance to another level, with upgraded engine components, enhanced aerodynamics, and precise tuning. Its powerful inline-six engine delivers blistering acceleration and an intoxicating exhaust note that resonates with automotive enthusiasts. The M3's heritage and track-focused design make it a formidable opponent on the drag strip. When the Lucid Air and the tuned BMW M3 line up at the drag strip, it's a spectacle that showcases the evolution of automotive performance. The silent yet potent acceleration of the Lucid Air contrasts with the M3's aggressive exhaust notes and adrenaline-inducing launches. The seamless power delivery of the electric sedan competes against the precision engineering and driver engagement of the BMW M3. It's a clash of technological innovation and traditional performance characteristics. This drag race symbolizes the convergence of electrification and performance engineering. The Lucid Air's electric powertrain represents the future of sustainable mobility, proving that high-performance electric vehicles can hold their own against their combustion counterparts. The BMW M3, a pinnacle of performance engineering, demonstrates that the thrill and engagement of traditional internal combustion engines still captivate automotive enthusiasts. It's a battle that highlights the ever-evolving automotive landscape.",
       "metDescription" : "The drag race between the Lucid Air with its astounding 1,100 horsepower and the tuned BMW M3 is a clash of electrifying power and legendary performance. The Lucid Air showcases the potential of electric propulsion, offering blistering acceleration and a glimpse into the future of high-performance electric vehicles. Meanwhile, the BMW M3 exemplifies the heritage of performance engineering and the exhilaration of traditional combustion engines. Ultimately, this drag race serves as a testament to the remarkable advancements in automotive technology, illustrating that both electrification and performance engineering have their place in shaping the future of exhilarating driving experiences.",
       "keywords": [
           "Lucid Air",
           "1,100HP",
           "BMW M3",
           "drag race",
           "electrifying power",
           "legendary performance"
       ],
       "cars": [
           {
               "make": "Lucid",
               "model": " Air"
           },
        {
               "make": "BMW",
               "model": " M3"
           }
       ]
    }
  ]

    const response = articles.find((article) => article.title === topic);

    // const voice = await generateVoice(response.body)
    // console.log(voice);

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
