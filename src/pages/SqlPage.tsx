import React from 'react';
import { sqlChallenges } from '../challenges/sql';
import SqlRunner from '../components/SqlRunner';
import '../styles/Challenge.css';
import '../styles/SqlRunner.css';

const SqlPage: React.FC = () => {
  return (
    <div className="challenge-page">
      <h1>SQL Challenges</h1>
      {sqlChallenges.map((challenge) => (
        <div key={challenge.id} className="challenge-container">
          <h2>Challenge #{challenge.id}</h2>
          <SqlRunner challenge={challenge} />
        </div>
      ))}
    </div>
  );
};

export default SqlPage;
