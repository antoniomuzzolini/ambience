// Simple test script to check registration endpoint
const testData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

async function testRegistration() {
  try {
    const response = await fetch('https://your-vercel-url.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response.status);
    
    const result = await response.text();
    console.log('Response:', result);
    
    if (!response.ok) {
      console.error('Error details:', result);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Replace with your actual Vercel URL
console.log('Update the URL in this script with your actual Vercel URL, then run: node test-registration.js');