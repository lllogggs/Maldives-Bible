
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

export const StarIcon: React.FC = () => (
  <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const LocationPinIcon: React.FC = () => (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

export const BoatIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2h-2v-2H4v2H2V5z"/>
    <path fillRule="evenodd" d="M2 9.5A2.5 2.5 0 014.5 7h11A2.5 2.5 0 0118 9.5v2.243a2.5 2.5 0 01-1.28 2.165l-5 2.5a2.5 2.5 0 01-2.44 0l-5-2.5A2.5 2.5 0 012 11.743V9.5zM4.5 9a.5.5 0 00-.5.5v2.243a.5.5 0 00.256.433l5 2.5a.5.5 0 00.488 0l5-2.5a.5.5 0 00.256-.433V9.5a.5.5 0 00-.5-.5h-11z" clipRule="evenodd"/>
  </svg>
);

export const SeaplaneIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
    <path d="M18.86 8.118l-5.011-2.863a.75.75 0 00-.7 0l-5.011 2.863a.75.75 0 00-.349.646v1.485c0 .324.21.609.511.713l4.84 1.613a.75.75 0 00.5 0l4.84-1.613a.75.75 0 00.511-.713V8.764a.75.75 0 00-.349-.646zM10 3.82l3.41 1.948-3.41 1.137-3.41-1.137L10 3.82z"/>
    <path fillRule="evenodd" d="M3.75 13a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zm0 3a.75.75 0 01.75-.75h11.5a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd"/>
    <path d="M6 12.25a.75.75 0 00-1.5 0V16a.75.75 0 001.5 0v-3.75zm9.5 0a.75.75 0 00-1.5 0V16a.75.75 0 001.5 0v-3.75z"/>
  </svg>
);

export const DomesticFlightIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.228 10.222a.75.75 0 00-1.06-1.06L14.25 11.17V6.522l-3.25-1.625a.75.75 0 00-.638-.035L6.03 6.75H4.75a.75.75 0 000 1.5h1.258l2.434 1.217.006.003c.09.044.183.08.277.111l-.567 1.417a.75.75 0 001.32.528l.583-1.458.583 1.458a.75.75 0 101.32-.528l-.567-1.417c.094-.031.187-.067.277-.111l.006-.003L15.25 8h1.25a.75.75 0 00.728-.528z"/>
    <path fillRule="evenodd" d="M3.5 14.5a.5.5 0 01.5-.5h12a.5.5 0 010 1H4a.5.5 0 01-.5-.5z" clipRule="evenodd"/>
  </svg>
);