import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Clients from './pages/Clients';
import Admin from './pages/admin/Admin';
import ScrollToTop from './components/ScrollToTop';
import FloatingActions from './components/FloatingActions';
import Preloader from './components/Preloader';
import { ToastProvider } from './components/Toast';
import { SettingsProvider } from './context/SettingsContext';

const PublicLayout = ({ children }) => (
  <div className="app">
    <Preloader />
    <ScrollToTop />
    <TopBar />
    <Navbar />
    <main>{children}</main>
    <FloatingActions />
    <Footer />
  </div>
);

function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <Router>
          <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/login" element={<Admin />} />
          
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/services/:serviceId" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/clients" element={<PublicLayout><Clients /></PublicLayout>} />
          {/* Catch-all route to handle 404s or deep links */}
          <Route path="*" element={<PublicLayout><Home /></PublicLayout>} />
        </Routes>
      </Router>
    </ToastProvider>
    </SettingsProvider>
  );
}

export default App;
