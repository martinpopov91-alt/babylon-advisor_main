import React from 'react';
import { 
  Briefcase, 
  Home, 
  ShoppingCart, 
  Utensils, 
  Car, 
  Heart, 
  Zap, 
  Smartphone, 
  Wifi, 
  Film, 
  Gift, 
  Coffee, 
  Fuel, 
  PiggyBank, 
  Shield, 
  TrendingUp, 
  Landmark,
  CircleDollarSign,
  MoreHorizontal,
  GraduationCap,
  PawPrint,
  Plane,
  Shirt,
  CreditCard,
  Gamepad2,
  Hammer,
  Bus,
  Laptop,
  Baby,
  Banknote,
  Wallet,
  Music,
  Book,
  Smile,
  Sun,
  Umbrella,
  Cloud,
  Moon,
  Star,
  Award,
  Bell,
  Camera,
  Watch,
  Headphones,
  MapPin,
  Navigation,
  Anchor,
  Bike,
  Train,
  Truck,
  Package,
  ShoppingBag,
  Tag
} from 'lucide-react';
import { BudgetItem, TransactionType, Category, SavingsGoal, Currency, Account, AccountType } from './types.ts';

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

function TargetIcon(props: any) {
  return React.createElement("svg", {
      ...props,
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    },
    React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
    React.createElement("circle", { cx: "12", cy: "12", r: "6" }),
    React.createElement("circle", { cx: "12", cy: "12", r: "2" })
  );
}

export const ACCOUNT_ICONS: Record<AccountType, any> = {
  [AccountType.CHECKING]: Landmark,
  [AccountType.SAVINGS]: PiggyBank,
  [AccountType.CREDIT_CARD]: CreditCard,
  [AccountType.CASH]: Banknote,
  [AccountType.INVESTMENT]: TrendingUp,
  [AccountType.LOAN]: Wallet,
};

