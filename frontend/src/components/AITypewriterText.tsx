'use client';
import React, { useState, useEffect } from 'react';

// Global animation state manager
class AnimationManager {
  private static instance: AnimationManager;
  private animations = new Map<string, {
    content: string;
    currentIndex: number;
    isComplete: boolean;
    startTime: number;
  }>();
  private animationInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAnimationLoop();
  }

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  private startAnimationLoop() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.animationInterval = setInterval(() => {
      const now = Date.now();
      this.animations.forEach((animation, messageId) => {
        if (animation.isComplete) return;

        const elapsed = now - animation.startTime;
        const newIndex = Math.min(
          Math.floor(elapsed / 30),
          animation.content.length
        );

        if (newIndex > animation.currentIndex) {
          animation.currentIndex = newIndex;
          animation.isComplete = newIndex >= animation.content.length;
        }
      });
    }, 30);
  }

  public initializeAnimation(messageId: string, content: string): void {
    // If animation already exists and is complete, don't reinitialize
    const existing = this.animations.get(messageId);
    if (existing?.isComplete) return;

    // If animation doesn't exist or isn't complete, initialize/reinitialize it
    this.animations.set(messageId, {
      content,
      currentIndex: 0,
      isComplete: false,
      startTime: Date.now()
    });
  }

  public getAnimationState(messageId: string): {
    text: string;
    isComplete: boolean;
  } {
    const animation = this.animations.get(messageId);
    if (!animation) {
      // If no animation exists yet, initialize it
      this.initializeAnimation(messageId, '');
      return { text: '', isComplete: false };
    }
    return {
      text: animation.content.slice(0, animation.currentIndex),
      isComplete: animation.isComplete
    };
  }
}

// Export for use in websocket.ts
export const initializeMessageAnimation = (messageId: string, content: string) => {
  // Initialize animation as soon as message is received
  AnimationManager.getInstance().initializeAnimation(messageId, content);
};

interface TypewriterTextProps {
  message: {
    role: string;
    content: string;
  };
  index: number;
}

const AITypewriterText: React.FC<TypewriterTextProps> = ({ message, index }) => {
  const messageId = `message-${index}`;
  const [displayState, setDisplayState] = useState(() => {
    // Get current animation state, which will initialize if needed
    return AnimationManager.getInstance().getAnimationState(messageId);
  });

  useEffect(() => {
    // Ensure animation is initialized with current content
    AnimationManager.getInstance().initializeAnimation(messageId, message.content);
    
    const interval = setInterval(() => {
      const state = AnimationManager.getInstance().getAnimationState(messageId);
      setDisplayState(state);
      if (state.isComplete) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [messageId, message.content]);

  return (
    <div className={`
      ${message.role === 'user' ? 'bg-[#243242]' : ''} 
      text-[var(--text)] 
      font-geist
      text-[0.95rem]
      leading-relaxed
    `}>
      {displayState.text || message.content.charAt(0)}
      {!displayState.isComplete && (
        <span 
          className="inline-block w-0.5 h-4 md:h-5 ml-1 animate-cursor-blink bg-blue-300"
          style={{ verticalAlign: 'middle' }}
        />
      )}
      <style jsx>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.4; transform: scaleY(0.85); }
        }

        .animate-cursor-blink {
          animation: cursorBlink 0.8s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
};

export default AITypewriterText;