import { GraduationCap, Presentation, Sparkles } from 'lucide-react';

export function GraduationCapIcon({ size = 28 }: { size?: number }) {
  return <GraduationCap size={size} />;
}

export function ChalkboardIcon({ size = 28 }: { size?: number }) {
  return <Presentation size={size} />;
}

export function SparkleIcon({ size = 16 }: { size?: number }) {
  return <Sparkles size={size} />;
}
