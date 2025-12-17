import { useState } from 'react';
import { WorkoutPlan, WorkoutExercise } from '@/lib/types';
import { EXERCISE_LIBRARY } from '@/lib/exercises';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

interface PlanEditorProps {
  plan: WorkoutPlan | null;
  onSave: (plan: WorkoutPlan) => void;
  onCancel: () => void;
}

export function PlanEditor({ plan, onSave, onCancel }: PlanEditorProps) {
  const [name, setName] = useState(plan?.name || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [exercises, setExercises] = useState<WorkoutExercise[]>(plan?.exercises || []);

  const handleAddExercise = () => {
    if (EXERCISE_LIBRARY.length > 0) {
      setExercises([...exercises, {
        exerciseId: EXERCISE_LIBRARY[0].id,
        sets: 3,
        reps: 10,
        weight: 0,
        restSeconds: 60
      }]);
    }
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], ...updates };
    setExercises(updated);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    const newPlan: WorkoutPlan = {
      id: plan?.id || `plan-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      exercises,
      createdAt: plan?.createdAt || Date.now()
    };

    onSave(newPlan);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="plan-name">Plan Name</Label>
          <Input
            id="plan-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Push Day, Full Body Workout"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="plan-description">Description</Label>
          <Textarea
            id="plan-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this workout plan"
            className="mt-1"
            rows={2}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Exercises</Label>
          <Button onClick={handleAddExercise} variant="outline" size="sm" className="gap-2">
            <Plus size={16} weight="bold" />
            Add Exercise
          </Button>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            return (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`exercise-${index}`}>Exercise</Label>
                      <Select
                        value={exercise.exerciseId}
                        onValueChange={(value) => handleUpdateExercise(index, { exerciseId: value })}
                      >
                        <SelectTrigger id={`exercise-${index}`} className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EXERCISE_LIBRARY.map((ex) => (
                            <SelectItem key={ex.id} value={ex.id}>
                              <div className="flex items-center gap-2">
                                <span>{ex.name}</span>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {ex.muscleGroup}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => handleRemoveExercise(index)}
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                    >
                      <Trash size={18} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor={`sets-${index}`}>Sets</Label>
                      <Input
                        id={`sets-${index}`}
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => handleUpdateExercise(index, { sets: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`reps-${index}`}>Reps</Label>
                      <Input
                        id={`reps-${index}`}
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) => handleUpdateExercise(index, { reps: parseInt(e.target.value) || 1 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight-${index}`}>Weight (lbs)</Label>
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        min="0"
                        value={exercise.weight || 0}
                        onChange={(e) => handleUpdateExercise(index, { weight: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`rest-${index}`}>Rest (sec)</Label>
                      <Input
                        id={`rest-${index}`}
                        type="number"
                        min="0"
                        value={exercise.restSeconds || 0}
                        onChange={(e) => handleUpdateExercise(index, { restSeconds: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No exercises added yet. Click "Add Exercise" to get started.
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={!name.trim() || exercises.length === 0} className="flex-1">
          Save Plan
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}
