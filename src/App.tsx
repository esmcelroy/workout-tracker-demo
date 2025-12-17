import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Barbell, Play, TrendUp, BookOpen, SignOut } from '@phosphor-icons/react';
import { PlansView } from '@/components/PlansView';
import { WorkoutView } from '@/components/WorkoutView';
import { ProgressView } from '@/components/ProgressView';
import { LibraryView } from '@/components/LibraryView';
import { AccountView } from '@/components/AccountView';
import { LoginView } from '@/components/LoginView';
import { SignupView } from '@/components/SignupView';
import { SkipToContent } from '@/components/SkipToContent';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

function App() {
  const [activeTab, setActiveTab] = useState('plans');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">FitTrack</h1>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? (
          <LoginView onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <SignupView onSwitchToLogin={() => setAuthView('login')} />
        )}
        <Toaster />
      </>
    );
  }

  // Main app UI for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <SkipToContent />
      <header className="border-b border-border bg-card sticky top-0 z-50" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Barbell size={32} weight="bold" className="text-primary" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">FitTrack</h1>
                <p className="text-sm text-muted-foreground">Smart Workout Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Welcome, <span className="font-semibold text-foreground">{user?.name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
                aria-label="Log out"
              >
                <SignOut size={18} aria-hidden="true" />
                <span className="hidden md:inline">Log Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6" role="main">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isMobile && (
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8" aria-label="Main navigation">
              <TabsTrigger value="plans" className="flex items-center gap-2" aria-current={activeTab === 'plans' ? 'page' : undefined}>
                <Barbell size={18} weight="bold" aria-hidden="true" />
                <span>Plans</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center gap-2" aria-current={activeTab === 'workout' ? 'page' : undefined}>
                <Play size={18} weight="fill" aria-hidden="true" />
                <span>Workout</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2" aria-current={activeTab === 'progress' ? 'page' : undefined}>
                <TrendUp size={18} weight="bold" aria-hidden="true" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2" aria-current={activeTab === 'library' ? 'page' : undefined}>
                <BookOpen size={18} weight="bold" aria-hidden="true" />
                <span>Library</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2" aria-current={activeTab === 'account' ? 'page' : undefined}>
                <span>Account</span>
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="plans" className="mt-0">
            <PlansView />
          </TabsContent>

          <TabsContent value="workout" className="mt-0">
            <WorkoutView />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <ProgressView />
          </TabsContent>

          <TabsContent value="library" className="mt-0">
            <LibraryView />
          </TabsContent>

          <TabsContent value="account" className="mt-0">
            <AccountView />
          </TabsContent>
        </Tabs>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" aria-label="Main navigation">
          <div className="grid grid-cols-5 h-16">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'plans' ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label="Plans"
              aria-current={activeTab === 'plans' ? 'page' : undefined}
            >
              <Barbell size={24} weight={activeTab === 'plans' ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="text-xs font-medium">Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'workout' ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label="Workout"
              aria-current={activeTab === 'workout' ? 'page' : undefined}
            >
              <Play size={24} weight={activeTab === 'workout' ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="text-xs font-medium">Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'progress' ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label="Progress"
              aria-current={activeTab === 'progress' ? 'page' : undefined}
            >
              <TrendUp size={24} weight={activeTab === 'progress' ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="text-xs font-medium">Progress</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'library' ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label="Library"
              aria-current={activeTab === 'library' ? 'page' : undefined}
            >
              <BookOpen size={24} weight={activeTab === 'library' ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="text-xs font-medium">Library</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'account' ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label="Account"
              aria-current={activeTab === 'account' ? 'page' : undefined}
            >
              <SignOut size={24} weight={activeTab === 'account' ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="text-xs font-medium">Account</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;