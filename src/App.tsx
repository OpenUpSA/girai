import { useState } from 'react';
import './App.scss';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='chat' onClick={() => setCount((count) => count + 1)}>
      H{count}
    </div>
  )
};

export default App;
