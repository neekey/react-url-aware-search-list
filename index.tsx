import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from 'react-dom';
import URLAwareList from './URLAwareList';
import './style.css';

function App() {
  return (
    <Router>
      <URLAwareList />
    </Router>
  );
}

render(<App />, document.getElementById('root'));
