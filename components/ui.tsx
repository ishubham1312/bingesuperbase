
import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { Movie, UserList, MediaType, User, Episode } from '../types';
import { AppContext } from '../context';
import { Link, useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../services/api';
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";

// ========= ICONS ==========
export const StarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21z" clipRule="evenodd" />
    </svg>
);
export const HalfStarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
        <path fillRule="evenodd" d="M12 3.543V18.354L7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21c.224-.538.988-.538 1.212 0L12 3.543z" clipRule="evenodd" />
    </svg>
);
export const SearchIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);
export const CloseIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
export const ChevronRightIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);
export const PlayIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);
export const PlusIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
        <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75z" clipRule="evenodd" />
    </svg>
);
export const ChevronLeftIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);

export const SunIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25M12 18.75V21M4.219 4.219l1.591 1.591M18.19 18.19l1.591 1.591M3 12h2.25M18.75 12H21M4.219 19.781l1.591-1.591M18.19 5.81l1.591-1.591M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
  </svg>
);

export const MoonIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
);

export const DownloadIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const EditIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const CameraIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    </svg>
);

export const DotsVerticalIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>
);

export const PinIcon = BsPinAngle;
export const PinFilledIcon = BsPinAngleFill;

export const TrashIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export const ShareIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" />
    </svg>
);

export const DragHandleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const CalendarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);

export const FilterIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013l-2.5 1a2.25 2.25 0 0 1-2.557-2.013v-2.927a2.25 2.25 0 0 0-.659-1.591L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

export const ResetIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.69a8.25 8.25 0 0 0-11.667 0l-3.181 3.183" />
    </svg>
);

export const SettingsIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 0 1-.22.127c-.331.183-.581.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const EmailIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

export const LogoutIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

export const UploadIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

export const GoogleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className} {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.68,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


// ========= SPINNER =========
export const Spinner = ({ small } : { small?: boolean }) => (
    <div className={`flex justify-center items-center ${small ? 'h-24' : 'h-full min-h-[50vh]'}`}>
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${small ? 'h-8 w-8' : 'h-16 w-16'}`}></div>
    </div>
);

// ========= STAR RATING (0.5 increments) =========
interface StarRatingProps {
    count: number;
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
}
export const StarRating: React.FC<StarRatingProps> = ({ count, rating, onRatingChange, size = 'md' }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const starContainerRef = useRef<HTMLDivElement>(null);

    const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onRatingChange) return;
        const target = e.target as HTMLDivElement;
        const starElement = target.closest('.star-wrapper');
        if (!starElement) return;
        
        const rect = starElement.getBoundingClientRect();
        const index = parseInt(starElement.getAttribute('data-index') || '0', 10);
        const percentage = (e.clientX - rect.left) / rect.width;
        
        const newHoverRating = index + (percentage <= 0.5 ? 0.5 : 1);
        setHoverRating(newHoverRating);
    };

    const handleMouseLeave = () => {
        if (!onRatingChange) return;
        setHoverRating(0);
    };
    
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onRatingChange) return;
        onRatingChange(hoverRating);
    }
    
    const displayRating = hoverRating || rating;

    return (
        <div 
            className="flex items-center" 
            ref={starContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {[...Array(count)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <div key={index} className="star-wrapper relative cursor-pointer" data-index={index}>
                         {displayRating >= ratingValue ? (
                            <StarIcon className={`text-yellow-400 ${sizeClasses[size]}`} />
                        ) : displayRating >= ratingValue - 0.5 ? (
                            <HalfStarIcon className={`text-yellow-400 ${sizeClasses[size]}`} />
                        ) : (
                            <StarIcon className={`text-gray-300 dark:text-gray-600 ${sizeClasses[size]}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ========= TOGGLE SWITCH =========
interface ToggleSwitchProps {
    isToggled: boolean;
    onToggle: () => void;
}
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isToggled, onToggle }) => (
    <button
        role="switch"
        aria-checked={isToggled}
        onClick={onToggle}
        className={`relative inline-flex items-center h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark-card ${isToggled ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${isToggled ? 'translate-x-8' : 'translate-x-0'}`}
        >
             {isToggled ? <MoonIcon className="h-5 w-5 text-indigo-600" /> : <SunIcon className="h-5 w-5 text-yellow-500" />}
        </span>
    </button>
);


// ========= MODAL =========
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    containerClassName?: string;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, containerClassName = "max-w-md" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div 
                className={`bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full relative ${containerClassName}`} 
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-100 bg-black/30 rounded-full p-1.5 hover:bg-black/60 transition-colors z-20">
                    <CloseIcon className="h-5 w-5" />
                </button>
                {children}
            </div>
        </div>
    );
};

