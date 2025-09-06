import React, { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { conceptualChallenges } from '../challenges/conceptual';
import '../styles/Challenge.css';
import '../styles/Conceptual.css';
import { evaluateConceptAnswer, isConceptEvaluationResult } from '../challenges/conceptualEvaluator';
import { recordMissedTerms, recordCoveredTerms, getDueTerms } from '../challenges/spacedRepetition';

const ConceptualPage: React.FC = () => {
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [verifications, setVerifications] = useState<{[key: number]: {score: number, feedback: string, covered: string[], missing: string[], confidence?: string, misconceptions?: number}}>({});
  const [dueTerms, setDueTerms] = useState<string[]>(() => getDueTerms().map(i => i.term));
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [showRaw, setShowRaw] = useState<boolean>(false);
  // tone replacement mapping (word/phrase -> replacement)
  const DEFAULT_TONE_MAP: Record<string,string> = {
    'Furthermore': 'Also',
    'Therefore': 'So',
    'In addition': 'Plus',
    'utilize': 'use',
    'prior to': 'before',
    'subsequent to': 'after',
    'objective': 'goal'
  };
  const [toneMap, setToneMap] = useState<Record<string,string>>(()=>{
    try { const saved = localStorage.getItem('concept-tone-map'); return saved ? JSON.parse(saved) : DEFAULT_TONE_MAP; } catch { return DEFAULT_TONE_MAP; }
  });
  const [showToneEditor, setShowToneEditor] = useState(false);
  const solutionContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    if (!solutionContainerRef.current) return;
    solutionContainerRef.current.querySelectorAll('code').forEach(block=>{
      try { hljs.highlightElement(block as HTMLElement); } catch {}
    });
  });

  const persistToneMap = (next: Record<string,string>) => {
    setToneMap(next);
    try { localStorage.setItem('concept-tone-map', JSON.stringify(next)); } catch {}
  };

  const addToneEntry = () => {
    const key = prompt('Phrase to replace (case-insensitive match):');
    if (!key) return;
    const val = prompt(`Replacement for "${key}":`) || '';
    persistToneMap({ ...toneMap, [key]: val });
  };
  const removeToneEntry = (k: string) => {
    const clone = { ...toneMap }; delete clone[k]; persistToneMap(clone);
  };

  const handleAnswerChange = (challengeId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [challengeId]: answer }));
  };

  const verifyAnswer = async (challengeId: number) => {
    const challenge = conceptualChallenges.find(c => c.id === challengeId);
    const userAnswer = answers[challengeId] || '';

    if (!challenge || !challenge.keyTerms) {
      setVerifications(prev => ({
        ...prev,
        [challengeId]: { score: 0, feedback: 'Verification not available for this question.', covered: [], missing: [] }
      }));
      return;
    }
    setLoadingId(challengeId);
    const result = await evaluateConceptAnswer(userAnswer, challenge.keyTerms);
    if (isConceptEvaluationResult(result)) {
      // spaced repetition integration
      if (result.missing.length) recordMissedTerms(result.missing);
      if (result.covered.length) recordCoveredTerms(result.covered);
      setDueTerms(getDueTerms().map(i => i.term));
      setVerifications(prev => ({
        ...prev,
        [challengeId]: {
          score: result.score,
          feedback: result.feedback,
          covered: result.covered,
          missing: result.missing,
          confidence: result.confidenceBand,
          misconceptions: result.misconceptions?.length
        }
      }));
    }
    setLoadingId(null);
  };
  return (
    <div className="challenge-page">
      <h1>Conceptual Questions</h1>
      <div style={{display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'0.75rem'}}>
        <label style={{cursor:'pointer', userSelect:'none'}}>
          <input type="checkbox" checked={showRaw} onChange={(e)=>setShowRaw(e.target.checked)} style={{marginRight:'0.35rem'}} />
          Show raw solution text
        </label>
        <button type="button" onClick={()=>setShowToneEditor(s=>!s)} className="verify-btn" style={{padding:'0.35rem 0.6rem'}}>
          {showToneEditor ? 'Hide Tone Map' : 'Edit Tone Map'}
        </button>
      </div>
      {showToneEditor && (
        <div className="tone-map-editor" style={{border:'1px solid #ccc', padding:'0.6rem', borderRadius:4, marginBottom:'1rem', background:'#fafafa'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <strong>Tone Replacement Map</strong>
            <button onClick={addToneEntry} className="verify-btn" style={{padding:'0.25rem 0.5rem'}}>Add</button>
          </div>
          <ul style={{listStyle:'none', padding:0, margin:'0.5rem 0'}}>
            {Object.entries(toneMap).map(([k,v])=> (
              <li key={k} style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:4}}>
                <code style={{background:'#eee', padding:'2px 4px', borderRadius:3}}>{k}</code>
                <span style={{flex:1}}>→ {v || '<removed>'}</span>
                <button onClick={()=>removeToneEntry(k)} style={{background:'transparent', color:'#c00', border:'none', cursor:'pointer'}}>✕</button>
              </li>
            ))}
          </ul>
          <small style={{opacity:0.7}}>Entries are applied case-insensitively to solution text before display.</small>
        </div>
      )}
      {conceptualChallenges.map((challenge) => (
        <div key={challenge.id} className="challenge-container" ref={solutionContainerRef}>
          <h2>Question #{challenge.id}</h2>
          <p>{challenge.question}</p>
          <textarea
            className="conceptual-answer"
            placeholder="Type your answer here..."
            value={answers[challenge.id] || ''}
            onChange={(e) => handleAnswerChange(challenge.id, e.target.value)}
          />
          <button
            onClick={() => verifyAnswer(challenge.id)}
            className="verify-btn"
            disabled={!answers[challenge.id]?.trim() || loadingId === challenge.id}
          >
            {loadingId === challenge.id ? 'Evaluating…' : 'Evaluate Answer'}
          </button>
          {dueTerms.length > 0 && (
            <div className="due-terms">Review due concepts: {dueTerms.join(', ')}</div>
          )}
          {verifications[challenge.id] && (
            <div className={`verification-message ${verifications[challenge.id].score >= 70 ? 'correct' : 'incorrect'}`}>
              <strong>Score:</strong> {verifications[challenge.id].score}/100<br />
              {verifications[challenge.id].feedback}
              {verifications[challenge.id].covered.length > 0 && (
                <div><strong>Covered:</strong> {verifications[challenge.id].covered.join(', ')}</div>
              )}
              {verifications[challenge.id].missing.length > 0 && (
                <div><strong>Missing:</strong> {verifications[challenge.id].missing.join(', ')}</div>
              )}
              <div className="badges">
                {verifications[challenge.id].confidence && (
                  <span className={`badge confidence-${verifications[challenge.id].confidence}`}>Confidence: {verifications[challenge.id].confidence}</span>
                )}
                {verifications[challenge.id] && typeof verifications[challenge.id].misconceptions === 'number' && verifications[challenge.id].misconceptions! > 0 && (
                  <span className="badge badge-warning">Misconceptions: {verifications[challenge.id].misconceptions}</span>
                )}
              </div>
            </div>
          )}
          <details>
            <summary>View Answer</summary>
            {showRaw ? (
              <pre className="solution raw-solution" style={{whiteSpace:'pre-wrap'}}>{challenge.solution}</pre>
            ) : (
              <div
                className="solution"
                // pass toneMap via global mutable for now (simplest integration)
                dangerouslySetInnerHTML={{ __html: formatSolution(challenge.solution, toneMap) }}
              />
            )}
          </details>
        </div>
      ))}
    </div>
  );
};

