import { WorkoutTemplate } from '@/lib/types';
import { WORKOUT_TEMPLATES } from '@/lib/workout-templates';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Barbell, Lightning, Trophy, Heart } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface TemplateLibraryProps {
  onImport: (template: WorkoutTemplate) => void;
}

const PROGRAM_TYPE_ICONS = {
  'strength': Lightning,
  'hypertrophy': Barbell,
  'powerlifting': Trophy,
  'general-fitness': Heart
};

const PROGRAM_TYPE_LABELS = {
  'strength': 'Strength',
  'hypertrophy': 'Hypertrophy',
  'powerlifting': 'Powerlifting',
  'general-fitness': 'General Fitness'
};

const DIFFICULTY_COLORS = {
  'beginner': 'bg-green-500/10 text-green-500 border-green-500/20',
  'intermediate': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'advanced': 'bg-red-500/10 text-red-500 border-red-500/20'
};

export function TemplateLibrary({ onImport }: TemplateLibraryProps) {
  const handleImport = (template: WorkoutTemplate) => {
    onImport(template);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Workout Templates</h3>
        <p className="text-muted-foreground">
          Choose from popular pre-built programs. Import and customize them to fit your needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {WORKOUT_TEMPLATES.map((template, index) => {
          const ProgramIcon = PROGRAM_TYPE_ICONS[template.programType];
          const totalSets = template.exercises.reduce((acc, ex) => acc + ex.sets, 0);
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ProgramIcon size={24} weight="bold" className="text-primary" />
                    <h4 className="text-lg font-semibold">{template.name}</h4>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge 
                    variant="outline" 
                    className={DIFFICULTY_COLORS[template.difficulty]}
                  >
                    {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="secondary">
                    {PROGRAM_TYPE_LABELS[template.programType]}
                  </Badge>
                  <Badge variant="secondary">
                    {template.exercises.length} exercises
                  </Badge>
                  <Badge variant="secondary">
                    {totalSets} sets
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded-md p-3 mb-4 flex-1">
                  <p className="text-sm font-medium mb-1">Program Goals:</p>
                  <p className="text-sm text-muted-foreground">{template.goals}</p>
                </div>

                <Button 
                  onClick={() => handleImport(template)} 
                  className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Download size={18} weight="bold" />
                  Import Template
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
