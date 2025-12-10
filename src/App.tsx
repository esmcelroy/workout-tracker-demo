import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Barbell, Play, TrendUp, BookOpen } from '@phosphor-icons/react';
import { PlansView } from '@/components/PlansView';
import { WorkoutView } from '@/components/WorkoutView';
import { ProgressView } from '@/components/ProgressView';
import { LibraryView } from '@/components/LibraryView';
import { useIsMobile } from '@/hooks/use-mobile';

function App() {
  const [activeTab, setActiveTab] = useState('plans');
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Barbell size={32} weight="bold" className="text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FitTrack</h1>
              <p className="text-sm text-muted-foreground">Smart Workout Tracker</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isMobile && (
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Barbell size={18} weight="bold" />
                <span>Plans</span>
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center gap-2">
                <Play size={18} weight="fill" />
                <span>Workout</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendUp size={18} weight="bold" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <BookOpen size={18} weight="bold" />
                <span>Library</span>
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
        </Tabs>
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'plans' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Barbell size={24} weight={activeTab === 'plans' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'workout' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Play size={24} weight={activeTab === 'workout' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'progress' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <TrendUp size={24} weight={activeTab === 'progress' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Progress</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex flex-col items-center justify-center gap-1 ${
                activeTab === 'library' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <BookOpen size={24} weight={activeTab === 'library' ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">Library</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;
