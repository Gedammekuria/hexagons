# Hexagon Computer Systems Portal

Hexagon Computer Systems is a professional web application designed for an Ethiopian IT solutions provider. It features a modern, responsive frontend for clients and a powerful, unified administrative dashboard for managing company content, projects, inquiries, and services.

## 🚀 Key Features

### Frontend (Client-Facing)
- **Responsive Hero Slider**: Showcases core services with interactive dot navigation.
- **Service Management**: Detailed sections for IT Support, Networking, Security, Digital Marketing, Software Development, and more.
- **Dynamic Projects & Blog**: Displays latest works and insights directly from the database.
- **Interactive Inquiry Form**: Sophisticated contact system with service-specific sub-categories.
- **AI Assistant**: Integrated AI chatbot to help users with service-related queries.
- **SEO Optimized**: Every page includes dynamic Meta tags and SEO best practices.

### Admin Dashboard (Management)
- **Unified Interface**: Standardized table layouts across all management modules.
- **Full Data Control**: Manage Team Members, Projects, Blog Posts, Brands/Partners, and Clients.
- **Real-time Search & Filtering**: Global search and date-based filtering for every module.
- **Smart Pagination**: Efficient handling of large datasets with consistent 15-item-per-page limits.
- **Site Settings**: Centralized control for company contact info, social media (including TikTok), and business stats.
- **Security**: Secure authentication with password management.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide-React, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Prisma/Sequelize compatible).
- **Storage**: Cloudinary (for image/media management).
- **AI**: Google Gemini API (for the AI Customer Assistant).

## 📥 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL Database instance
- Cloudinary Account (for uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Hexagon front and backend"
   ```

2. **Setup Frontend:**
   ```bash
   npm install
   ```

3. **Setup Backend:**
   ```bash
   cd server
   npm install
   ```

### Environment Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/hexagon"
JWT_SECRET="your_secret_key"
CLOUDINARY_CLOUD_NAME="your_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
GEMINI_API_KEY="your_gemini_key"
```

Create a `.env` file in the root directory:

```env
VITE_API_URL="http://localhost:5000"
```

## 🏃 Running the Application

### Development Mode

**Run the backend:**
```bash
cd server
npm start
```

**Run the frontend:**
```bash
# In the root directory
npm run dev
```

### Production Build

```bash
npm run build
```
The static files will be generated in the `dist` folder.

## 📄 License

This project is proprietary and built specifically for Hexagon Computer Systems.

---
*Built with ❤️ for Hexagon Computer Systems.*
