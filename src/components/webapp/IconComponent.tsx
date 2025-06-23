"use client";

import { 
  Search, 
  LayoutGrid, 
  Heart, 
  UserRound, 
  Headset, 
  ShoppingCart,
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
    "cart-empty": <ShoppingCart size={size} className={className} />,
    "no-image": <ImageIcon size={size} className={className} />,
    "no-favorite": <Heart size={size} className={className} />,
    close: <X size={size} className={className} />,
    trash: <Trash2 size={size} className={className} />,
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
  };

  const iconComponent = icons[name];

  if (!iconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return iconComponent;
} 