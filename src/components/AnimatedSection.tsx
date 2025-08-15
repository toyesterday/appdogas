import { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: string;
}

const AnimatedSection = ({ children, className, delay }: AnimatedSectionProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const animationClass = inView
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-10';

  const delayClass = delay ? `delay-[${delay}]` : '';

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        animationClass,
        delayClass,
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;