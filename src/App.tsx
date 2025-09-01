import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import WorkoutSession from "./pages/WorkoutSession";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

import { useKeepFullScreen } from "./useKeepFullScreen";

const queryClient = new QueryClient();

function AppContent() {
  // עכשיו זה בתוך ה-<Router>
  useKeepFullScreen();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/profile"
        element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        }
      />
      <Route
        path="/analytics"
        element={
          <AuthGuard>
            <Analytics />
          </AuthGuard>
        }
      />
      <Route
        path="/weekly-planner"
        element={
          <AuthGuard>
            <WeeklyPlanner />
          </AuthGuard>
        }
      />
      <Route
        path="/history"
        element={
          <AuthGuard>
            <History />
          </AuthGuard>
        }
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <Index />
          </AuthGuard>
        }
      />
      <Route
        path="/workout/:workoutType"
        element={
          <AuthGuard>
            <WorkoutSession />
          </AuthGuard>
        }
      />
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
