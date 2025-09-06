import React from 'react';
import { pythonChallenges } from '../challenges/python';
import PythonRunner from '../components/PythonRunner';
import '../styles/Challenge.css';
import '../styles/PythonRunner.css';

const PythonPage: React.FC = () => {
  return (
    <div className="challenge-page">
      <h1>Python Challenges</h1>
      {pythonChallenges.map((challenge) => (
        <div key={challenge.id} className="challenge-container">
          <h2>Challenge #{challenge.id}</h2>
                    <PythonRunner challenge={challenge} />
        </div>
      ))}
    </div>
  );
};

export default PythonPage;
