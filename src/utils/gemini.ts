/**
 * Utility functions for interacting with Google's Gemini 2.0 Flash API
 */

/**
 * Generate a response from Gemini 2.0 Flash
 * @param prompt The user's prompt
 * @param apiKey The Gemini API key
 * @param systemPrompt Optional system prompt to guide the model
 * @returns The generated response text
 */
export async function generateGeminiResponse(
  prompt: string,
  apiKey: string = 'AIzaSyCJ6kLKlCo6eW-sp88ktlOvntiq7ASzQ4M',
  systemPrompt?: string
): Promise<string> {
  try {
    // Construct the API URL with the API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash:generateContent?key=${apiKey}`;
    
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
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract the generated text from the response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
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