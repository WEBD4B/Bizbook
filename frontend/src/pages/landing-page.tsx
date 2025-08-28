import React from "react";
import { useLocation } from "wouter";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  PieChart, 
  Wallet, 
  CreditCard, 
  Target, 
  Users, 
  Award,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle,
  Star,
  Play
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Wallet className="h-8 w-8 text-emerald-600" />,
      title: "Smart Expense Tracking",
      description: "AI-powered categorization that learns your spending patterns and automatically organizes your finances."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-emerald-600" />,
      title: "Real-time Analytics",
      description: "Get instant insights with beautiful visualizations and predictive forecasting for better decisions."
    },
    {
      icon: <Target className="h-8 w-8 text-emerald-600" />,
      title: "Goal Achievement",
      description: "Set financial targets and track your progress with milestone celebrations and smart recommendations."
    },
    {
      icon: <Shield className="h-8 w-8 text-emerald-600" />,
      title: "Bank-Grade Security",
      description: "Your data is protected with 256-bit encryption and multi-factor authentication."
    },
    {
      icon: <Zap className="h-8 w-8 text-emerald-600" />,
      title: "Lightning Fast",
      description: "Optimized performance ensures your financial data loads instantly, every time."
    },
    {
      icon: <Globe className="h-8 w-8 text-emerald-600" />,
      title: "Multi-Currency",
      description: "Manage finances across different currencies with real-time exchange rates."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Small Business Owner",
      content: "KashGrip transformed my financial management. The automated categorization saves me hours every week!",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Freelance Designer",
      content: "The analytics dashboard is incredible. I can see exactly where my money goes and plan better.",
      rating: 5,
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: "Startup Founder",
      content: "KashGrip helped me get investor-ready financials in half the time. Absolutely game-changing!",
      rating: 5,
      avatar: "ER"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "$2.5B+", label: "Managed" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "Rating" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  KashGrip
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Reviews</a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">Pricing</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <button className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <button
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6 animate-fade-in-up">
                <Zap className="h-4 w-4 mr-2" />
                Now with AI-powered insights
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up animation-delay-200">
                Take Control of Your
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                  Financial Future
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-400">
                KashGrip makes managing your money effortless with smart automation, 
                beautiful insights, and powerful tools that grow with your success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up animation-delay-600">
                <button
                  onClick={() => setLocation("/auth")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 flex items-center justify-center group">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 animate-fade-in-up animation-delay-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fade-in-left animation-delay-1000">
              <div className="relative">
                <img 
                  src="https://cdn.dribbble.com/userupload/18443206/file/original-1eb55d6f85640b3826a8c39974609314.png?resize=752x&vertical=center" 
                  alt="KashGrip Dashboard" 
                  className="w-full rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-500"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live data sync</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border animate-float animation-delay-1000">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700">+23% this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Everything You Need to
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                Master Your Money
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Powerful features designed to simplify your financial life and accelerate your success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 animate-fade-in-up"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-right">
              <img 
                src="https://explorecareers.com.au/wp-content/uploads/2023/04/Website-Feature-Image-10.png" 
                alt="Financial Planning Made Easy" 
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
            <div className="animate-fade-in-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Simple Steps to
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                  Financial Freedom
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Getting started with KashGrip is effortless. Our intuitive design guides you 
                through every step of your financial journey.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <span className="text-emerald-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Connect Your Accounts</h4>
                    <p className="text-gray-600">Securely link your bank accounts and credit cards in seconds.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <span className="text-emerald-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">AI Categorizes Everything</h4>
                    <p className="text-gray-600">Our smart AI automatically organizes your transactions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <span className="text-emerald-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Get Insights & Grow</h4>
                    <p className="text-gray-600">Receive personalized recommendations to optimize your finances.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Loved by Thousands
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in-up animation-delay-200">
              See what our amazing users have to say about their KashGrip experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 animate-fade-in-up animation-delay-200">
            Join thousands of smart individuals already using KashGrip to build wealth and achieve financial freedom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <button
              onClick={() => setLocation("/auth")}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Start Your Free Trial
            </button>
            <SignInButton mode="modal">
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-emerald-600 transition-all duration-200">
                Sign In
              </button>
            </SignInButton>
          </div>
          <div className="mt-6 text-emerald-100 text-sm animate-fade-in-up animation-delay-600">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">KashGrip</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Your intelligent financial companion. Take control of your money with 
                powerful tools, beautiful insights, and AI-driven recommendations.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 KashGrip. All rights reserved. Built with ❤️ for your financial success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