// Convert lightweight markdown-ish text into simple HTML while:
// - removing **bold** markers
// - preserving ordered list numbering / bullet points
// - wrapping consecutive list lines in <ol> / <ul>
// - applying a light humanization pass (tone softening, removing over-formal phrases)
// Replace implementation to preserve and wrap inline code
function formatSolution(raw?: string, toneMap?: Record<string,string>): string {
  if (!raw) return '';
  const text = raw.trim();
  const lines = text.split(/\r?\n/);
  const htmlParts: string[] = [];
  let listBuffer: { type: 'ol' | 'ul'; items: string[] } | null = null;
  const flush = () => { if (listBuffer) { htmlParts.push(`<${listBuffer.type}>` + listBuffer.items.map(li => `<li>${li}</li>`).join('') + `</${listBuffer.type}>`); listBuffer = null; } };
  for (let line of lines) {
    const original = line;
    // capture code spans
    line = line.replace(/`([^`]+)`/g, (_,m)=>`<code>${escapeHtml(m)}</code>`);
    line = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (olMatch) {
      const content = humanizeTone(escapeHtmlUnlessCode(olMatch[2]), toneMap);
      if (!listBuffer || listBuffer.type !== 'ol') flush(), listBuffer = { type: 'ol', items: [] };
      listBuffer.items.push(content);
      continue;
    } else if (ulMatch) {
      const content = humanizeTone(escapeHtmlUnlessCode(ulMatch[1]), toneMap);
      if (!listBuffer || listBuffer.type !== 'ul') flush(), listBuffer = { type: 'ul', items: [] };
      listBuffer.items.push(content);
      continue;
    }
    flush();
    if (original.trim()) htmlParts.push(`<p>${humanizeTone(escapeHtmlUnlessCode(line), toneMap)}</p>`);
  }
  flush();
  return htmlParts.join('\n');
}
function escapeHtmlUnlessCode(s: string): string { return s.replace(/<(?!code|\/code)/g,'&lt;').replace(/>(?!code)/g,'&gt;'); }

// Simple tone adjustments (minimal & deterministic). Avoids sounding robotic while staying neutral.
function humanizeTone(text: string, toneMap?: Record<string,string>): string {
  if (!toneMap) return text;
  return Object.entries(toneMap).reduce((t, [k,v])=>{
    const re = new RegExp(k, 'gi');
    return t.replace(re, () => v);
  }, text);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"] /g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c));
}

export default ConceptualPage;
