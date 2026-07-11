import React from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Heart,
  Image,
  MapPin,
  Martini,
  MessageCircle,
  Pencil,
  Plane,
  PlaneLanding,
  RotateCwSquare,
  Sailboat,
  Search,
  Send,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  Utensils,
  Waves,
  X,
  XCircle,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconProps = LucideProps & {
  className?: string;
};

const iconStroke = 1.9;

export const SearchIcon: React.FC<IconProps> = ({ className = 'h-5 w-5 text-gray-400', ...props }) => (
  <Search className={className} strokeWidth={iconStroke} {...props} />
);

export const StarIcon: React.FC<IconProps> = ({ className = 'h-4 w-4 text-yellow-400 fill-yellow-400', ...props }) => (
  <Star className={className} strokeWidth={iconStroke} {...props} />
);

export const LocationPinIcon: React.FC<IconProps> = ({ className = 'h-4 w-4', ...props }) => (
  <MapPin className={className} strokeWidth={iconStroke} {...props} />
);

export const EditIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Pencil className={className} strokeWidth={iconStroke} {...props} />
);

export const GalleryIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Image className={className} strokeWidth={iconStroke} {...props} />
);

export const BoatIcon: React.FC<IconProps> = ({ className = 'h-5 w-5 text-gray-600', ...props }) => (
  <Sailboat className={className} strokeWidth={iconStroke} {...props} />
);

export const SeaplaneIcon: React.FC<IconProps> = ({ className = 'h-5 w-5 text-gray-600' }) => (
  <span className={`relative inline-block align-middle ${className}`} aria-hidden="true">
    <PlaneLanding className="absolute left-0 top-0 h-[72%] w-full" strokeWidth={iconStroke} />
    <Waves className="absolute bottom-0 left-0 h-[48%] w-full" strokeWidth={iconStroke} />
  </span>
);

export const DomesticFlightIcon: React.FC<IconProps> = ({ className = 'h-5 w-5 text-gray-600', ...props }) => (
  <Plane className={className} strokeWidth={iconStroke} {...props} />
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <ChevronLeft className={className} strokeWidth={2.4} {...props} />
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <ChevronRight className={className} strokeWidth={2.4} {...props} />
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = 'h-4 w-4', ...props }) => (
  <ChevronDown className={className} strokeWidth={2.2} {...props} />
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <ArrowLeft className={className} strokeWidth={iconStroke} {...props} />
);

export const LinkIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <ExternalLink className={className} strokeWidth={iconStroke} {...props} />
);

export const ShareIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Send className={className} strokeWidth={2} {...props} />
);

export const CalendarIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <CalendarDays className={className} strokeWidth={iconStroke} {...props} />
);

export const DollarIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <DollarSign className={className} strokeWidth={iconStroke} {...props} />
);

export const ClockIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Clock className={className} strokeWidth={iconStroke} {...props} />
);

export const RestaurantIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Utensils className={className} strokeWidth={iconStroke} {...props} />
);

export const BarIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Martini className={className} strokeWidth={iconStroke} {...props} />
);

export const PoolIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Waves className={className} strokeWidth={iconStroke} {...props} />
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <CheckCircle2 className={className} strokeWidth={iconStroke} {...props} />
);

export const XCircleIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <XCircle className={className} strokeWidth={iconStroke} {...props} />
);

export const KidsClubIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Sparkles className={className} strokeWidth={iconStroke} {...props} />
);

export const HeartIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Heart className={className} strokeWidth={iconStroke} {...props} />
);

export const HeartFilledIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <Heart className={className} fill="currentColor" strokeWidth={iconStroke} {...props} />
);

export const CartIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <ShoppingCart className={className} strokeWidth={iconStroke} {...props} />
);

export const XIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <X className={className} strokeWidth={2.2} {...props} />
);

export const KakaoIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <MessageCircle className={className} fill="currentColor" strokeWidth={iconStroke} {...props} />
);

export const UserIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <UserRound className={className} strokeWidth={iconStroke} {...props} />
);

export const BuildingIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <Building2 className={className} strokeWidth={iconStroke} {...props} />
);

export const FilterIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <SlidersHorizontal className={className} strokeWidth={iconStroke} {...props} />
);

export const SortIcon: React.FC<IconProps> = ({ className = 'h-5 w-5', ...props }) => (
  <ArrowUpDown className={className} strokeWidth={iconStroke} {...props} />
);

export const RotateDeviceIcon: React.FC<IconProps> = ({ className = 'h-6 w-6', ...props }) => (
  <RotateCwSquare className={className} strokeWidth={iconStroke} {...props} />
);
