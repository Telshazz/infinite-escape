'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/lib/store';
import StartScreen from '@/components/StartScreen';
import SetupWizard from '@/components/SetupWizard';
import GenerationSequence from '@/components/GenerationSequence';
import RoomExperience from '@/components/RoomExperience';
import BusinessModelView from '@/components/BusinessModelView';

export default function Page() {
  const view = useGame((s) => s.view);

  return (
    <main className="min-h-screen bg-abyss">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {view === 'start' && <StartScreen />}
          {view === 'wizard' && <SetupWizard />}
          {view === 'generating' && <GenerationSequence />}
          {view === 'room' && <RoomExperience />}
          {view === 'business' && <BusinessModelView />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
