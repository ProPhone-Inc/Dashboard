/**
 * Utility functions for interacting with Google's Gemini API
 */

/**
 * Generate a response from Gemini
 * @param prompt The user's prompt
 * @param apiKey The Gemini API key
 * @param systemPrompt Optional system prompt to guide the model (will be prepended to the user prompt)
 * @returns The generated response text
 */
export async function generateGeminiResponse(
  prompt: string,
  apiKey: string = 'AIzaSyCJ6kLKlCo6eW-sp88ktlOvntiq7ASzQ4M', // Default API key
  systemPrompt?: string
): Promise<string> {
  try {
    // Construct the API URL with the API key - using gemini-2.0-flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // Prepare the request body
    const requestBody: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };
    
    // Add system prompt if provided
    if (systemPrompt) {
      // For Gemini 2.0 Flash, prepend the system prompt to the user message
      requestBody.contents.unshift({
        role: "system",
        parts: [{ text: systemPrompt }]
      });
    }
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || 'Failed to generate response from Gemini');
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract the generated text from the response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }
    
    const generatedText = data.candidates[0].content.parts
      .map((part: any) => part.text)
      .join('');
    
    return generatedText;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}