// Map of icon keys to components for serialization
export const CATEGORY_ICONS_MAP: Record<string, any> = {
  Briefcase, Home, ShoppingCart, Utensils, Car, Heart, Zap, Smartphone, Wifi, Film, Gift, Coffee, Fuel, PiggyBank, Shield, TrendingUp, Landmark, CircleDollarSign, MoreHorizontal, GraduationCap, PawPrint, Plane, Shirt, CreditCard, Gamepad2, Hammer, Bus, Laptop, Baby, Banknote, Wallet, TargetIcon, Music, Book, Smile, Sun, Umbrella, Cloud, Moon, Star, Award, Bell, Camera, Watch, Headphones, MapPin, Navigation, Anchor, Bike, Train, Truck, Package, ShoppingBag, Tag
};

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'default-checking',
    name: 'Main Checking',
    type: AccountType.CHECKING,
    initialBalance: 0,
    currency: 'EUR',
    color: '#6366F1', // Indigo
    isDefault: true
  },
  {
    id: 'default-cash',
    name: 'Cash / Wallet',
    type: AccountType.CASH,
    initialBalance: 0,
    currency: 'EUR',
    color: '#10B981' // Emerald
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { 
    id: 'Salary', 
    name: 'Salary', 
    icon: 'Briefcase', 
    types: [TransactionType.INCOME],
    subCategories: ['Base Salary', 'Bonus', 'Overtime', 'Commission']
  },
  { 
    id: 'Business', 
    name: 'Business & Freelance', 
    icon: 'Laptop', 
    types: [TransactionType.INCOME],
    subCategories: ['Freelance', 'Consulting', 'Sales', 'Side Hustle']
  },
  { 
    id: 'Passive', 
    name: 'Passive Income', 
    icon: 'TrendingUp', 
    types: [TransactionType.INCOME],
    subCategories: ['Dividends', 'Interest', 'Rental Income', 'Crypto']
  },
  { 
    id: 'GiftsInc', 
    name: 'Gifts & Refunds', 
    icon: 'Gift', 
    types: [TransactionType.INCOME],
    subCategories: ['Tax Refund', 'Gift Received', 'Sold Items']
  },
  { 
    id: 'Rollover', 
    name: 'Rollover', 
    icon: 'CircleDollarSign', 
    types: [TransactionType.INCOME],
    subCategories: ['Previous Month']
  },
  { 
    id: 'Housing', 
    name: 'Housing', 
    icon: 'Home', 
    types: [TransactionType.FIXED_EXPENSE, TransactionType.EXPENSE],
    subCategories: ['Rent', 'Mortgage', 'Property Tax', 'Condo Fees', 'Home Insurance']
  },
  { 
    id: 'Utilities', 
    name: 'Utilities', 
    icon: 'Zap', 
    types: [TransactionType.FIXED_EXPENSE, TransactionType.EXPENSE],
    subCategories: ['Electricity', 'Water', 'Heating', 'Garbage', 'Gas']
  },
  { 
    id: 'Digital', 
    name: 'Digital Services', 
    icon: 'Wifi', 
    types: [TransactionType.FIXED_EXPENSE],
    subCategories: ['Internet', 'Mobile Plan', 'Cloud Storage', 'Software Subscriptions', 'VPN']
  },
  { 
    id: 'Insurance', 
    name: 'Insurance', 
    icon: 'Shield', 
    types: [TransactionType.FIXED_EXPENSE],
    subCategories: ['Life', 'Health', 'Disability', 'Legal']
  },
  { 
    id: 'Debt', 
    name: 'Debt Repayment', 
    icon: 'CreditCard', 
    types: [TransactionType.FIXED_EXPENSE, TransactionType.EXPENSE],
    subCategories: ['Credit Card', 'Student Loan', 'Personal Loan', 'Car Loan']
  },
  { 
    id: 'Education', 
    name: 'Education', 
    icon: 'GraduationCap', 
    types: [TransactionType.FIXED_EXPENSE, TransactionType.EXPENSE],
    subCategories: ['Tuition', 'Courses', 'Books', 'School Supplies']
  },
  { 
    id: 'Groceries', 
    name: 'Groceries', 
    icon: 'ShoppingCart', 
    types: [TransactionType.EXPENSE],
    subCategories: ['Supermarket', 'Market', 'Bakery', 'Butcher']
  },
  { 
    id: 'Dining', 
    name: 'Dining Out', 
    icon: 'Utensils', 
    types: [TransactionType.EXPENSE],
    subCategories: ['Restaurants', 'Fast Food', 'Delivery', 'Lunch']
  },
  { 
    id: 'Drinks', 
    name: 'Coffee & Drinks', 
    icon: 'Coffee', 
    types: [TransactionType.EXPENSE],
    subCategories: ['Coffee Shop', 'Bar', 'Alcohol', 'Clubs']
  },
  { 
    id: 'Transport', 
    name: 'Transportation', 
    icon: 'Car', 
    types: [TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE],
    subCategories: ['Fuel', 'Public Transit', 'Taxi/Uber', 'Parking', 'Tolls', 'Car Wash', 'Maintenance', 'Car Insurance']
  },
  { 
    id: 'Shopping', 
    name: 'Shopping', 
    icon: 'Shirt', 
    types: [TransactionType.EXPENSE],
    subCategories: ['Clothing', 'Shoes', 'Electronics', 'Furniture', 'Home & Garden']
  },
  { 
    id: 'Health', 
    name: 'Health & Wellness', 
    icon: 'Heart', 
    types: [TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE],
    subCategories: ['Pharmacy', 'Doctor', 'Dentist', 'Gym', 'Sports', 'Therapy', 'Vitamins']
  },
  { 
    id: 'Personal', 
    name: 'Personal Care', 
    icon: 'Smile', 
    types: [TransactionType.EXPENSE],
    subCategories: ['Hairdresser', 'Cosmetics', 'Spa', 'Barber', 'Hygiene']
  },
  { 
    id: 'Entertainment', 
    name: 'Entertainment', 
    icon: 'Film', 
    types: [TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE],
    subCategories: ['Streaming (Netflix/Spotify)', 'Movies', 'Games', 'Concerts', 'Hobbies', 'Books']
  },
  { 
    id: 'Travel', 
    name: 'Travel', 
    icon: 'Plane', 
    types: [TransactionType.EXPENSE, TransactionType.SAVING],
    subCategories: ['Flights', 'Hotels', 'Airbnb', 'Activities', 'Souvenirs']
  },
  { 
    id: 'Family', 
    name: 'Family & Kids', 
    icon: 'Baby', 
    types: [TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE],
    subCategories: ['Childcare', 'Toys', 'Baby Supplies', 'School Activities', 'Allowance']
  },
  { 
    id: 'Pets', 
    name: 'Pets', 
    icon: 'PawPrint', 
    types: [TransactionType.EXPENSE],
    subCategories: ['Vet', 'Pet Food', 'Toys', 'Grooming']
  },
  { 
    id: 'Gifts', 
    name: 'Gifts & Charity', 
    icon: 'Gift', 
    types: [TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE],
    subCategories: ['Birthday', 'Holiday', 'Wedding', 'Charity', 'Donations']
  },
  { 
    id: 'Maintenance', 
    name: 'Home Maintenance', 
    icon: 'Hammer', 
    types: [TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE],
    subCategories: ['Repairs', 'Renovation', 'Cleaning', 'Gardening', 'Tools']
  },
  { 
    id: 'Savings', 
    name: 'General Savings', 
    icon: 'PiggyBank', 
    types: [TransactionType.SAVING],
    subCategories: ['Emergency Fund', 'Rainy Day', 'Opportunity Fund']
  },
  { 
    id: 'Investments', 
    name: 'Investments', 
    icon: 'TrendingUp', 
    types: [TransactionType.SAVING],
    subCategories: ['Stocks', 'ETFs', 'Crypto', 'Real Estate', 'Bonds', 'Retirement']
  },
  { 
    id: 'GoalSavings', 
    name: 'Specific Goals', 
    icon: 'TargetIcon', 
    types: [TransactionType.SAVING],
    subCategories: ['Vacation Fund', 'Car Fund', 'Home Downpayment', 'Gadgets']
  },
  { id: 'Other', name: 'Other', icon: 'MoreHorizontal', types: [TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.FIXED_EXPENSE, TransactionType.SAVING] }
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_DATA: BudgetItem[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];