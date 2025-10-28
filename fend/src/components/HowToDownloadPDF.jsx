import React from 'react'
import s1 from '../assets/step1.jpeg';
import s2 from '../assets/step2.jpeg';
import s3 from '../assets/step3.jpeg';
import s4 from '../assets/step4.jpeg';

const ACCENT = '#5A2DAF';

const HowToDownloadPDF = () => {
    const steps = [
        {
            title: 'Open PhonePe',
            text: (<>
                Open the app and tap the <strong>History</strong> tab in the bottom bar to view your transactions.
            </>)
        },
        {
            title: 'My Statements',
            text: (
                <>
                    On the History screen, tap <strong>My Statements</strong> at the top to access statements.
                </>
            )
        },
        {
            title: 'Choose period',
            text: (
                <>
                    Select <em>Last 30/90/180/365 days</em>, <em>Financial year</em>, or <em>Select date range</em> as needed.
                </>
            )
        },
        {
            title: 'Download PDF',
            text: (
                <>
                    Tap <strong>Download</strong> to generate the PDF, then tap <strong>View Statement</strong> to open, save, or share.
                </>
            )
        },
    ];


    const images = [
        { src: s1, alt: 'PhonePe History Tab', caption: '' },
        { src: s2, alt: 'My Statements Option', caption: '' },
        { src: s3, alt: 'Select Statement Period', caption: '' },
        { src: s4, alt: 'Download PDF Statement', caption: '' },
    ]

    return (
        <article className="max-w-5xl mx-auto p-1 md:p-5 bg-white" style={{ color: '#0f172a' }}>
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-semibold mb-2 md:text-3xl md:font-bold" style={{ color: ACCENT }}>How to Download PhonePe Transaction Statements</h1>
                <p className="text-gray-600 text-sm">4 quick steps</p>
            </header>


            <div className="flex flex-col space-y-8">
                {steps.map((s, i) => {
                    const reverse = i % 2 === 1;
                    return (
                        <section key={i} className={`flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center gap-6 bg-white border rounded-xl p-4 md:p-6`} style={{ borderColor: '#ede9fe' }}>
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold mr-3" style={{ background: ACCENT }}>{i + 1}</span>
                                    <h2 className="text-xl font-medium md:text-2xl">{s.title}</h2>
                                </div>
                                <p className="text-gray-700 text-sm md:text-xl">{s.text}</p>
                            </div>


                            <div className="flex-1 flex justify-center">
                                {images[i] && images[i].src ? (
                                    <a href={images[i].src} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition" title={images[i].caption || s.title}>
                                        <img
                                            src={images[i].src}
                                            alt={images[i].alt || s.title}
                                            className="object-contain max-h-[520px] w-auto mx-auto"
                                        />
                                        {images[i].caption && <div className="mt-2 text-xs text-center text-gray-500">{images[i].caption}</div>}
                                    </a>
                                ) : (
                                    <div className="w-full h-64 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">Screenshot (step {i + 1})</div>
                                )}
                            </div>
                        </section>
                    );
                })}
            </div>

        </article>
    );
}

export default HowToDownloadPDF