import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Sparkles, User } from 'lucide-react';

export default function MessageItem({ message, isDarkMode }) {
  const isBot = message.sender === 'bot';
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState(null);

  // Safe and clean Regex-based Markdown Parser to avoid external dependencies
  const renderFormattedText = (text) => {
    if (!text) return '';

    // 1. Escape HTML to prevent injection
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Format code blocks: ```code```
    escaped = escaped.replace(/```([\s\S]*?)```/g, (_, code) => {
      const cleanCode = code.trim();
      return `<pre class="bg-stone-950 text-orange-300 p-4 rounded-xl my-3 overflow-x-auto text-xs font-mono border border-saffron-500/20 relative leading-relaxed"><code>${cleanCode}</code></pre>`;
    });

    // 3. Format inline code: `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="bg-orange-100 dark:bg-stone-900 text-saffron-600 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">$1</code>');

    // 4. Format bold text: **text**
    escaped = escaped.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-bold text-saffron-700 dark:text-saffron-400">$1</strong>');

    // 4.5 Format Markdown links: [text](url)
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-saffron-600 hover:text-saffron-700 dark:text-saffron-400 dark:hover:text-saffron-300 underline font-bold transition-all hover:scale-105 inline-block">$1</a>');

    // 5. Format bullets: line starting with "* " or "- "
    escaped = escaped.replace(/^\s*[*+-]\s+(.+)$/gm, '<li class="list-disc ml-4 my-1 pl-1 leading-relaxed">$1</li>');

    // 6. Convert newlines to breaks
    escaped = escaped.replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: escaped }} className="space-y-1 text-sm md:text-base leading-relaxed" />;
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-To-Speech (Speech Synthesis)
  const handleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Clean text for speech (remove markdown symbols)
    const cleanText = message.text
      .replace(/\*\*?/g, '')
      .replace(/`+/g, '')
      .replace(/```[\s\S]*?```/g, '[कोड ब्लॉक]');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to set a Hindi/Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setSpeechUtterance(utterance);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div className={`flex items-start max-w-[85%] md:max-w-[75%] gap-3 ${!isBot && 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`p-2 rounded-2xl shadow-sm shrink-0 float-animation ${
          isBot 
            ? 'bg-gradient-to-br from-saffron-400 to-amber-600 text-white' 
            : 'bg-gradient-to-br from-stone-500 to-stone-700 text-white'
        }`}>
          {isBot ? (
            <Sparkles className="w-4 h-4 md:w-5 h-5" id="bot-avatar-icon" />
          ) : (
            <User className="w-4 h-4 md:w-5 h-5" id="user-avatar-icon" />
          )}
        </div>

        {/* Message Bubble */}
        <div className="space-y-1.5">
          <div className={`px-5 py-3.5 rounded-3xl shadow-sm border text-sm md:text-base leading-relaxed ${
            isBot 
              ? isDarkMode 
                ? 'bg-stone-900/90 border-stone-800 text-stone-200 rounded-tl-none' 
                : 'bg-white border-orange-100 text-stone-800 rounded-tl-none'
              : 'bg-gradient-to-br from-saffron-500 to-amber-600 text-white border-saffron-600 rounded-tr-none'
          }`}>
            {isBot ? (
              renderFormattedText(message.text)
            ) : (
              <p className="whitespace-pre-line text-sm md:text-base leading-relaxed">{message.text}</p>
            )}
          </div>

          {/* Action buttons (only for bot responses) */}
          {isBot && (
            <div className="flex items-center gap-2 pl-2 text-stone-400 dark:text-stone-500">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-orange-50 dark:hover:bg-stone-900 hover:text-saffron-500 dark:hover:text-saffron-400 rounded-lg transition-all"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              
              <button
                onClick={handleSpeech}
                className={`p-1.5 hover:bg-orange-50 dark:hover:bg-stone-900 rounded-lg transition-all ${
                  isPlaying ? 'text-saffron-500 dark:text-saffron-400' : 'hover:text-saffron-500'
                }`}
                title={isPlaying ? "Stop speech" : "Read aloud"}
              >
                {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <span className="text-[10px] text-stone-400 dark:text-stone-500 ml-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {!isBot && (
            <div className="text-right pr-2">
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
