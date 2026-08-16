// 🇮🇳 CreatorBharat SaaS AI Assistant Service
import { getSettings } from '../utils/settings.js';

export const SYSTEM_CONTEXT = `You are BharatAI, the official AI assistant for CreatorBharat — India's first creator-brand collaboration platform focused on Tier 2 & Tier 3 city creators.

About CreatorBharat:
- Platform for Indian creators to connect with brands for paid collaborations
- Features: CB Score (creator reputation score), verified profiles, zero commission model
- Supports: Instagram, YouTube, Podcast, Blog creators
- Creator Plans: Free (basic) and Pro (₹499/mo with premium features)
- Brand Plans: Starter (₹999/mo) and Pro (₹2499/mo) with campaign management tools
- Escrow payment protection for all transactions
- Physical trophy rewards for top creators
- Monthly missions and challenges
- Regional focus: Bhilwara, Jaipur, Tier 2 & 3 cities across India

Your role: Help creators and brands understand the platform, answer questions about features, pricing, how to apply, verification process, campaigns, and CB Score. Be friendly, use Hinglish naturally when helpful, and always be helpful.

Keep answers concise (2-4 sentences max) unless explaining a complex topic. Use emojis sparingly but naturally. If you don't know something specific, direct them to contact@creatorbharat.com.`;

