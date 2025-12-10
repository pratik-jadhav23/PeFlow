import { CalendarDays, ScanText, Upload } from 'lucide-react'
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Stats from '../components/Stats'
import MonthlyCharts from '../charts/MonthlyChart'
import ContactChart from '../charts/ContactChart'
import Top5CDChart from '../charts/Top5CDChart'

const Insights = ({ data }) => {

  let navigate = useNavigate();

  useEffect(() => {
    if (!data) {
      navigate('/');
    }
  }, [data, navigate])

  // let top5CD = (data, key) => {
  //     return (
  //         data
  //             ?.filter((entry) => entry[key] > 0)
  //             .sort((a, b) => b[key] - a[key])
  //             .slice(0, 5)
  //             .map((entry, i) => ({
  //                 id: i,
  //                 value: entry[key],
  //                 label: entry.name,
  //             })) || []
  //     );
  // }

  return (
    <>
      {data && <>
        <div className="w-full mt-4 sm:mt-8 bg-[#6d40c0] text-white rounded-lg p-2 md:p-4 flex items-center justify-between">
          {/* Left Side - Transaction Period */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2.5 bg-white/15 rounded-xl">
              <CalendarDays className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm text-gray-200 leading-tight">Transaction Period</h3>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-white whitespace-nowrap">
                {data?.stats?.transactionPeriod}
              </p>
            </div>
          </div>

          {/* Right Side - Analyze More (hidden on mobile) */}
          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 bg-white text-[#6d40c0] px-4 py-2 rounded-3xl hover:bg-gray-100 transition font-semibold"
          >
            <span>Analyze More</span>
            <Upload className="w-5 h-5" />
          </Link>
        </div>
        <Stats data={data?.stats} />


        {/* monthly cash in and out */}
        {/* <div className='my-5 sm:my-6 md:my-8 lg:my-10 xl:my-14'>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Monthly Cash In & Out
          </h1>
          <div className='my-5 sm:mt-8 h-68 sm:h-80 lg:h-96'>
            <MonthlyCharts data={data?.groupings?.month} />
          </div>
        </div> */}



        {/* //top contacts by spend and receive */}
        {/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 sm:my-6 md:my-8 lg:my-10 xl:my-14'>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Top Contacts by Spend
            </h1>
            <div className='mt-3 sm:mt-8 h-68 sm:h-80 lg:h-96'>
              <Top5CDChart data={top5CD(data?.groupings?.contact, 'debited')}/>
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Top Contacts by Receive
            </h1>
            <div className='mt-3 sm:mt-8 h-68 sm:h-80 lg:h-96'>
              <Top5CDChart data={top5CD(data?.groupings?.contact, 'credited')}/>
            </div>
          </div>
        </div> */}

        {/* contact-wise cash in and out */}
        <div className='my-5 sm:my-6 md:my-8 lg:my-10 xl:my-14'>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Contact-wise Cash In & Out
          </h1>
          <div className='mt-3 sm:mt-8 h-68 sm:h-80 lg:h-96'>
            <ContactChart data={data?.groupings?.contact} />
          </div>
        </div>
      </>}
    </>
  )
}

export default Insights