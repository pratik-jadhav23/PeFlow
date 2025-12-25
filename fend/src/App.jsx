import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Nav from './components/Nav'
import Insights from './pages/Insights'
import LandingPage from './pages/LandingPage'
import HowToDownloadPDF from './components/HowToDownloadPDF'
import { Toaster } from 'react-hot-toast';

const App = () => {

  const [data, setData] = useState('')
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/`)
      .then(res => {
        console.log("API response = ", res.data);
      })
      .catch(err => {
        console.log(err);
      })
  }, [])

  return (
    <div className="bg-[#ffffff] w-full flex flex-col min-h-screen relative">
      <BrowserRouter>
        <Nav />
        <main className="flex-1 pt-16 overflow-y-auto mt-2 sm:mt-4 mx-3 sm:mx-8 md:mx-20 lg:mx-38 xl:mx-48">
          <Routes>
            <Route path='/' element={<LandingPage setData={setData} />} />
            <Route path='/insights' element={data ? <Insights data={data} /> : <Navigate to='/' />} />
            <Route path='*' element={<Navigate to='/' />} />
            <Route path='/HowToDownloadPDF' element={<HowToDownloadPDF />} />
          </Routes>
        </main>
        <footer className="w-full mt-10 sm:mt-16 py-6 text-center text-base text-[12px] sm:text-[14px] text-gray-600 bg-white/90 backdrop-blur-sm border-t border-gray-200">
          <p className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4 flex-wrap">
            <span>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold">PeFlow</span>
            </span>

            <a
              href="https://github.com/yourusername/peflow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5A2DAF] hover:underline"
            >
              About this project
            </a>

            <a
              href="https://yourportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5A2DAF] hover:underline"
            >
              Contact Us
            </a>

            <span>
              Developed with ❤️ by {" "}
              <span className="font-semibold text-[#5A2DAF]">Siva Garapati</span>
            </span>
          </p>
        </footer>

      </BrowserRouter>

    </div>
  )
}

export default App