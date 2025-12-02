
const PROXY_URL = "https://corsproxy.io/?";
const API_URL = "https://imgcloudapi-fpb4gspc.manus.space/api/upload";
const API_KEY = "nFPS_jayclKpNwUgsAffelzuNgCqw7g7";

export const uploadFile = async (file: File): Promise<string> => {
  // Sanitize filename: replace spaces with underscores to prevent API issues
  const sanitizedFileName = file.name.replace(/\s+/g, '_');
  
  const formData = new FormData();
  // Append file with sanitized name. Note: The API expects the field name 'file'.
  formData.append('file', file, sanitizedFileName);

  try {
    const response = await fetch(PROXY_URL + API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        // Do NOT set Content-Type header manually when using FormData; the browser sets it with the boundary.
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    // Try parsing JSON, fallback to text if API returns direct URL string or unexpected format
    const textResponse = await response.text();
    try {
        const jsonResponse = JSON.parse(textResponse);
        // Adjust these checks based on the actual API response structure
        if (jsonResponse.url) return jsonResponse.url;
        if (jsonResponse.data?.url) return jsonResponse.data.url;
        if (jsonResponse.file?.url) return jsonResponse.file.url;
        
        // If JSON but no known URL field
        return textResponse; 
    } catch (e) {
        // Response was not JSON, assume it's the raw URL string
        return textResponse;
    }

  } catch (error: any) {
    console.error("Upload Service Error:", error);
    throw new Error(error.message || "حدث خطأ أثناء رفع الملف");
  }
};
