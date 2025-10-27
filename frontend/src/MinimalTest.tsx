import React from 'react';

const MinimalTest: React.FC = () => {
  return (
    <div>
      <h1>Minimal Test - React is Working!</h1>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default MinimalTest;
