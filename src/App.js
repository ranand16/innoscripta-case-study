import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import NewsAggregator from './Components/NewsAggregator';
import PersonalizedNewsFeed from './Components/PersonalizedNewsFeed';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NewsAggregator />} />
          <Route path="/feed" element={<PersonalizedNewsFeed />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
