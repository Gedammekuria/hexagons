import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

async function testCloudinary() {
  console.log('Testing Cloudinary Connection...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Ping Successful!');
    console.log('Status:', result.status);
    
    // Optional: list folders to verify API Key permissions
    // const folders = await cloudinary.api.root_folders();
    // console.log('Folders found:', folders.folders.map(f => f.name).join(', '));
    
  } catch (err) {
    console.error('❌ Cloudinary Connection Failed!');
    console.error('Error:', err.message);
  }
}

testCloudinary();
