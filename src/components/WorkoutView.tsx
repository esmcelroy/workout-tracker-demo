import { useState } from 'react';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { WorkoutPlan, WorkoutSession, CompletedSet } from '@/lib/types';
import { EXERCISE_LIBRARY } from '@/lib/exercises';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Lightning, Timer, Trophy } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function WorkoutView() {
  const [plans] = usePersistentState<WorkoutPlan[]>('workout-plans', []);
  const [sessions, setSessions] = usePersistentState<WorkoutSession[]>('workout-sessions', []);
  const [activeSession, setActiveSession] = usePersistentState<WorkoutSession | null>('active-session', null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackQuestion, setFeedbackQuestion] = useState('');
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const startWorkout = (plan: WorkoutPlan) => {
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      startedAt: Date.now(),
      exercises: plan.exercises.map((ex) => {
        const exerciseData = EXERCISE_LIBRARY.find((e) => e.id === ex.exerciseId);
        return {
          exerciseId: ex.exerciseId,
          exerciseName: exerciseData?.name || 'Unknown Exercise',
          completedSets: []
        };
      }),
      status: 'in-progress'
    };
    setActiveSession(newSession);
    setCurrentExerciseIndex(0);
    toast.success('Workout started!');
  };

  const completeSet = (exerciseIndex: number, reps: number, weight?: number) => {
    if (!activeSession) return;

    setActiveSession((current) => {
      if (!current) return null;
      
      const updated = { ...current };
      const setNumber = updated.exercises[exerciseIndex].completedSets.length + 1;
      
      updated.exercises[exerciseIndex].completedSets.push({
        setNumber,
        reps,
        weight,
        completedAt: Date.now()
      });

      return updated;
    });

    toast.success('Set completed!', {
      icon: <CheckCircle size={20} weight="fill" className="text-accent" />
    });
  };

  const finishWorkout = () => {
    if (!activeSession) return;

    setActiveSession((current) => {
      if (!current) return null;
      return {
        ...current,
        completedAt: Date.now(),
        status: 'completed' as const
      };
    });

    setSessions((currentSessions) => [...(currentSessions || []), { ...activeSession, completedAt: Date.now(), status: 'completed' as const }]);
    setActiveSession(null);
    toast.success('Workout completed! Great job!', {
      icon: <Trophy size={20} weight="fill" className="text-accent" />
    });
  };

  const getFeedback = async (exerciseId: string) => {
    const exercise = EXERCISE_LIBRARY.find((e) => e.id === exerciseId);
    if (!exercise || !feedbackQuestion.trim()) return;

    setIsLoadingFeedback(true);
    try {
      const promptText = `You are a professional fitness coach. A user is performing the exercise "${exercise.name}" and has the following question or concern about their form:

"${feedbackQuestion}"

Here are the standard form cues for this exercise:
${exercise.formCues.join('\n')}

Provide specific, actionable feedback to help them improve their form. Keep your response concise (2-3 sentences) and focused on safety and effectiveness.`;

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', false);
      setFeedbackResponse(response);
    } catch (error) {
      toast.error('Failed to get feedback. Try again.');
      setFeedbackResponse(exercise.formCues.join('\n\n'));
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Start a Workout</h2>
          <p className="text-muted-foreground mt-1">Choose a plan to begin your training session</p>
        </div>

        {(plans || []).length === 0 ? (
          <Card className="p-12 text-center">
            <Timer size={64} weight="thin" className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No workout plans available</h3>
            <p className="text-muted-foreground">
              Create a workout plan in the Plans tab before starting a workout
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(plans || []).map((plan) => (
              <Card key={plan.id} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span>{plan.exercises.length} exercises</span>
                  <span>•</span>
                  <span>{plan.exercises.reduce((acc, ex) => acc + ex.sets, 0)} sets</span>
                </div>
                <Button onClick={() => startWorkout(plan)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Start Workout
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const plan = (plans || []).find((p) => p.id === activeSession.planId);
  if (!plan) return null;

  const currentPlanExercise = plan.exercises[currentExerciseIndex];
  const currentSessionExercise = activeSession.exercises[currentExerciseIndex];
  const exerciseData = EXERCISE_LIBRARY.find((e) => e.id === currentPlanExercise.exerciseId);

  if (!exerciseData) return null;

  const completedSetsCount = currentSessionExercise.completedSets.length;
  const totalSets = currentPlanExercise.sets;
  const progressPercent = (currentExerciseIndex / plan.exercises.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{activeSession.planName}</h2>
          <Badge variant="secondary">{currentExerciseIndex + 1} / {plan.exercises.length}</Badge>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Card className="p-8 mb-6">
        <div className="mb-6">
          <h3 className="text-3xl font-bold mb-2">{exerciseData.name}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="capitalize">{exerciseData.muscleGroup}</Badge>
            <Badge variant="outline" className="capitalize">{exerciseData.difficulty}</Badge>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">Target</h4>
          <div className="flex gap-6 text-lg">
            <span>{currentPlanExercise.sets} sets</span>
            <span>×</span>
            <span>{currentPlanExercise.reps} reps</span>
            {currentPlanExercise.weight ? <span>@ {currentPlanExercise.weight} lbs</span> : null}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-3">Form Cues</h4>
          <ul className="space-y-2">
            {exerciseData.formCues.map((cue, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={() => setShowFeedbackDialog(!showFeedbackDialog)}
          variant="outline"
          className="w-full gap-2 mb-6"
        >
          <Lightning size={18} weight="fill" />
          Get AI Form Feedback
        </Button>

        <AnimatePresence>
          {showFeedbackDialog && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="p-4 bg-muted">
                <Input
                  value={feedbackQuestion}
                  onChange={(e) => setFeedbackQuestion(e.target.value)}
                  placeholder="Describe your form question or concern..."
                  className="mb-3"
                />
                <Button
                  onClick={() => getFeedback(exerciseData.id)}
                  disabled={!feedbackQuestion.trim() || isLoadingFeedback}
                  className="w-full mb-3"
                >
                  {isLoadingFeedback ? 'Getting feedback...' : 'Get Feedback'}
                </Button>
                {feedbackResponse && (
                  <div className="p-3 bg-card rounded-md text-sm">
                    {feedbackResponse}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <SetTracker
          sets={totalSets}
          completedSets={currentSessionExercise.completedSets}
          targetReps={currentPlanExercise.reps}
          targetWeight={currentPlanExercise.weight}
          onCompleteSet={(reps, weight) => completeSet(currentExerciseIndex, reps, weight)}
        />
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
          disabled={currentExerciseIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            if (currentExerciseIndex < plan.exercises.length - 1) {
              setCurrentExerciseIndex(currentExerciseIndex + 1);
            } else {
              finishWorkout();
            }
          }}
          disabled={completedSetsCount < totalSets}
          className="flex-1"
        >
          {currentExerciseIndex < plan.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
        </Button>
      </div>
    </div>
  );
}

function SetTracker({
  sets,
  completedSets,
  targetReps,
  targetWeight,
  onCompleteSet
}: {
  sets: number;
  completedSets: CompletedSet[];
  targetReps: number;
  targetWeight?: number;
  onCompleteSet: (reps: number, weight?: number) => void;
}) {
  const [reps, setReps] = useState(targetReps);
  const [weight, setWeight] = useState(targetWeight || 0);
  const currentSet = completedSets.length + 1;

  const handleComplete = () => {
    onCompleteSet(reps, weight > 0 ? weight : undefined);
    setReps(targetReps);
    setWeight(targetWeight || 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: sets }).map((_, i) => {
          const isCompleted = i < completedSets.length;
          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                isCompleted ? 'bg-accent' : 'bg-muted'
              }`}
            />
          );
        })}
      </div>

      {currentSet <= sets && (
        <div className="space-y-3">
          <h4 className="font-semibold">Set {currentSet}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Reps</label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Weight (lbs)</label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
          <Button onClick={handleComplete} className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            <CheckCircle size={20} weight="fill" />
            Complete Set
          </Button>
        </div>
      )}

      {completedSets.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Completed Sets</h4>
          <div className="space-y-1">
            {completedSets.map((set) => (
              <div key={set.setNumber} className="flex justify-between text-sm text-muted-foreground">
                <span>Set {set.setNumber}</span>
                <span>{set.reps} reps {set.weight ? `@ ${set.weight} lbs` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
