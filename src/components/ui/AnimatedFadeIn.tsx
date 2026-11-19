import { memo, type ReactNode } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface AnimatedFadeInProps {
  children: ReactNode;
  index?: number;
  direction?: 'up' | 'down';
}

function AnimatedFadeInComponent({
  children,
  index = 0,
  direction = 'down',
}: AnimatedFadeInProps) {
  const delay = index * 80;
  const entering =
    direction === 'up'
      ? FadeInUp.duration(450).delay(delay).springify().damping(18)
      : FadeInDown.duration(450).delay(delay).springify().damping(18);

  return <Animated.View entering={entering}>{children}</Animated.View>;
}

export const AnimatedFadeIn = memo(AnimatedFadeInComponent);
