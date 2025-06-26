"use client";

import { 
  Search, 
  LayoutGrid, 
  Heart, 
  UserRound, 
  Headset, 
  ShoppingCart,
  ShoppingBag,
  ShoppingBasket,
  ImageIcon,
  X,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  Clock,
  Settings,
  Check,
  Star,
  Hourglass,
  History,
  Package,
  LocateFixed,
  Copy,
  HelpCircle,
  CircleHelp,
} from "lucide-react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function IconComponent({ name, size = 24, className = "" }: IconProps) {
  const icons: Record<string, JSX.Element> = {
    search: <Search size={size} className={className} />,
    catalog: <LayoutGrid size={size} className={className} />,
    unfavorite: <Heart size={size} className={className} />,
    favorite: <Heart size={size} className={`${className} filled`} fill="currentColor" />,
    profile: <UserRound size={size} className={className} />,
    support: <Headset size={size} className={className} />,
    "cart-empty": (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 512 512" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g>
          <path d="m19.976 134.951h182.048v30h-182.048z" fill="#606075" transform="matrix(.692 -.722 .722 .692 -74.057 126.284)"></path>
          <path d="m386 58.927h30v182.048h-30z" fill="#515165" transform="matrix(.722 -.692 .692 .722 7.782 319.262)"></path>
          <path d="m24.652 258.553 40.649 227.797h190.699l18-133.886-18-93.911z" fill="#92e200"></path>
          <path d="m487.348 258.553h-231.348v227.797h190.699z" fill="#00c100"></path>
          <path d="m0 203.147v80.813h256l13.72-39.407-13.72-41.406z" fill="#d7f369"></path>
          <path d="m256 203.147h256v80.813h-256z" fill="#92e200"></path>
          <path d="m199.224 318.553h30v115h-30z" fill="#d7f369"></path>
          <path d="m282.776 318.553h30v115h-30z" fill="#92e200"></path>
          <path d="m366.328 318.553h30v115h-30z" fill="#92e200"></path>
          <path d="m115.672 318.553h30v115h-30z" fill="#d7f369"></path>
          <circle cx="193" cy="65.65" fill="#d7f369" r="40"></circle>
          <circle cx="319" cy="65.65" fill="#92e200" r="40"></circle>
        </g>
      </svg>
    ),
    "shopping-bag": <ShoppingBag size={size} className={className} />,
    "shopping-basket": <ShoppingBasket size={size} className={className} />,
    "no-image": <ImageIcon size={size} className={className} />,
    "no-favorite": <Heart size={size} className={className} />,
    close: <X size={size} className={className} />,
    x: <X size={size} className={className} />,    trash: <Trash2 size={size} className={className} />,
    cart: <ShoppingCart size={size} className={className} />,
    "arrow-right": <ChevronRight size={size} className={className} />,
    info: <Info size={size} className={className} />,
    right: <ChevronRight size={size} className={className} />,
    left: <ChevronLeft size={size} className={className} />,
    down: <ChevronDown size={size} className={className} />,
    clock: <Clock size={size} className={className} />,
    cart2: <ShoppingCart size={size} className={className} />,
    admin: <Settings size={size} className={className} />,
    checked: <Check size={size} className={className} />,
    star: <Star size={size} className={className} fill="currentColor" />,
    hourglass: <Hourglass size={size} className={className} />,
    history: <History size={size} className={className} />,
    package: <Package size={size} className={className} />,
    "locate-fixed": <LocateFixed size={size} className={className} />,
    copy: <Copy size={size} className={className} />,
    help: <HelpCircle size={size} className={className} />,
    "help-circle": <CircleHelp size={size} className={className} />,
  };

  const iconComponent = icons[name];

  if (!iconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return iconComponent;
} 