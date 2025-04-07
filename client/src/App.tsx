import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import VoiceTherapy from "@/pages/VoiceTherapy";
import TextTherapy from "@/pages/TextTherapy";
import StatsPage from "@/pages/StatsPage";
import AboutPage from "@/pages/AboutPage";
import ModulesPage from "@/pages/ModulesPage";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { loadFaceApiScript } from "@/lib/faceApiLoader";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/voice" component={VoiceTherapy} />
          <Route path="/text" component={TextTherapy} />
          <Route path="/stats" component={StatsPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/modules" component={ModulesPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Preload the Face API script when the app starts
  useEffect(() => {
    // Load the Face API script in the background
    loadFaceApiScript().catch(error => {
      console.warn('Could not preload Face API script:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
