interface LoadingCompProps {
    message?: string;
    subtext?: string;
}

const LoadingComp = ({ message = "Loading", subtext }: LoadingCompProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-800">
            <div className="text-center space-y-6 animate-in fade-in duration-500">
                {/* Logo with circular pulse */}
                <div className="relative flex justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border border-blue-300/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" style={{ animationDuration: '1.5s' }} />
                    </div>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xl ring-4 ring-white dark:ring-slate-800 z-10">
                        <img src="/ERESULTS_LOGO.png" alt="e-Results GH" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {message}
                        <span className="inline-flex ml-1">
                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                        </span>
                    </h3>
                    {subtext && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LoadingComp;