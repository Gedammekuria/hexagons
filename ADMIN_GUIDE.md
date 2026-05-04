# Hexagon Admin Portal Guide

Welcome to the administrative guide for Hexagon Computer Systems. This document outlines how to securely manage the website's content, services, and AI integrations.

## 🔐 Authentication & Security

- **Access**: Navigate to `/admin` to access the dashboard.
- **2-Step Password Reset**: If you lose access, the portal features a secure two-step password recovery process. You will receive a secure PIN via email that must be verified before establishing a new password.
- **Anti-Autofill**: Security measures are in place to prevent aggressive browser autofill from overwriting administrative settings unintentionally.

## 📝 Content Management

### 1. Dynamic Services
The **Services** tab allows you to manage the core offerings displayed on the website.
- **Rich Content**: You can add and edit primary services and sub-services.
- **Key Highlights**: Manage interactive "Key Highlights" lists dynamically without needing manual code changes. Ensure these are fully populated to provide a rich user experience.

### 2. Projects & Recommendations
- **Portfolio**: Manage your project lifecycles and upload relevant imagery.
- **Recommendations**: Formerly "Certificates", this section is now dedicated to official company credentials and professional recommendations.
- **Auto-Sorting**: New entries in both Projects and Recommendations are automatically sorted to appear at the **top** of the frontend grid.

### 3. Blog Publishing
- Create, edit, and publish blog posts to drive SEO and user engagement.
- **Latest First**: The blog system is optimized to show the most recently created or updated posts at the top of the "Our Insights" list automatically.

### 4. Inquiry Tracking
- The **Inquiries** panel allows you to manage client requests.
- **Real-time Completion**: When an inquiry status is updated to "Finished", the system automatically captures and displays the completion timestamp immediately without requiring a page refresh.

### 5. Site Settings
- Manage global configurations, contact information, and UI presentation preferences directly from the centered Settings panel.

## 🖼️ Media Management

All image uploads across the admin portal (Service icons, Project thumbnails, Blog covers) are processed securely through **Cloudinary**.
- This ensures permanent, fast cloud storage and prevents local server filesystem bloat.
- *Troubleshooting*: If you encounter an "Internal Server Error" or "Failed to fetch" during image upload, verify the Cloudinary credentials and CORS settings in the backend environment.

## 🤖 AI Assistant (Google Gemini)

The Hexagon portal is equipped with a Google Gemini-powered AI chatbot to assist site visitors.
- **Context Awareness**: The AI draws context from the actual database content (Services, Projects, Settings). Keeping your site content well-maintained ensures the AI gives accurate answers to clients.
- **Troubleshooting**: If the AI is unresponsive or timing out, check the Vercel logs. Ensure the `GEMINI_API_KEY` is valid and that the Vercel serverless function limits aren't being exceeded.
