# Hexagon Computer Systems

Welcome to the Hexagon Computer Systems repository. This project consists of a dynamic public-facing website and a secure, feature-rich administrative portal.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, React Router DOM, Lucide React icons.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (using Neon Serverless for modern, scalable cloud database).
- **Storage**: Cloudinary (for secure, robust media and image uploads).
- **AI Integration**: Google Gemini API (powering the intelligent customer assistant).
- **Deployment**: Configured for Vercel.

## ✨ Key Features & UX Optimizations

- **Mobile-First Navigation**: Optimized hamburger menu with toggleable multi-level dropdowns for services, specifically designed for touch interaction.
- **Intelligent Sorting**: All dynamic content (Blogs, Projects, Recommendations) is automatically sorted to show the latest entries at the top of the frontend.
- **Modern Preloader**: A responsive, centered splash screen using dynamic viewport units (`dvh`) for consistent presentation across all mobile browsers.
- **Rich Media**: Integrated Cloudinary for high-performance image delivery and a custom video player with interactive controls.
- **Real-time Admin Tracking**: Instant UI updates for inquiry completion and status changes.

## 📁 Project Structure

```text
.
├── public/           # Static assets
├── server/           # Express backend
│   ├── src/          # Backend routes, controllers, and DB setup
│   ├── package.json  # Backend dependencies
│   └── index.js      # Server entry point
├── src/              # React frontend
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route pages (Home, Admin, Services, etc.)
│   └── index.css     # Global styles and design system
├── package.json      # Frontend & root dependencies
└── vercel.json       # Vercel deployment configuration
```

## 🛠️ Getting Started Locally

1. **Install Dependencies**
   Run the following command in the root directory to install both frontend and backend dependencies:
   ```bash
   npm install
   cd server && npm install
   cd ..
   ```

2. **Environment Variables**
   Create a `.env` file in the `/server` directory and configure your essential keys:
   ```env
   DATABASE_URL=your_neon_postgres_url
   CLOUDINARY_URL=your_cloudinary_url
   GEMINI_API_KEY=your_google_gemini_api_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Run Development Servers**
   Start both the frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```
   The frontend will typically run on `http://localhost:5173` and the backend API on `http://localhost:5000`.

## 🚢 Deployment

The project is optimized for deployment on Vercel. The included `vercel.json` and package scripts handle the build process, serving the frontend, and routing API requests to the serverless backend.