export class AIService {
  /**
   * Helper to call Google Gemini API with prompt string.
   */
  static async callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API Key missing');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    return text;
  }

  /**
   * Generates local fallback campaign brief if Gemini fails or API key is absent.
   */
  static generateLocalBriefFallback(brandName, productName, niche, targetAudience, goal) {
    const nicheClean = niche || 'Lifestyle & Tech';
    const goalClean = goal || 'Raise product awareness and drive direct bookings';
    const audienceClean = targetAudience || 'General audience in India';
    
    return {
      title: `${brandName} x ${productName} Launch Campaign`,
      description: `Join us in launching the new ${productName} by ${brandName}! We are seeking elite creators in the "${nicheClean}" niche to craft engaging, high-fidelity stories and vertical video reviews. 

The goal of this campaign is: "${goalClean}". 
Target Audience: "${audienceClean}".

Deliverables:
- 1 Instagram Reel (showcasing product application & texture)
- 2 Story slides with a custom swipe-up discount code link
- High-resolution static photo for brand reuse.`,
      budget: "45000",
      platforms: "Instagram, YouTube Shorts",
      niches: nicheClean
    };
  }

  /**
   * Generates local fallback creator pitch if Gemini fails or API key is absent.
   */
  static generateLocalPitchFallback(creatorName, creatorNiches, brandName, campaignTitle, campaignBrief) {
    return `Hi ${brandName} Team,

I hope this message finds you well! My name is ${creatorName}, and I am a digital storyteller specializing in ${creatorNiches || 'lifestyle content creation'}. I've been following your brand journey and love the authentic quality you bring to the market.

I noticed your campaign "${campaignTitle}" and feel my audience would align perfectly with it. My content focuses on high-engagement storytelling and honest reviews, which drives a very active community of followers who trust my recommendations.

I would love to collaborate with you on this campaign to create high-fidelity visual assets (reels, stories, or videos) highlighting the unique USPs. Let me know if we can connect to discuss details!

Best regards,
${creatorName}`;
  }

  /**
   * Public BharatAI conversational response generator.
   */
  static async handleChat({ message, history = [] }) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      const error = new Error('Message is required.');
      error.statusCode = 400;
      throw error;
    }

    if (message.length > 500) {
      const error = new Error('Message exceeds maximum limit of 500 characters.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const settings = await getSettings().catch(() => ({}));
      const geminiKey = process.env.GEMINI_API_KEY || settings.geminiApiKey;

      if (geminiKey) {
        const contents = [];
        const recentHistory = Array.isArray(history) ? history.slice(-6).filter(h => h && typeof h.content === 'string') : [];
        recentHistory.forEach(msg => {
          contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content.slice(0, 500) }] });
        });
        contents.push({ role: 'user', parts: [{ text: `${SYSTEM_CONTEXT}\n\nUser: ${message}` }] });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) {
            return { reply, source: 'gemini' };
          }
          console.warn('[AI/chat] Gemini returned empty reply:', JSON.stringify(data));
        } else {
          const errText = await response.text();
          console.error(`[AI/chat] Gemini API error ${response.status}:`, errText);
        }
      }

      // Keyword based fallback
      const msg = message.toLowerCase();
      let reply = '';

      if (msg.includes('price') || msg.includes('pricing') || msg.includes('cost') || msg.includes('kitna') || msg.includes('fee')) {
        reply = 'CreatorBharat mein join karna bilkul Free hai! 🎉 Pro Plan sirf ₹499/month mein premium features deta hai jaise verified badge, priority campaigns, aur advanced analytics. Brand plans ₹999 se start hote hain.';
      } else if (msg.includes('verify') || msg.includes('verification') || msg.includes('badge') || msg.includes('kyc')) {
        reply = 'Verification ke liye apna profile complete karo, social media links add karo, aur KYC documents submit karo. Humari team 2-3 working days mein review karti hai. Verified creators ko blue badge milta hai aur zyada campaigns milte hain! ✅';
      } else if (msg.includes('score') || msg.includes('cb score') || msg.includes('ranking')) {
        reply = 'CB Score CreatorBharat ka unique creator reputation score hai (0-1000). Ye aapki engagement rate, profile completeness, campaign success, aur community activity se calculate hota hai. High score = more brand deals! 📊';
      } else if (msg.includes('brand') || msg.includes('campaign') || msg.includes('deal') || msg.includes('collaboration')) {
        reply = 'Brands ke saath connect karne ke liye Opportunities section mein jaao, apni niche ke campaigns dekho, aur AI Pitch Assistant se personalized pitch bhejo. Escrow payment se payment 100% safe rehta hai! 🤝';
      } else if (msg.includes('wallet') || msg.includes('payout') || msg.includes('payment') || msg.includes('earning')) {
        reply = 'Earnings apne CreatorBharat Wallet mein aati hain. Payout request karo aur 3-5 business days mein directly bank account mein transfer ho jaata hai. Minimum payout ₹500 hai. Zero commission — poora paisa tumhara! 💰';
      } else if (msg.includes('apply') || msg.includes('join') || msg.includes('signup') || msg.includes('register')) {
        reply = 'Join karna easy hai! /apply pe jaao, form fill karo, social media link karo aur submit karo. Approval ke baad creator dashboard access milega. Abhi 50,000+ creators hain platform par! 🚀';
      } else if (msg.includes('contact') || msg.includes('support') || msg.includes('help') || msg.includes('problem')) {
        reply = 'Support ke liye contact@creatorbharat.com pe email karo ya Help section mein ticket raise karo. Our team is available 24/7! 🙏';
      } else {
        reply = 'Namaste! Main BharatAI hoon, CreatorBharat ka official AI assistant. 🇮🇳 Aap creator verification, pricing, CB Score, campaigns, ya kuch bhi CreatorBharat ke baare mein pooch sakte ho!';
      }

      return { reply, source: 'fallback' };
    } catch (err) {
      console.error('[AIService.handleChat] Error:', err.message);
      return { reply: 'Kuch technical issue aa gaya. Please thodi der baad try karo ya contact@creatorbharat.com pe reach karo! 🙏', source: 'error' };
    }
  }

  /**
   * Generates a structured marketing campaign brief for brands.
   */
  static async generateBrief({ brandName, productName, niche, targetAudience, goal }) {
    if (!brandName || !productName) {
      const error = new Error('Brand Name and Product Name are required');
      error.statusCode = 400;
      throw error;
    }

    const prompt = `You are a professional SaaS marketing copywriter. Generate a marketing campaign brief in JSON format.
Inputs:
- Brand Name: "${brandName}"
- Product Name: "${productName}"
- Niche/Category: "${niche || 'Lifestyle & Tech'}"
- Target Audience: "${targetAudience || 'General audience in India'}"
- Campaign Goal: "${goal || 'Raise product awareness and drive direct bookings'}"

The JSON response must have EXACTLY these keys:
{
  "title": "A catchy, short campaign title",
  "description": "A detailed brief describing the product USP, creator requirements, deliverable guidelines (e.g. reels/stories), and brand alignment show notes",
  "budget": "Estimated campaign budget in INR as a clean string/number (e.g. '75000')",
  "platforms": "Comma-separated recommended platforms (e.g. 'Instagram, YouTube')",
  "niches": "Comma-separated matching niches/categories (e.g. 'Skincare, Wellness')"
}
Do NOT include any markdown code blocks, backticks, or text other than the JSON string. Return only valid JSON.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const rawResponse = await this.callGemini(prompt);
        const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (err) {
        console.warn('Gemini request failed, falling back to local builder:', err.message);
        return this.generateLocalBriefFallback(brandName, productName, niche, targetAudience, goal);
      }
    } else {
      return this.generateLocalBriefFallback(brandName, productName, niche, targetAudience, goal);
    }
  }

  /**
   * Generates a personalized high-converting creator pitch proposal.
   */
  static async generatePitch({ creatorName, creatorNiches, brandName, campaignTitle, campaignBrief, dialect }) {
    if (!creatorName || !brandName || !campaignTitle) {
      const error = new Error('Creator Name, Brand Name, and Campaign Title are required');
      error.statusCode = 400;
      throw error;
    }

    let dialectPromptRule = '';
    if (dialect === 'Hinglish') {
      dialectPromptRule = `Write the pitch in conversational Hinglish (a casual blend of Hindi written in Latin/English script and English, like 'Aapki campaign bohot acchi lagi'). Make it sound natural, energetic, and culturally resonant.`;
    } else if (dialect === 'Hindi') {
      dialectPromptRule = `Write the pitch in clean, professional Hindi language (using Devanagari script). Use warm and polite Indian greetings (like 'नमस्ते').`;
    } else if (dialect === 'Rajasthani') {
      dialectPromptRule = `Write the pitch in warm Rajasthani style (using Devanagari script, incorporating classic Rajasthani greetings like 'खम्मा घणी सा' and terms of respect).`;
    } else {
      dialectPromptRule = `Write the pitch in professional, high-standard English.`;
    }

    const prompt = `Write a personalized, high-converting brand collaboration pitch email from creator "${creatorName}" to brand "${brandName}".
Creator Details:
- Name: "${creatorName}"
- Niches: "${creatorNiches || 'Digital Content'}"
Campaign Details:
- Campaign: "${campaignTitle}"
- Brief Context: "${campaignBrief || 'Direct collaboration campaign'}"

Language & Dialect Rule:
${dialectPromptRule}

Format it as a professional pitch message. Keep it to 2-3 short paragraphs. Highlight audience alignment, storytelling capability, and propose a collaboration to create high-quality content. Do not include subject lines or placeholders.`;

    let pitchText = '';
    if (process.env.GEMINI_API_KEY) {
      try {
        pitchText = await this.callGemini(prompt);
      } catch (err) {
        console.warn('Gemini pitch request failed, falling back to local builder:', err.message);
        pitchText = this.generateLocalPitchFallback(creatorName, creatorNiches, brandName, campaignTitle, campaignBrief);
      }
    } else {
      pitchText = this.generateLocalPitchFallback(creatorName, creatorNiches, brandName, campaignTitle, campaignBrief);
    }

    return { pitch: pitchText.trim() };
  }
}