// ========= ADD TO LIST MODAL =========
interface AddToListModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
}
export const AddToListModal: React.FC<AddToListModalProps> = ({ movie, isOpen, onClose }) => {
    const { user, addMovieToList, createList } = useContext(AppContext);
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [rating, setRating] = useState(0);
    const [newListName, setNewListName] = useState('');
    const [showNewList, setShowNewList] = useState(false);

    const isTvShow = movie.mediaType === 'tv';
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
    const [selectedEpisodes, setSelectedEpisodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setSelectedListId(user?.lists[0]?.id || '');
            setRating(0);
            setNewListName('');
            setShowNewList(false);
            setSelectedEpisodes(new Set());
            setEpisodes([]);

            if (isTvShow && movie.seasons && movie.seasons.length > 0) {
                const firstSeason = movie.seasons.find(s => s.season > 0) || movie.seasons[0];
                if (firstSeason) setSelectedSeason(firstSeason.season);
            } else {
                setSelectedSeason(null);
            }
        }
    }, [isOpen, movie, isTvShow, user?.lists]);

    useEffect(() => {
        if (isTvShow && selectedSeason !== null && movie.id && isOpen) {
            setIsLoadingEpisodes(true);
            setEpisodes([]);
            setSelectedEpisodes(new Set());
            api.fetchSeasonDetails(movie.id, selectedSeason)
                .then(setEpisodes)
                .catch(console.error)
                .finally(() => setIsLoadingEpisodes(false));
        }
    }, [isTvShow, selectedSeason, movie.id, isOpen]);

    const handleEpisodeSelection = (episodeId: number) => {
        setSelectedEpisodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(episodeId)) {
                newSet.delete(episodeId);
            } else {
                newSet.add(episodeId);
            }
            return newSet;
        });
    };

    const handleSelectAllEpisodes = () => {
        if (episodes.length === 0) return;
        if (selectedEpisodes.size === episodes.length) {
            setSelectedEpisodes(new Set());
        } else {
            setSelectedEpisodes(new Set(episodes.map(ep => ep.id)));
        }
    };

    const handleAdd = async () => {
        if (!selectedListId || rating === 0) {
            alert("Please select a list and provide a rating.");
            return;
        }
        if (isTvShow && selectedEpisodes.size === 0) {
            if (!window.confirm("You have not selected any episodes. Do you want to add the entire series to your list?")) {
                return;
            }
        }
        await addMovieToList(selectedListId, movie.id, movie.mediaType, rating, isTvShow ? Array.from(selectedEpisodes) : undefined);
        onClose();
    };

    const handleCreateAndAdd = async () => {
        if (!newListName.trim() || rating === 0) {
            alert("Please provide a new list name and a rating.");
            return;
        }
        if (isTvShow && selectedEpisodes.size === 0) {
            if (!window.confirm("You have not selected any episodes. Do you want to add the entire series to your list?")) {
                return;
            }
        }
        const createdList = await createList(newListName.trim());
        if (createdList) {
             await addMovieToList(createdList.id, movie.id, movie.mediaType, rating, isTvShow ? Array.from(selectedEpisodes) : undefined);
        }
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} containerClassName={isTvShow ? "max-w-lg" : "max-w-md"}>
            <div className="p-6">
                 <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">{`Add "${movie.title}"`}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating ({rating > 0 ? rating : 'None'})</label>
                        <StarRating count={5} rating={rating} onRatingChange={setRating} size="lg" />
                    </div>

                    {isTvShow && movie.seasons && movie.seasons.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select episodes to track</label>
                             <select
                                value={selectedSeason ?? ''}
                                onChange={e => setSelectedSeason(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {movie.seasons.filter(s => s.season > 0).map(s => (
                                    <option key={s.season} value={s.season}>Season {s.season} ({s.episodes} Episodes)</option>
                                ))}
                            </select>
                            
                            {isLoadingEpisodes ? (
                                <Spinner small />
                            ) : episodes.length > 0 ? (
                                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="flex items-center sticky top-0 bg-light-card dark:bg-dark-card py-1">
                                        <input
                                            type="checkbox"
                                            id="select-all"
                                            checked={selectedEpisodes.size > 0 && selectedEpisodes.size === episodes.length}
                                            onChange={handleSelectAllEpisodes}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="select-all" className="ml-2 block text-sm font-semibold text-gray-900 dark:text-gray-300 cursor-pointer">
                                            Select All ({selectedEpisodes.size}/{episodes.length})
                                        </label>
                                    </div>
                                    {episodes.map(episode => (
                                        <div key={episode.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`ep-${episode.id}`}
                                                checked={selectedEpisodes.has(episode.id)}
                                                onChange={() => handleEpisodeSelection(episode.id)}
                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor={`ep-${episode.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer truncate">
                                                E{episode.episodeNumber}: {episode.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-gray-500">No episodes found for this season.</p>
                            )}
                        </div>
                    )}
                    
                    {showNewList ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="New list name"
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                             <button onClick={() => setShowNewList(false)} className="text-sm text-primary hover:underline">Cancel</button>
                        </div>
                    ) : (
                         <div className="space-y-2">
                            <select
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {user.lists.length > 0 ? (
                                    user.lists.map((list: UserList) => (
                                        <option key={list.id} value={list.id}>{list.name}</option>
                                    ))
                                ) : (
                                    <option>Create a new list first</option>
                                )}
                            </select>
                            <button onClick={() => setShowNewList(true)} className="text-sm text-primary hover:underline">Create new list</button>
                        </div>
                    )}
                    
                    <button 
                        onClick={showNewList ? handleCreateAndAdd : handleAdd}
                        disabled={((!selectedListId && !showNewList) || (showNewList && !newListName.trim())) || rating === 0}
                        className="w-full bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-400"
                    >
                        {showNewList ? 'Create & Add' : 'Add to List'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// ========= CREATE LIST MODAL =========
interface CreateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}
export const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name.trim());
            setName('');
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
             <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Create New List</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter list name"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-6 flex justify-end">
                    <button onClick={handleCreate} disabled={!name.trim()} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-400">Create List</button>
                </div>
             </div>
        </Modal>
    );
};

// ========= RENAME LIST MODAL =========
interface RenameListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    currentName: string;
}
export const RenameListModal: React.FC<RenameListModalProps> = ({ isOpen, onClose, onRename, currentName }) => {
    const [name, setName] = useState(currentName);

    useEffect(() => {
        if(isOpen) {
            setName(currentName);
        }
    }, [isOpen, currentName]);

    const handleRename = () => {
        if (name.trim() && name.trim() !== currentName) {
            onRename(name.trim());
            onClose();
        } else if (name.trim() === currentName) {
            onClose();
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
             <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">Rename List</h3>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter new list name"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                />
                <div className="mt-6 flex justify-end">
                    <button onClick={handleRename} disabled={!name.trim()} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-400">Save Changes</button>
                </div>
             </div>
        </Modal>
    );
};


// ========= CIRCLE RATING =========
const CircleRating = ({ rating }: { rating: number }) => {
    const percentage = Math.round(rating * 10);
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const strokeColor = percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-12 h-12 bg-dark-card rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-full h-full" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r={radius} className="stroke-current text-gray-700" strokeWidth="3" fill="transparent" />
                <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    className={`stroke-current ${strokeColor}`}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {percentage}<span className="text-xs">%</span>
            </span>
        </div>
    );
};

// ========= TRENDING MOVIE CARD =========
export const TrendingMovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
    const navigate = useNavigate();
    
    const handleCardClick = (e: React.MouseEvent) => {
        // Allow clicks on buttons inside to work without navigating
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        navigate(`/details/${movie.mediaType}/${movie.id}`);
    };
    
    return (
        <div className="w-52 sm:w-60 flex-shrink-0 group cursor-pointer" onClick={handleCardClick}>
            <div className="relative">
                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                     <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="absolute top-2 right-2">
                    <button className="bg-black/40 backdrop-blur-sm p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {e.stopPropagation(); alert('Menu clicked!'); }}>
                        <DotsVerticalIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="absolute -bottom-6 left-3">
                    <CircleRating rating={movie.publicRating} />
                </div>
            </div>
            <div className="mt-8 px-1">
                <h4 className="font-bold text-md truncate text-light-text dark:text-dark-text group-hover:text-primary transition-colors" title={movie.title}>
                    {movie.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
};


// ========= MOVIE CARD =========
interface MovieCardProps {
    movie: Movie;
    listName?: string;
    listId?: string;
}
export const MovieCard: React.FC<MovieCardProps> = ({ movie, listName, listId }) => {
    const { user, setMovieToAdd } = useContext(AppContext);
    const navigate = useNavigate();

    const findListItem = useMemo(() => {
        if (!user) return null;
        const allItems = user.lists.flatMap(l => 
            l.items.map(i => ({ ...i, listId: l.id, listName: l.name }))
        );
        const movieItems = allItems.filter(item => item.movieId === movie.id && item.mediaType === movie.mediaType);
        if (movieItems.length === 0) return null;

        // Sort by most recently added date and return the first one
        return movieItems.sort((a, b) => new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime())[0];
    }, [user, movie.id, movie.mediaType]);

    const isInList = !!findListItem;
    const targetListId = findListItem?.listId;
    // Use the passed listName or the found one for the badge
    const displayListName = listName || findListItem?.listName;
    const displayListId = listId || findListItem?.listId;

    const handleCardClick = () => {
        navigate(`/details/${movie.mediaType}/${movie.id}`);
    };

    return (
        <div 
            className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg overflow-hidden w-48 sm:w-60 flex-shrink-0 flex flex-col cursor-pointer group"
            onClick={handleCardClick}
        >
            <div className="h-72 sm:h-96 overflow-hidden">
                <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h4 className="font-bold text-md truncate text-light-text dark:text-dark-text group-hover:text-primary transition-colors" title={movie.title}>
                        {movie.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{movie.genres.join(', ') || movie.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{movie.releaseDate?.split('-')[0]}</p>
                    {isInList && displayListId && (
                        <Link 
                            to={`/list/${displayListId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block mt-1"
                        >
                            <span 
                                className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 hover:bg-primary/20 transition-colors" 
                                title={`In list: ${displayListName}`}
                            >
                                {displayListName}
                            </span>
                        </Link>
                    )}
                </div>
                
                {isInList && targetListId ? (
                     <Link
                        to={`/list/${targetListId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-center w-full mt-2 bg-indigo-600 text-white font-bold py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors text-sm"
                    >
                        Watch in List
                    </Link>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMovieToAdd(movie);
                        }}
                        className="w-full mt-2 bg-primary text-white font-bold py-2 px-3 rounded-md hover:bg-primary-hover transition-colors text-sm"
                    >
                        Add to List
                    </button>
                )}
            </div>
        </div>
    );
};

// ========= LIST CARD for Profile Page =========
interface ListCardProps {
    list: UserList;
    onPin: (listId: string) => void;
    onRename: (list: UserList) => void;
    onShare: (listId: string) => void;
    onDelete: (listId: string) => void;
}

export const ListCard: React.FC<ListCardProps> = ({ list, onPin, onRename, onShare, onDelete }) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: list.id,
        disabled: !list.pinned,
        resizeObserverConfig: {
            disabled: true,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col"
        >
            {list.pinned && (
                 <button 
                    {...attributes} 
                    {...listeners} 
                    className="absolute top-2 left-2 p-2 cursor-grab text-gray-400 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 z-10" 
                    title="Drag to reorder"
                    onClick={(e) => e.stopPropagation()}
                 >
                    <DragHandleIcon className="w-5 h-5" />
                 </button>
            )}

            <div 
                className="p-6 flex-grow cursor-pointer group"
                onClick={() => navigate(`/list/${list.id}`)}
            >
                <h3 className="font-bold text-xl truncate text-white group-hover:text-primary transition-colors pl-8">{list.name}</h3>
                <p className="text-sm text-gray-300 mt-1 pl-8">{list.items.length} item{list.items.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="mt-auto pt-2 pb-3 px-4 flex justify-end items-center border-t border-white/10 mx-2 space-x-1">
                <button 
                    onClick={() => onPin(list.id)} 
                    className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title={list.pinned ? 'Unpin' : 'Pin to Top'}
                >
                    {list.pinned ? <PinFilledIcon className="w-5 h-5 text-primary"/> : <PinIcon className="w-5 h-5"/>}
                </button>
                 <button 
                    onClick={() => onRename(list)} 
                    className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Rename List"
                 >
                    <EditIcon className="w-5 h-5"/>
                </button>
                 <button 
                    onClick={() => onShare(list.id)} 
                    className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Share (Export)"
                 >
                    <ShareIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => onDelete(list.id)} 
                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete List"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
            
            {list.pinned && (
                 <div className="absolute top-0 right-3 -translate-y-1/2 bg-primary p-1.5 rounded-full shadow-lg">
                    <PinFilledIcon className="w-5 h-5 text-white" />
                </div>
            )}
        </div>
    );
};

// ========= EPISODE CARD for Details Page =========
interface EpisodeCardProps {
    episode: Episode;
}
export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
    const airDate = useMemo(() => {
        if (!episode.airDate || episode.airDate === 'N/A') return 'TBA';
        return new Date(episode.airDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [episode.airDate]);

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row gap-4 p-4">
            <div className="flex-shrink-0 w-full sm:w-48 md:w-56">
                <img src={episode.stillPath} alt={`Still from ${episode.name}`} className="w-full h-auto object-cover rounded-md aspect-video" />
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-light-text dark:text-dark-text">
                    {`E${episode.episodeNumber}: ${episode.name}`}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Aired: {airDate}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {episode.overview || "No overview available."}
                </p>
            </div>
        </div>
    );
};