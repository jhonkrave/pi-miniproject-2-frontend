/**
 * Subtitle helper utilities for LumiFlix - mini project 2
 * 
 * Generates subtitle tracks dynamically from text (plot/overview)
 * without requiring external .vtt files.
 * 
 * @since 3.0.0
 */

/**
 * Generates a VTT (WebVTT) formatted string from text
 * 
 * @param {string} text - The text to convert to VTT format (e.g., movie plot)
 * @param {number} duration - Total video duration in seconds
 * @returns {string} VTT formatted content
 * 
 * @since 3.0.0
 */
export function generateVTTFromText(text: string, duration: number = 60): string {
  if (!text || text.trim().length === 0) {
    return 'WEBVTT\n\n';
  }

  // Primero, divide por frases largas (puntos, exclamaciones, interrogaciones)
  const longSentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Si hay frases muy largas, divídelas por comas o por longitud
  const segments: string[] = [];
  
  longSentences.forEach(sentence => {
    // Si la frase es muy larga (>150 caracteres), divídela por comas
    if (sentence.length > 150) {
      const parts = sentence.split(/,+\s+/).map(p => p.trim()).filter(p => p.length > 0);
      // Si aún son muy largas, divídelas por longitud
      parts.forEach(part => {
        if (part.length > 100) {
          // Divide en chunks de aproximadamente 80-100 caracteres
          const words = part.split(/\s+/);
          let currentChunk = '';
          words.forEach(word => {
            const testChunk = currentChunk ? `${currentChunk} ${word}` : word;
            if (testChunk.length <= 100) {
              currentChunk = testChunk;
            } else {
              if (currentChunk) segments.push(currentChunk);
              currentChunk = word;
            }
          });
          if (currentChunk) segments.push(currentChunk);
        } else {
          segments.push(part);
        }
      });
    } else {
      segments.push(sentence);
    }
  });

  // Si no hay segmentos, divide por palabras
  if (segments.length === 0) {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) {
      return 'WEBVTT\n\n';
    }
    // Crea segmentos de aproximadamente 8-12 palabras
    const wordsPerSegment = Math.max(8, Math.ceil(words.length / Math.ceil(duration / 6)));
    for (let i = 0; i < words.length; i += wordsPerSegment) {
      segments.push(words.slice(i, i + wordsPerSegment).join(' '));
    }
  }

  // Asegurar que tenemos suficientes segmentos para distribuir a lo largo del video
  // Objetivo: un segmento cada 4-6 segundos
  const targetSegmentCount = Math.ceil(duration / 5); // ~5 segundos por segmento
  
  if (segments.length < targetSegmentCount) {
    // Si tenemos pocos segmentos, dividirlos más
    const expandedSegments: string[] = [];
    segments.forEach(segment => {
      const words = segment.split(/\s+/);
      const wordsPerNewSegment = Math.ceil(words.length / Math.ceil(targetSegmentCount / segments.length));
      for (let i = 0; i < words.length; i += wordsPerNewSegment) {
        const newSegment = words.slice(i, i + wordsPerNewSegment).join(' ');
        if (newSegment.trim()) expandedSegments.push(newSegment.trim());
      }
    });
    return generateVTTFromSegments(expandedSegments, duration);
  }
  
  return generateVTTFromSegments(segments, duration);
}

/**
 * Generate VTT content from text segments
 * 
 * @param {string[]} segments - Array of text segments
 * @param {number} duration - Total video duration in seconds
 * @param {number} segmentDuration - Duration per segment in seconds (optional, auto-calculated if not provided)
 * @returns {string} VTT formatted content
 */
function generateVTTFromSegments(segments: string[], duration: number, segmentDuration?: number): string {
  if (segments.length === 0) {
    return 'WEBVTT\n\n';
  }

  // Calculate segment duration if not provided
  // Each segment should be visible for 4-6 seconds
  if (!segmentDuration) {
    const minSegmentDuration = 4;
    const maxSegmentDuration = 6;
    const calculatedDuration = duration / segments.length;
    segmentDuration = Math.max(
      minSegmentDuration,
      Math.min(maxSegmentDuration, calculatedDuration)
    );
  }

  // Add small gaps between segments (0.5 seconds)
  const gapBetweenSegments = 0.5;
  let adjustedDuration = segmentDuration - gapBetweenSegments;

  // Ensure we don't exceed video duration
  const totalNeeded = segments.length * (adjustedDuration + gapBetweenSegments);
  if (totalNeeded > duration) {
    // Recalculate to fit all segments
    const availableDuration = duration - (segments.length * gapBetweenSegments);
    adjustedDuration = Math.max(2, availableDuration / segments.length); // Minimum 2 seconds per segment
  }

  let vtt = 'WEBVTT\n\n';
  let currentTime = 0;
  
  segments.forEach((segment, index) => {
    // Skip if we've exceeded video duration
    if (currentTime >= duration) {
      return;
    }
    
    const startTime = formatVTTTime(currentTime);
    currentTime += adjustedDuration;
    
    // Make sure we don't exceed video duration
    const endTime = formatVTTTime(Math.min(currentTime, duration));
    
    // Limita la longitud de cada línea (máximo ~42 caracteres por línea para legibilidad)
    const lines = wrapText(segment, 42);
    
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += lines.map(line => `${line}\n`).join('');
    vtt += '\n';
    
    // Add gap before next segment
    currentTime += gapBetweenSegments;
    
    // If this is the last segment and we have time left, show it again at the end
    if (index === segments.length - 1 && currentTime < duration - 2) {
      const finalStart = formatVTTTime(Math.max(0, duration - adjustedDuration));
      const finalEnd = formatVTTTime(duration);
      vtt += `${finalStart} --> ${finalEnd}\n`;
      vtt += lines.map(line => `${line}\n`).join('');
      vtt += '\n';
    }
  });
  
  return vtt;
}

/**
 * Format seconds to VTT time format (HH:MM:SS.mmm)
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 60 - secs) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/**
 * Wrap text into multiple lines if it's too long
 * 
 * @param {string} text - Text to wrap
 * @param {number} maxLength - Maximum characters per line
 * @returns {string[]} Array of wrapped lines
 */
function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
}

/**
 * Creates a Blob URL from VTT content for use in video track element
 * 
 * @param {string} vttContent - VTT formatted content
 * @returns {string} Blob URL that can be used as track src
 */
export function createVTTBlobURL(vttContent: string): string {
  const blob = new Blob([vttContent], { type: 'text/vtt' });
  return URL.createObjectURL(blob);
}

/**
 * Translate text to another language (simplified - for demo purposes)
 * In production, you might want to use a translation API
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language ('es' or 'en')
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text: string, targetLang: 'es' | 'en'): Promise<string> {
  // For now, return the text as-is
  // In a real implementation, you could call a translation API here
  // Or use the backend to handle translation
  return text;
}

