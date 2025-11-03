import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useKeyboardShortcuts = () => {
  const {
    setSelectedTool,
    setShowHistory,
    showHistory,
    setShowPromptPanel,
    showPromptPanel,
    currentPrompt,
    isGenerating
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        // Only handle Cmd/Ctrl + Enter for generation
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault();
          if (!isGenerating && currentPrompt.trim()) {
            // Trigger generation/edit - handled in PromptComposer
            console.log('Generate via keyboard shortcut');
          }
        }
        return;
      }

      // Cmd/Ctrl + shortcuts (work everywhere except inputs)
      if (event.metaKey || event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault();
            setShowHistory(!showHistory);
            break;
          case 'p':
            event.preventDefault();
            setShowPromptPanel(!showPromptPanel);
            break;
          case '1':
            event.preventDefault();
            setSelectedTool('generate');
            break;
          case '2':
            event.preventDefault();
            setSelectedTool('edit');
            break;
          case '3':
            event.preventDefault();
            setSelectedTool('mask');
            break;
        }
        return;
      }

      // Single key shortcuts - only when not in contenteditable
      if (event.target instanceof HTMLElement && event.target.isContentEditable) {
        return;
      }

      // Alt/Option + key for mode switching (less likely to conflict)
      if (event.altKey && !event.metaKey && !event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'g':
            event.preventDefault();
            setSelectedTool('generate');
            break;
          case 'e':
            event.preventDefault();
            setSelectedTool('edit');
            break;
          case 'm':
            event.preventDefault();
            setSelectedTool('mask');
            break;
          case 'h':
            event.preventDefault();
            setShowHistory(!showHistory);
            break;
          case 'p':
            event.preventDefault();
            setShowPromptPanel(!showPromptPanel);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedTool, setShowHistory, showHistory, setShowPromptPanel, showPromptPanel, currentPrompt, isGenerating]);
};