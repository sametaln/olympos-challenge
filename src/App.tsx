import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import LineChart from './components/LineChart';
import process from 'process';

export interface CompanyData {
  key: string;
  values: {
    key: string;
    month: string;
    hireCount: number;
    totalFte: number;
  }[];
}


const API_KEY = import.meta.env.VITE_API_KEY

function App() {
  const [data, setData] = useState<CompanyData[]>()

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get(
        `https://plankton-app-fn6k2.ondigitalocean.app/demo`,

        {
          headers: {
            'Content-Type': 'application/json',
            'X-ApiKey': API_KEY
          }
        }
      )
      setData(result.data.companies)
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      {
        data && <LineChart data={data} />
      }
    </div>
  )
}

export default App
