"use client";

import { 
  Search, 
  Grid3X3, 
  Heart, 
  User, 
  HelpCircle, 
  ShoppingCart,
  ImageIcon,
  X,
  Trash2,
  ChevronRight
} from "lucide-react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function IconComponent({ name, size = 24, className = "" }: IconProps) {
  const icons: Record<string, JSX.Element> = {
    search: <Search size={size} className={className} />,
    catalog: <Grid3X3 size={size} className={className} />,
    unfavorite: <Heart size={size} className={className} />,
    favorite: <Heart size={size} className={`${className} filled`} fill="currentColor" />,
    profile: <User size={size} className={className} />,
    support: <HelpCircle size={size} className={className} />,
    "cart-empty": <ShoppingCart size={size} className={className} />,
    "no-image": <ImageIcon size={size} className={className} />,
    "no-favorite": <Heart size={size} className={className} />,
    close: <X size={size} className={className} />,
    trash: <Trash2 size={size} className={className} />,
    cart: <ShoppingCart size={size} className={className} />,
    "arrow-right": <ChevronRight size={size} className={className} />
  };

  const iconComponent = icons[name];

  if (!iconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return iconComponent;
} 