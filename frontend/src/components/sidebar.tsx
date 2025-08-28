import { Link, useLocation } from "wouter";
import { 
  Home, 
  CreditCard, 
  Building2, 
  Calendar, 
  PieChart,
  BarChart3,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Credit Cards", href: "/credit-cards", icon: CreditCard },
  { name: "Loans", href: "/loans", icon: Building2 },
  { name: "Payment Schedule", href: "/schedule", icon: Calendar },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-neutral-200 hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            KashGrip
          </span>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-white"
                      : "hover:bg-neutral-100 text-neutral-700"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
