import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProblemCard = ({ id, title, company, difficulty, rating }) => {
  const navigate = useNavigate();
  const diffColor = difficulty === 'Easy' ? '#10b981' : difficulty === 'Medium' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '10px' }}>
      <div>
        <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
          <span style={{ color: diffColor, fontWeight: 'bold' }}>{difficulty}</span>
          <span style={{ color: '#94a3b8' }}>Target: {company}</span>
          <span style={{ color: '#94a3b8' }}>Rating: {rating}</span>
        </div>
      </div>
      <button onClick={() => navigate(`/workspace/${id}`)} style={{ padding: '10px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        Solve Problem
      </button>
    </div>
  );
};
export default ProblemCard;