import React, { useState, useMemo } from 'react';
import { pythonChallenges } from '../challenges/python';
import PythonRunner from '../components/PythonRunner';
import '../styles/Challenge.css';
import '../styles/PythonRunner.css';

const PythonPage: React.FC = () => {
  const [category, setCategory] = useState<string>('all');
  const categories = useMemo(()=>{
    const set = new Set<string>();
    pythonChallenges.forEach(c=>{ if(c.category) set.add(c.category); });
    return Array.from(set).sort();
  },[]);
  const visible = category==='all' ? pythonChallenges : pythonChallenges.filter(c=>c.category===category);
  return (
    <div className="challenge-page">
      <h1>Python Challenges</h1>
      <div style={{margin:'0.5rem 0', display:'flex', gap:'0.5rem', alignItems:'center'}}>
        <label style={{fontSize:'0.85rem'}}>Category:</label>
        <select value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="all">All</option>
          {categories.map(cat=> <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <span style={{fontSize:'0.7rem', opacity:0.7}}>{visible.length} shown</span>
      </div>
      {visible.map((challenge) => (
        <div key={challenge.id} className="challenge-container">
          <h2>Challenge #{challenge.id}</h2>
          <PythonRunner challenge={challenge} />
        </div>
      ))}
    </div>
  );
};

export default PythonPage;
