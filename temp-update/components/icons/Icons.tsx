
import React from 'react';

export const LogoIcon: React.FC = () => (
<svg viewBox="0 0 200 125" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{stopColor: '#ffcc00', stopOpacity: 1}} />
      <stop offset="100%" style={{stopColor: '#ff9900', stopOpacity: 1}} />
    </linearGradient>
    <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{stopColor: '#00bcd4', stopOpacity: 1}} />
      <stop offset="100%" style={{stopColor: '#0097a7', stopOpacity: 1}} />
    </linearGradient>
  </defs>
  
  <path d="M100 8 C 60 8, 20 25, 20 90 L 100 75 L 180 90 C 180 25, 140 8, 100 8 Z" fill="#FFFFFF"/>
  <path d="M100 8 C 60 8, 20 25, 20 90 L 100 75" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
  <path d="M100 8 C 140 8, 180 25, 180 90 L 100 75" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
  
  <path d="M20 90 L 100 75 L 180 90 L 180 93 L 100 78 L 20 93 Z" fill="#d3a17c" />
  <path d="M20 90 L 20 93 L 180 93 L 180 90 L 100 75 Z" stroke="#ab7953" strokeWidth="1.5" fill="none"/>
  
  <circle cx="70" cy="35" r="12" fill="url(#skyGradient)" />
  
  <path d="M40 70 C 60 60, 80 80, 100 70 S 140 50, 160 65" fill="none" stroke="url(#seaGradient)" strokeWidth="10" strokeLinecap="round" />

  <path d="M135 60 Q 140 50, 145 60" fill="#388e3c" />
  <path d="M140 40 L 140 60" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
  <path d="M140 45 L 130 35" stroke="#4caf50" strokeWidth="3" strokeLinecap="round"/>
  <path d="M140 45 L 150 35" stroke="#4caf50" strokeWidth="3" strokeLinecap="round"/>
  <path d="M140 40 L 132 40" stroke="#4caf50" strokeWidth="3" strokeLinecap="round"/>
  <path d="M140 40 L 148 40" stroke="#4caf50" strokeWidth="3" strokeLinecap="round"/>
  
  <text 
    x="100" 
    y="115" 
    fontFamily="sans-serif" 
    fontSize="18" 
    fontWeight="bold" 
    fill="#FFFFFF"
    textAnchor="middle"
  >
    몰디브 바이블
  </text>
</svg>
);

export const SearchIcon: React.FC = () => (
  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

// FIX: Allow className prop to be passed to StarIcon.
export const StarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className || "h-4 w-4 text-yellow-400"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const LocationPinIcon: React.FC = () => (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

export const EditIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

export const GalleryIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  </svg>
);

export const BoatIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 text-gray-600"} viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2h-2v-2H4v2H2V5z"/>
    <path fillRule="evenodd" d="M2 9.5A2.5 2.5 0 014.5 7h11A2.5 2.5 0 0118 9.5v2.243a2.5 2.5 0 01-1.28 2.165l-5 2.5a2.5 2.5 0 01-2.44 0l-5-2.5A2.5 2.5 0 012 11.743V9.5zM4.5 9a.5.5 0 00-.5.5v2.243a.5.5 0 00.256.433l5 2.5a.5.5 0 00.488 0l5-2.5a.5.5 0 00.256-.433V9.5a.5.5 0 00-.5-.5h-11z" clipRule="evenodd"/>
  </svg>
);

export const SeaplaneIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 text-gray-600"} viewBox="0 0 20 20" fill="currentColor">
    <path d="M18.86 8.118l-5.011-2.863a.75.75 0 00-.7 0l-5.011 2.863a.75.75 0 00-.349.646v1.485c0 .324.21.609.511.713l4.84 1.613a.75.75 0 00.5 0l4.84-1.613a.75.75 0 00.511-.713V8.764a.75.75 0 00-.349-.646zM10 3.82l3.41 1.948-3.41 1.137-3.41-1.137L10 3.82z"/>
    <path fillRule="evenodd" d="M3.75 13a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd"/>
    <path d="M6 12.25a.75.75 0 00-1.5 0V16a.75.75 0 001.5 0v-3.75zm9.5 0a.75.75 0 00-1.5 0V16a.75.75 0 001.5 0v-3.75z"/>
  </svg>
);

export const DomesticFlightIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 text-gray-600"} viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.228 10.222a.75.75 0 00-1.06-1.06L14.25 11.17V6.522l-3.25-1.625a.75.75 0 00-.638-.035L6.03 6.75H4.75a.75.75 0 000 1.5h1.258l2.434 1.217.006.003c.09.044.183.08.277.111l-.567 1.417a.75.75 0 001.32.528l.583-1.458.583 1.458a.75.75 0 101.32-.528l-.567-1.417c.094-.031.187-.067.277-.111l.006-.003L15.25 8h1.25a.75.75 0 00.728-.528z"/>
    <path fillRule="evenodd" d="M3.5 14.5a.5.5 0 01.5-.5h12a.5.5 0 010 1H4a.5.5 0 01-.5-.5z" clipRule="evenodd"/>
  </svg>
);

export const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const LinkIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const DollarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-4 0a3 3 0 00-3 3v1a3 3 0 003 3h1a3 3 0 003-3v-1a3 3 0 00-3-3h-1zm-4 6a3 3 0 013-3v1m-3 0a3 3 0 003 3v-1m6-2a3 3 0 01-3 3v1m3 0a3 3 0 00-3-3v-1" />
  </svg>
);

export const ClockIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// FIX: Corrected the malformed RestaurantIcon component which was causing multiple parsing errors.
export const RestaurantIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18h14V3M5 3a2 2 0 012-2h10a2 2 0 012 2M12 3v18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 8l1.5 5 1.5-5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 8l1.5 5 1.5-5" />
  </svg>
);

export const BarIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PoolIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.8 9.95l.95 2.1M13.2 9.95l-.95 2.1m-2.25-2.1l.95 2.1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.18v4.22A2.6 2.6 0 005.6 20h12.8a2.6 2.6 0 002.6-2.6v-4.22" />
  </svg>
);

export const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const XCircleIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const KidsClubIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export const HeartIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
  </svg>
);

export const CartIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const XIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const KakaoIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 5.582 2 10.007c0 2.923 1.833 5.51 4.545 6.945-1.125.805-2.58 1.54-4.545 2.048 1.5-.125 2.875-.5 4.095-1.109C7.478 17.96 9.61 18.257 12 18.257c5.523 0 10-3.582 10-8.25S17.523 2 12 2z"/>
  </svg>
);

export const UserIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const BuildingIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5M9 21v-5.5M9 21H3m2 0h2.5M11 11h2m-2 4h2" />
  </svg>
);

export const FilterIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export const SortIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
  </svg>
);

export const RotateDeviceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.8002 4.00195H9.2002C7.2002 4.00195 5.6002 5.60195 5.6002 7.60195V16.502C5.6002 18.502 7.2002 20.102 9.2002 20.102H15.8002C17.8002 20.102 19.4002 18.502 19.4002 16.502V7.60195C19.4002 5.60195 17.8002 4.00195 15.8002 4.00195Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12.002H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 12.002C4.5 7.00195 8.5 3.00195 13.5 3.00195" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 12.002L2.5 10.002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.5 12.002L2.5 14.002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)
