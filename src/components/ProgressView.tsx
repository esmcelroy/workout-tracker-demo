import { useKV } from '@github/spark/hooks';
import { WorkoutSession } from '@/lib/types';
import { EXERCISE_LIBRARY } from '@/lib/exercises';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendUp, CalendarBlank, Fire } from '@phosphor-icons/react';
import { format } from 'date-fns';

export function ProgressView() {
  const [sessions] = useKV<WorkoutSession[]>('workout-sessions', []);

  const completedSessions = (sessions || []).filter((s) => s.status === 'completed');
  const totalWorkouts = completedSessions.length;
  const totalSets = completedSessions.reduce(
    (acc, session) => acc + session.exercises.reduce((ex, e) => ex + e.completedSets.length, 0),
    0
  );

  const recentSessions = completedSessions
    .sort((a, b) => (b.completedAt || b.startedAt) - (a.completedAt || a.startedAt))
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Progress</h2>
        <p className="text-muted-foreground mt-1">Track your fitness journey and achievements</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Trophy size={24} weight="fill" className="text-accent" />
            </div>
            <div>
              <div className="text-3xl font-bold">{totalWorkouts}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Fire size={24} weight="fill" className="text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold">{totalSets}</div>
              <div className="text-sm text-muted-foreground">Total Sets</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-secondary/10">
              <CalendarBlank size={24} weight="fill" className="text-secondary" />
            </div>
            <div>
              <div className="text-3xl font-bold">
                {completedSessions.length > 0
                  ? Math.floor((Date.now() - completedSessions[completedSessions.length - 1].startedAt) / (1000 * 60 * 60 * 24))
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Workout History</h3>
        {recentSessions.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendUp size={64} weight="thin" className="mx-auto text-muted-foreground mb-4" />
            <h4 className="text-xl font-semibold mb-2">No completed workouts yet</h4>
            <p className="text-muted-foreground">
              Complete your first workout to see your progress here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => {
              const duration = session.completedAt
                ? Math.round((session.completedAt - session.startedAt) / (1000 * 60))
                : 0;

              return (
                <Card key={session.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{session.planName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(session.startedAt, 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <Badge variant="secondary">{duration} min</Badge>
                  </div>

                  <div className="space-y-2">
                    {session.exercises.map((exercise) => {
                      const exerciseData = EXERCISE_LIBRARY.find((e) => e.id === exercise.exerciseId);
                      return (
                        <div key={exercise.exerciseId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{exercise.exerciseName}</span>
                            {exerciseData && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {exerciseData.muscleGroup}
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            {exercise.completedSets.length} sets
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
