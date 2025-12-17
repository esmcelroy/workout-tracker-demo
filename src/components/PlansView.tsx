import { useState } from 'react';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { WorkoutPlan, WorkoutTemplate } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Play, Barbell, Books } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlanEditor } from '@/components/PlanEditor';
import { TemplateLibrary } from '@/components/TemplateLibrary';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function PlansView() {
  const [plans, setPlans] = usePersistentState<WorkoutPlan[]>('workout-plans', []);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

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

  const handleStartWorkout = (_plan: WorkoutPlan) => {
    toast.info('Starting workout - switch to Workout tab');
  };

  const handleImportTemplate = (template: WorkoutTemplate) => {
    const newPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      name: template.name,
      description: template.description,
      exercises: template.exercises,
      createdAt: Date.now()
    };
    
    setPlans((currentPlans) => [...(currentPlans || []), newPlan]);
    setIsTemplateDialogOpen(false);
    toast.success(`"${template.name}" imported successfully!`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Plans</h1>
          <p className="text-muted-foreground mt-1">Create and manage your training programs</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Books size={20} weight="bold" />
                Browse Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Workout Templates</DialogTitle>
              </DialogHeader>
              <TemplateLibrary onImport={handleImportTemplate} />
            </DialogContent>
          </Dialog>
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
      </div>

      {(plans || []).length === 0 ? (
        <Card className="p-12 text-center">
          <Barbell size={64} weight="thin" className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">No workout plans yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first workout plan or import a pre-built template
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleCreatePlan} className="gap-2">
              <Plus size={20} weight="bold" />
              Create Your First Plan
            </Button>
            <Button onClick={() => setIsTemplateDialogOpen(true)} variant="outline" className="gap-2">
              <Books size={20} weight="bold" />
              Browse Templates
            </Button>
          </div>
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
                    <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
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
                    <Play size={18} weight="fill" aria-hidden="true" />
                    Start Workout
                  </Button>
                  <Button onClick={() => handleEditPlan(plan)} variant="outline" size="icon" aria-label={`Edit ${plan.name} plan`}>
                    <Pencil size={18} aria-hidden="true" />
                  </Button>
                  <Button onClick={() => handleDeletePlan(plan.id)} variant="outline" size="icon" aria-label={`Delete ${plan.name} plan`}>
                    <Trash size={18} aria-hidden="true" />
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
