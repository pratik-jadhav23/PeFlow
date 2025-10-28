import { CircleQuestionMark } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Nav = () => {
    return (
        <nav className="fixed top-0 left-0 w-full flex justify-between items-center bg-white px-4 sm:px-10 md:px-16 lg:px-30 h-16 shadow-md z-50">
            <div className="text-[#5A2DAF] font-leckerli bg-clip-text text-3xl sm:text-4xl font-black">
                <Link to="/">PeFlow</Link>
            </div>

            <Link
                to="/HowToDownloadPDF"
                title="How to download PDF report"
                className="rounded-full border border-[#5A2DAF]/40 w-9 h-9 flex justify-center items-center text-[#5A2DAF] hover:bg-[#5A2DAF]/10 hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
                <CircleQuestionMark />
            </Link>
        </nav>
    );
};

export default Nav;