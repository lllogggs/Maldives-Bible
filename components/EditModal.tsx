import React, { useState, useEffect } from 'react';
import type { Resort } from '../types';
import { GalleryIcon } from './icons/Icons';

interface EditModalProps {
  resort: Resort;
  onSave: (resortId: number, newImageUrl: string) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ resort, onSave, onClose }) => {
  const [imageUrl, setImageUrl] = useState(resort.imageUrls?.[0] || '');

  useEffect(() => {
    setImageUrl(resort.imageUrls?.[0] || '');
  }, [resort]);

  const handleSave = () => {
    if (imageUrl.trim()) {
        onSave(resort.id, imageUrl);
    }
  };
  
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(resort.name_en)}`;
  const googleImageSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(resort.name_en)}+gallery&tbm=isch`;
  const officialGalleryUrl = resort.homepageUrl ? `${resort.homepageUrl.replace(/\/$/, '')}/gallery` : null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-11/12 max-w-lg relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 id="edit-modal-title" className="text-2xl font-bold text-gray-900 mb-4">{resort.name} 이미지 수정</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">현재 대표 이미지:</p>
          <img src={resort.imageUrls?.[0]} alt="Current resort view" className="w-full h-48 object-cover rounded-md border bg-gray-100" />
        </div>

        <div className="mb-6">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            새 대표 이미지 URL
          </label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="https://..."
          />
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
           <h3 className="text-sm font-semibold text-gray-800 mb-2">이미지 찾기 헬퍼</h3>
           <p className="text-xs text-gray-600 mb-4">가장 좋은 방법은 '공식 갤러리'에서 고품질 이미지를 찾아 URL을 복사하는 것입니다.</p>
           <div className="flex flex-col items-start gap-3">
            {officialGalleryUrl && (
              <a 
                href={officialGalleryUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-800 text-sm font-bold rounded-md hover:bg-cyan-200 transition-colors"
              >
                <GalleryIcon />
                공식 갤러리 바로가기
              </a>
             )}
             <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs sm:text-sm">
               <span className="text-gray-600">또는:</span>
               <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google 검색</a>
               <span className="text-gray-400">&bull;</span>
               <a href={googleImageSearchUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">이미지 검색</a>
             </div>
           </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;