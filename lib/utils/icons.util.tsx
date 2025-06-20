import { BookOpen, Briefcase, Car, CreditCard, Gift, Heart, Scissors, ShoppingBag, Tv, Utensils } from "lucide-react";
import type React from "react";

export function renderIcon(iconName: string, className = "h-4 w-4"): React.ReactNode {
	const icons: Record<string, React.ReactNode> = {
		Utensils: <Utensils className={className} />,
		CreditCard: <CreditCard className={className} />,
		ShoppingBag: <ShoppingBag className={className} />,
		Briefcase: <Briefcase className={className} />,
		Tv: <Tv className={className} />,
		BookOpen: <BookOpen className={className} />,
		Car: <Car className={className} />,
		Scissors: <Scissors className={className} />,
		Gift: <Gift className={className} />,
		Heart: <Heart className={className} />,
	};

	return icons[iconName] || <ShoppingBag className={className} />;
}
