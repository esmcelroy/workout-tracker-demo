import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { WorkoutPlan } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Play, Barbell } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlanEditor } from '@/components/PlanEditor';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function PlansView() {
  const [plans, setPlans] = useKV<WorkoutPlan[]>('workout-plans', []);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleSavePlan = (plan: WorkoutPlan) => {
    setPlans((currentPlans) => {
      const existingIndex = (currentPlans || []).findIndex((p) => p.id === plan.id);
      if (existingIndex >= 0) {
        const updated = [...(currentPlans || [])];
        updated[existingIndex] = plan;
        return updated;
      } else {
        return [...(currentPlans || []), plan];
      }
    });
    setIsDialogOpen(false);
    toast.success(editingPlan ? 'Plan updated!' : 'Plan created!');
  };

  const handleDeletePlan = (planId: string) => {
    setPlans((currentPlans) => (currentPlans || []).filter((p) => p.id !== planId));
    toast.success('Plan deleted');
  };

  const handleStartWorkout = (plan: WorkoutPlan) => {
    toast.info('Starting workout - switch to Workout tab');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workout Plans</h2>
          <p className="text-muted-foreground mt-1">Create and manage your training programs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreatePlan} className="gap-2">
              <Plus size={20} weight="bold" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            </DialogHeader>
            <PlanEditor plan={editingPlan} onSave={handleSavePlan} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {(plans || []).length === 0 ? (
        <Card className="p-12 text-center">
          <Barbell size={64} weight="thin" className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No workout plans yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first workout plan to start tracking your fitness journey
          </p>
          <Button onClick={handleCreatePlan} className="gap-2">
            <Plus size={20} weight="bold" />
            Create Your First Plan
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {(plans || []).map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{plan.exercises.length} exercises</span>
                  <span>•</span>
                  <span>{plan.exercises.reduce((acc, ex) => acc + ex.sets, 0)} total sets</span>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleStartWorkout(plan)} className="flex-1 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Play size={18} weight="fill" />
                    Start Workout
                  </Button>
                  <Button onClick={() => handleEditPlan(plan)} variant="outline" size="icon">
                    <Pencil size={18} />
                  </Button>
                  <Button onClick={() => handleDeletePlan(plan.id)} variant="outline" size="icon">
                    <Trash size={18} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
