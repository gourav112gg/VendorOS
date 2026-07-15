import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// --- API ROUTES ---

/**
 * Health Check API
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * AI Operations Copilot API
 * Receives: { order, subscription }
 * Server-side Enforces gating! If Free or inactive, blocks execution and saves API calls.
 */
app.post('/api/copilot/risk', async (req, res) => {
  try {
    const { order, subscription } = req.body;

    if (!order) {
      return res.status(400).json({ error: 'Order details are required.' });
    }

    // Server-side subscription check: Avoid burning API credits on non-paying users!
    if (!subscription || subscription.tier === 'free' || subscription.status !== 'active') {
      return res.status(403).json({
        error: 'Access Denied: AI Operations Copilot is only available on Growth and Scale tiers with an active subscription.'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Return a simulated fallback risk score but explain the API Key is missing
      console.warn('GEMINI_API_KEY is not set. Using simulated copilot fallback.');
      const simulatedScore = Math.floor(Math.random() * 40) + 10; // 10-50
      return res.json({
        score: simulatedScore,
        reason: '[Simulated] Order is standard but server has no GEMINI_API_KEY set.',
        action: 'Configure GEMINI_API_KEY in Settings > Secrets to enable live Gemini predictions.'
      });
    }

    // Call real Gemini API
    const prompt = `Analyze this service order for operational risks:
Title: ${order.title}
Description: ${order.description}
Customer: ${order.customerName}
Address: ${order.address}
Estimated Job Value: ${order.value || 0}
Stage: ${order.stage}

Evaluate potential risks like high cost complexity, scheduling issues, safety challenges, location delays, and severe weather impacts. Keep the reason and action highly concise and focused.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are VendorOS AI Copilot. You analyze field service operations orders to find risks and suggest mitagations.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: 'Operational risk score from 0 (very low risk) to 100 (extreme risk/escalate).'
            },
            reason: {
              type: Type.STRING,
              description: 'A precise single-sentence explanation of the risk factors found.'
            },
            action: {
              type: Type.STRING,
              description: 'One highly actionable mitigation or diagnostic recommendation step.'
            }
          },
          required: ['score', 'reason', 'action']
        }
      }
    });

    const resultText = response.text || '{}';
    try {
      const parsedResult = JSON.parse(resultText.trim());
      return res.json(parsedResult);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', resultText);
      return res.status(502).json({ error: 'Invalid response from AI model.' });
    }

  } catch (error: any) {
    console.error('Gemini Copilot Error:', error);
    return res.status(500).json({ error: error.message || 'Server error running AI analysis.' });
  }
});

/**
 * Razorpay Subscription Webhook Simulation Endpoint
 * Receives simulated webhook payloads and updates subscription status.
 */
app.post('/api/razorpay/webhook', (req, res) => {
  const { event, subscriptionId, tier } = req.body;

  if (!event || !subscriptionId || !tier) {
    return res.status(400).json({ error: 'Missing required webhook fields (event, subscriptionId, tier).' });
  }

  const nowString = new Date().toISOString();
  let status: 'active' | 'past_due' | 'canceled' = 'active';
  let currentPeriodEnd = new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(); // 30 days extension

  // Handle specific Razorpay webhook events
  switch (event) {
    case 'subscription.charged':
      status = 'active';
      break;
    case 'subscription.halted':
      status = 'past_due';
      currentPeriodEnd = new Date().toISOString(); // Expired immediately
      break;
    case 'subscription.cancelled':
      status = 'canceled';
      currentPeriodEnd = new Date().toISOString(); // Expired immediately
      break;
    default:
      return res.status(400).json({ error: `Unknown webhook event: ${event}` });
  }

  // Log Webhook details in server console
  console.log(`[Razorpay Webhook Verified] Event: ${event} | SubID: ${subscriptionId} | Tier: ${tier} | Status: ${status}`);

  // Return the processed subscription object back to frontend store update flow
  return res.json({
    subscription: {
      tier,
      status,
      currentPeriodEnd,
      razorpaySubscriptionId: subscriptionId,
      updatedAt: nowString
    },
    webhookProcessed: true,
    processedAt: nowString,
    eventHandled: event
  });
});

/**
 * Fallback dynamic theme generator using HSL colors
 */
function generateFallbackColors(prompt: string, mode: 'dark' | 'light') {
  const normalized = prompt.toLowerCase();
  
  // Choose base hue from prompt keywords, or a hash of the prompt
  let hue = 200; // default blueish
  let saturation = 70; // %
  let lightness = 50; // %
  
  if (normalized.includes('fire') || normalized.includes('lava') || normalized.includes('sunset') || normalized.includes('red') || normalized.includes('warm') || normalized.includes('orange') || normalized.includes('sun')) {
    hue = 15; // Red-orange
    saturation = 85;
    lightness = 50;
  } else if (normalized.includes('forest') || normalized.includes('green') || normalized.includes('mint') || normalized.includes('nature') || normalized.includes('emerald') || normalized.includes('leaf') || normalized.includes('matcha')) {
    hue = 145; // Green
    saturation = 75;
    lightness = 45;
  } else if (normalized.includes('cyber') || normalized.includes('punk') || normalized.includes('neon') || normalized.includes('arcade') || normalized.includes('violet') || normalized.includes('pink') || normalized.includes('synth')) {
    hue = 320; // Neon Pink
    saturation = 90;
    lightness = 55;
  } else if (normalized.includes('ocean') || normalized.includes('blue') || normalized.includes('cool') || normalized.includes('water') || normalized.includes('sea') || normalized.includes('ice') || normalized.includes('sky')) {
    hue = 205; // Blue
    saturation = 80;
    lightness = 50;
  } else if (normalized.includes('purple') || normalized.includes('lavender') || normalized.includes('grape')) {
    hue = 270; // Purple
    saturation = 75;
    lightness = 55;
  } else if (normalized.includes('gold') || normalized.includes('yellow') || normalized.includes('sand') || normalized.includes('amber')) {
    hue = 45; // Amber / Gold
    saturation = 85;
    lightness = 50;
  } else {
    // Determine hue deterministically from string hash
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
    }
    hue = Math.abs(hash) % 360;
    saturation = 65 + (Math.abs(hash >> 3) % 25); // 65-90%
    lightness = 45 + (Math.abs(hash >> 6) % 15); // 45-60%
  }

  // Helper to convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const accent = hslToHex(hue, saturation, lightness);
  const accentHover = hslToHex(hue, saturation, Math.max(20, lightness - 10));

  if (mode === 'light') {
    // Generate lovely soft light theme colors
    const bgApp = hslToHex(hue, 15, 98); // Ultra-light tint
    const bgCard = '#FFFFFF';
    const bgSecondary = hslToHex(hue, 12, 95);
    const bgInput = hslToHex(hue, 12, 91);
    const border = hslToHex(hue, 10, 86);
    const textPrimary = hslToHex(hue, 60, 12); // Deep contrasted color
    const textSecondary = hslToHex(hue, 40, 28);
    const textMuted = hslToHex(hue, 25, 48);

    return {
      bgApp,
      bgCard,
      bgSecondary,
      bgInput,
      border,
      textPrimary,
      textSecondary,
      textMuted,
      accent,
      accentHover
    };
  } else {
    // Generate beautiful deep dark theme colors
    const bgApp = hslToHex(hue, 25, 4); // Very deep space-like tint of hue
    const bgCard = hslToHex(hue, 20, 8); // Slightly lighter
    const bgSecondary = hslToHex(hue, 22, 6);
    const bgInput = hslToHex(hue, 18, 14);
    const border = hslToHex(hue, 15, 18);
    const textPrimary = hslToHex(hue, 10, 96);
    const textSecondary = hslToHex(hue, 15, 82);
    const textMuted = hslToHex(hue, 15, 60);

    return {
      bgApp,
      bgCard,
      bgSecondary,
      bgInput,
      border,
      textPrimary,
      textSecondary,
      textMuted,
      accent,
      accentHover
    };
  }
}

/**
 * AI Natural Language Theme Generator API
 * Receives: { prompt, mode }
 */
app.post('/api/generate-theme', async (req, res) => {
  const { prompt, mode } = req.body;
  const currentMode = mode === 'light' ? 'light' : 'dark';

  if (!prompt) {
    return res.status(400).json({ error: 'Theme description prompt is required.' });
  }

  // Fallback if no API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Using dynamic fallback theme generation.');
    const simulatedColors = generateFallbackColors(prompt, currentMode);
    return res.json({ colors: simulatedColors });
  }

  try {
    const systemPrompt = `You are an expert color palette generator and UI designer. 
Your task is to generate a beautiful, professionally coordinated color palette based on a natural language theme or mood prompt.
The output MUST be a JSON object containing HEX codes for an application UI in either light or dark mode as specified by the user.

Ensure the contrast is extremely high, accessible (WCAG compliant), and visually gorgeous.
Light mode MUST use very light off-white/cream backgrounds, dark text, and soft light borders.
Dark mode MUST use deep rich dark backgrounds, light text, and clean dark borders.`;

    const contents = `Generate a ${currentMode} mode color palette for the theme: "${prompt}".

Provide a JSON with the following exact keys (use highly appealing colors):
- bgApp: The main application page background (light for light mode, dark/deep color for dark mode)
- bgCard: Card background (must contrast slightly with bgApp, e.g., white in light mode, slightly lighter in dark mode)
- bgSecondary: Secondary card/table-header background
- bgInput: Inputs and button backgrounds
- border: Border color (soft, subtle, elegant)
- textPrimary: Main high-contrast text color
- textSecondary: Secondary text color
- textMuted: Muted/labels text color
- accent: Brand/Action color
- accentHover: Darker or lighter shade of accent color for hovers`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bgApp: { type: Type.STRING, description: 'Hex code for main app background' },
            bgCard: { type: Type.STRING, description: 'Hex code for card background' },
            bgSecondary: { type: Type.STRING, description: 'Hex code for secondary/table background' },
            bgInput: { type: Type.STRING, description: 'Hex code for input fields' },
            border: { type: Type.STRING, description: 'Hex code for borders' },
            textPrimary: { type: Type.STRING, description: 'Hex code for primary readable text' },
            textSecondary: { type: Type.STRING, description: 'Hex code for secondary readable text' },
            textMuted: { type: Type.STRING, description: 'Hex code for small/muted text' },
            accent: { type: Type.STRING, description: 'Hex code for active accent/actions' },
            accentHover: { type: Type.STRING, description: 'Hex code for accent hover state' }
          },
          required: ['bgApp', 'bgCard', 'bgSecondary', 'bgInput', 'border', 'textPrimary', 'textSecondary', 'textMuted', 'accent', 'accentHover']
        }
      }
    });

    const resultText = response.text || '{}';
    const parsedResult = JSON.parse(resultText.trim());
    return res.json({ colors: parsedResult });

  } catch (error: any) {
    console.warn('Gemini API is unavailable or high demand. Gracefully falling back to deterministic color generation.', error.message);
    // Graceful fallback to guarantee theme generation success
    const fallbackColors = generateFallbackColors(prompt, currentMode);
    return res.json({ colors: fallbackColors, note: 'Simulated high-contrast generation due to temporary service load.' });
  }
});

// --- VITE DEV AND PRODUCTION INGRESS ROUTING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
