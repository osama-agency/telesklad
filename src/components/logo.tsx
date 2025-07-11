export function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Новый логотип SVG с градиентом */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 221 221" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B6EF3" />
            <stop offset="100%" stopColor="#3EB5EA" />
          </linearGradient>
        </defs>
        <path d="M77.259 0.609375H0.767578V77.1008H77.259V0.609375Z" fill="url(#logoGradient)"/>
        <path d="M220.366 5.63159V77.1053H148.719V220.646H147.644C108.775 220.646 77.2654 189.136 77.2654 150.267V76.0103C77.2654 37.1413 108.775 5.63159 147.644 5.63159H220.366Z" fill="url(#logoGradient)"/>
      </svg>
      
      {/* Текст telesklad - адаптивный */}
      {/* Полное название на больших экранах */}
      <span className="hidden lg:block text-2xl font-bold font-golos text-dark dark:text-white">
        telesklad
      </span>
      
      {/* Сокращенное название на планшетах */}
      <span className="hidden sm:block lg:hidden text-xl font-bold font-golos text-dark dark:text-white">
        telesklad
      </span>
      
      {/* На мобильных показываем только иконку */}
    </div>
  );
}
