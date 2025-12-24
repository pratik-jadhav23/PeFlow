import React from "react";

const HowItWorks = () => {
    return (
        <section
            className="relative bg-white py-8 mb-16"
        >
            <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl text-gray-900 font-extrabold mx-auto md:text-5xl lg:text-4xl">
                        How does it work?
                    </h2>
                    <p className="max-w-2xl mx-auto mt-4 text-base text-gray-600 leading-relaxed md:text-2xl">
                        Analyze your PhonePe/Bank statements in just 3 simple steps
                    </p>
                </div>

                {/* Steps */}
                <div className="relative mt-12 lg:mt-20">
                    {/* Decorative SVG line */}
                    <div className="absolute inset-x-0 hidden xl:px-44 top-2 md:block md:px-20 lg:px-28">
                        <img
                            alt=""
                            loading="lazy"
                            width="1000"
                            height="500"
                            decoding="async"
                            className="w-full"
                            src="https://cdn.rareblocks.xyz/collection/celebration/images/steps/2/curved-dotted-line.svg"
                        />
                    </div>

                    <div className="relative grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-12">
                        {/* Step 1 */}
                        <div>
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-100 border-2 border-purple-200 rounded-full shadow">
                                <span className="text-xl font-semibold text-purple-700">1</span>
                            </div>
                            <h3 className="mt-6 text-xl text-gray-900 font-semibold leading-tight md:mt-10">
                                Upload Your Statement
                            </h3>
                            <p className="mt-4 text-base text-gray-600 md:text-lg">
                                Download your PDF statement from the PhonePe/Bank app or Gmail and upload it here.
                            </p>
                            <p className="mt-2 text-base text-gray-600 md:text-lg">*If Bank PDF, provide appropiate password.</p>
                           
                        </div>

                        {/* Step 2 */}
                        <div>
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 border-2 border-green-200 rounded-full shadow">
                                <span className="text-xl font-semibold text-green-700">2</span>
                            </div>
                            <h3 className="mt-6 text-xl text-gray-900 font-semibold leading-tight md:mt-10">
                                Automatic Parsing
                            </h3>
                            <p className="mt-4 text-base     text-gray-600 md:text-lg">
                                Our tool extracts transactions and organizes them into categories instantly.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div>
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 border-2 border-blue-200 rounded-full shadow">
                                <span className="text-xl font-semibold text-blue-700">3</span>
                            </div>
                            <h3 className="mt-6 text-xl text-gray-900 font-semibold leading-tight md:mt-10">
                                View Insights
                            </h3>
                            <p className="mt-4 text-base text-gray-600 md:text-lg">
                                Get clear charts and stats about your income, spending, and savings.
                            </p>
                        </div>
                    </div>
                  
                </div>
            </div>

            {/* Background blur */}
            
        </section>
    );
};

export default HowItWorks;
