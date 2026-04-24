import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';
import { SidebarProvider } from './components/AdminLayout';

export default function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="flex flex-col min-h-screen relative">
          {/* Background Glows */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute w-[500px] h-[500px] bg-glow-purple -top-20 -left-20 opacity-60"></div>
            <div className="absolute w-[600px] h-[600px] bg-glow-blue -bottom-40 -right-20 opacity-40"></div>
            <div className="absolute w-[400px] h-[400px] bg-glow-pink top-1/4 translate-x-1/2 opacity-30"></div>
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    </Router>
  );
}
