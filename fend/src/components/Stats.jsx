import React from 'react'
import '../styles/stats.css'
import { ArrowDownUp, BanknoteArrowUp, IndianRupee, BanknoteArrowDown } from 'lucide-react'

const Stats = ({ data, pdfType }) => {

    return (
        <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 w-full my-4 sm:my-12">
                {/* Stat Card */}
                {/* Total Transactions */}
                <div className="h-[110px] sm:h-[120px] md:h-[130px] border border-slate-300/40 bg-slate-50/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-50/80 hover:rounded-none flex flex-col justify-center px-3 sm:px-4">
                    <div className="mb-1 sm:mb-2">
                        <ArrowDownUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                    </div>
                    <div>
                        <h4 className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Total Transactions
                        </h4>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 transition-colors duration-300 hover:text-sky-500">
                            {data.totalTransactions}
                        </p>
                    </div>
                </div>

                {/* Opening Balance */}
                {pdfType === "secure" && <div className="h-[110px] sm:h-[120px] md:h-[130px] border border-slate-300/40 bg-slate-50/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-50/80 hover:rounded-none flex flex-col justify-center px-3 sm:px-4">
                    <div className="mb-1 sm:mb-2">
                        <ArrowDownUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                    </div>
                    <div>
                        <h4 className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Opening Balance As on {data.openingBalanceDate}
                        </h4>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 transition-colors duration-300 hover:text-sky-500">
                            {data.openingBalance.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                            })}
                        </p>
                    </div>
                </div>
                }

                {/* Total Amount Received */}
                <div className="h-[110px] sm:h-[120px] md:h-[130px] border border-slate-300/40 bg-slate-50/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-50/80 hover:rounded-none flex flex-col justify-center px-3 sm:px-4">
                    <div className="mb-1 sm:mb-2">
                        <BanknoteArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div>
                        <h4 className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Total Amount Received
                        </h4>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 transition-colors duration-300 hover:text-sky-500">
                            {data.totalAmountRecieved.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                            })}
                        </p>
                    </div>
                </div>

                {/* Total Amount Spent */}
                <div className="h-[110px] sm:h-[120px] md:h-[130px] border border-slate-300/40 bg-slate-50/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-50/80 hover:rounded-none flex flex-col justify-center px-3 sm:px-4">
                    <div className="mb-1 sm:mb-2">
                        <BanknoteArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <div>
                        <h4 className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Total Amount Spent
                        </h4>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 transition-colors duration-300 hover:text-sky-500">
                            {data.totalAmountSpent.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                            })}
                        </p>
                    </div>
                </div>

                {/* Net Amount */}
                <div className="h-[110px] sm:h-[120px] md:h-[130px] border border-slate-300/40 bg-slate-50/50 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:bg-sky-50/80 hover:rounded-none flex flex-col justify-center px-3 sm:px-4">
                    <div className="mb-1 sm:mb-2">
                        <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Net Amount
                        </h4>
                        <p
                            className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold transition-colors duration-300 ${data.netAmount >= 0 ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            {`${data.netAmount > 0 ? "+" : ""}${data.netAmount.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                            })}`}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Stats