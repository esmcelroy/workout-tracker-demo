import { useState } from 'react';
import { EXERCISE_LIBRARY } from '@/lib/exercises';
import { MuscleGroup } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MagnifyingGlass, CheckCircle } from '@phosphor-icons/react';

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'cardio', 'full-body'];

export function LibraryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');

  const filteredExercises = EXERCISE_LIBRARY.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscleGroup === selectedMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-muted-foreground mt-1">Browse exercises and learn proper form</p>
      </div>
      
      <h2 className="sr-only">Exercise Catalog</h2>

      <div className="mb-6">
        <Label htmlFor="exercise-search" className="block mb-2">Search exercises</Label>
        <div className="relative">
          <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="exercise-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedMuscleGroup} onValueChange={(v) => setSelectedMuscleGroup(v as MuscleGroup | 'all')} className="mb-6">
        <TabsList className="w-full flex-wrap h-auto" aria-label="Filter exercises by muscle group">
          <TabsTrigger value="all">All</TabsTrigger>
          {MUSCLE_GROUPS.map((group) => (
            <TabsTrigger key={group} value={group} className="capitalize">
              {group}
            </TabsTrigger>
          ))}
        </TabsList>
        {/* Hidden TabsContent elements required by Radix for proper ARIA relationships */}
        <TabsContent value="all" className="sr-only" />
        {MUSCLE_GROUPS.map((group) => (
          <TabsContent key={`content-${group}`} value={group} className="sr-only" />
        ))}
      </Tabs>

      <div className="text-sm text-muted-foreground mb-4" role="status" aria-live="polite" aria-atomic="true">
        {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
      </div>

      {filteredExercises.length === 0 ? (
        <Card className="p-12 text-center">
          <MagnifyingGlass size={64} weight="thin" className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">No exercises found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or filter
          </p>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {filteredExercises.map((exercise) => (
            <AccordionItem key={exercise.id} value={exercise.id} className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex-1">
                    <div className="font-semibold text-base">{exercise.name}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge className="capitalize">{exercise.muscleGroup}</Badge>
                      <Badge variant="outline" className="capitalize">{exercise.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="sr-only">{exercise.name}</h2>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {exercise.instructions.map((instruction, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Form Cues</h3>
                    <ul className="space-y-2">
                      {exercise.formCues.map((cue, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-muted-foreground">{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
