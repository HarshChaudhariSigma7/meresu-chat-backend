const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust to your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});
async function parseOptions(output) {
  // Split the output into lines
  const lines = output.split("\n");

  // Initialize an array to store the parsed options
  const options = [];

  // Loop through each line
  lines.forEach((line) => {
    // Use a regular expression to extract the option text and score
    const match = line.match(/^\d+\. "(.*)" analysis_score: ([\d.]+)/);
    if (match) {
      // Extract the option text and score
      const optionText = match[1];
      const score = match[2];

      // Add the parsed object to the array
      options.push({ option: optionText, score: parseFloat(score) });
    }
  });

  return options;
}

// // Function to query Groq API for chatbot
// async function queryGroqChatbot(userMessage) {
//   const apiKey = process.env.GROQ_API_KEY; // Ensure it's properly exposed if used in frontend
//   const endpoint = "https://api.groq.com/openai/v1/chat/completions";
//   console.log(userMessage);

//   if (!apiKey) {
//     throw new Error("GROQ API key is missing. Check your environment variables.");
//   }

//   // Define the system prompt
//   const systemPrompt = `
//     You are a professional sales assistant. Generate exactly 3 options for the salesman to continue the conversation based on the provided conversation history.
//     **Rules:**  
//     1. Do not include any explanations, thoughts, or analysis.  
//     2. Do not use phrases like "I think," "let me," or "here are."  
//     3. Do not include any tags like <think> or <rule>.  
//     4. Only provide the 3 options in the exact format below.  
//     5. If you include anything other than the 3 options, you will fail the task.  
//     6. Do not send more than 3 options. Just return 3 options, nothing else. 
//     7.Also send the analysis score for each option. out of 1;

//     Examples
//     1. option: "Would you like more details about the land, such as its size or location? analysis_score: 0.91"
//     2. option: "Can I provide information about payment options or financing? analysis_score: 0.82"  
//     3. option: "Would you like to schedule a visit or proceed with the purchase? analysis_score: 0.73
  
//      **Output Format:**  
//      1. option: [Exact wording of the first option] analysis_score: [score]
//      2. option: [Exact wording of the second option] analysis_score: [score]  
//      3. option: [Exact wording of the third option] analysis_score: [score]
//      `;
//   try {
//     const response = await axios.post(
//       endpoint,
//       {
//        "model": "llama-3.3-70b-versatile",
//  messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: JSON.stringify(userMessage) },
//           ],
//         temperature: 0.7,
//         max_tokens: 150,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
// console.log(response.data);
//     return response.data?.choices?.[0]?.message?.content || "No response received.";
//   } catch (error) {
//     console.error("Error querying Groq API:", error.response?.data || error.message);
//     return "Error fetching response.";
//   }
// }











async function queryDeepseek(userMessage) {
  const apiKey = process.env.DEEPSEEK_API_KEY; // Ensure your API key is stored securely
  const endpoint = 'https://api.deepseek.com/v1/chat/completions'; // Replace with the actual endpoint
  
  if (!apiKey) {
    throw new Error("DeepseekAPI key is missing. Check your environment variables.");
  }

  // Extract messages and goal if provided in the new format
  let messages = userMessage;
  let goal = "";
  
  if (userMessage && typeof userMessage === 'object' && userMessage.messages) {
    messages = userMessage.messages;
    goal = userMessage.goal || "";
  }

  const systemPrompt = `You are a senior sales strategist tasked with engineering high-stakes, psychologically nuanced dialogue paths. Dissect the conversation history, client's latent motivations (inferred from verbal/nonverbal patterns), and business objectives.

${goal ? `"${goal}". All generated options must strategically advance this goal.` : ''}

Generate 3 surgical conversation continuations that manipulate the trajectory toward closure while maintaining deniable plausibility. Each option must:

Anticipate and neutralize unspoken barriers (e.g., budget concerns, authority chains, competitor traps) through embedded framing.

Leverage value asymmetry by aligning the client's implicit priorities (ROI timelines, risk aversion, political capital) with the product's irreversible advantages.

Create temporal urgency without explicit deadlines, using subtle time-sensitivity cues.

Blend tone by mirroring the client's communication archetype (Analyst/Charismatic/Decider) while layering subtle dominance cues (conditional phrasing, strategic pauses implied through punctuation).

Critical Constraints:

Zero speculative offers: All value propositions must derive directly from pre-approved battle cards.

Steel-manned neutrality: Responses must pass adversarial testing—no overt pressure tactics detectable by a hostile procurement team.

4D Chess: Each option must function as both a standalone move and a setup for 3 future plays (e.g., up-sell triggers, reference seeding, escalation ladders).

Output Protocol:

ONLY 3 OPTIONS as standalone lines of exact dialogue the salesperson can utter, followed by an analysis score.

NO STRATEGY TAGS, explanations, or formatting beyond numbered options.

Mirror the client's last sentence structure (question→question, statement→statement).

17-23 words per option—short enough to feel spontaneous, long enough to contain layered intent.

Example of valid output:

'Let's benchmark your last project's resale uplift—was the maintenance clause a factor? analysis_score: 0.91'

'Competitor quotes often exclude monsoon-proofing—should we pressure-test their specs? analysis_score: 0.82'

'If we align terms by Friday, could your CFO review next week? analysis_score: 0.73'

Example of what NOT to do:
'[Option 1] Let's benchmark... → [strategy labels]`

  try {
    const response = await axios.post(
      endpoint,
      {
        model: "deepseek-chat", // Replace with the correct model name
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(messages) },
        ],
        temperature: 0.7, // Adjust for creativity vs. determinism
        max_tokens: 150, // Limit response length
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying Deepseek API:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected from IP:', socket.handshake.address);

  socket.on('chat-message', async (userMessage) => {  
    console.log('Message received from client:', userMessage); // Log the received message
    
    // Log the goal if it exists in the new format
    if (userMessage && typeof userMessage === 'object' && userMessage.goal) {
      console.log('Goal received:', userMessage.goal);
    }
    
    socket.emit('loading'); // Emit loading event

    try {
      const chatbotResponse = await queryDeepseek(userMessage);
      const parsedOptions = await parseOptions(chatbotResponse); // Parse the response
      socket.emit('parsedoptions', parsedOptions);
      console.log(parsedOptions);
    } catch (error) {
      socket.emit('chat-error', { error: 'Failed to get a response from the chatbot' });
    } finally {
      socket.emit('loaded'); // Emit loaded event
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});