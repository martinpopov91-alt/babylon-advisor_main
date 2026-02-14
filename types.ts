import React from 'react';

// Add global window type definition for the AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SAVING = 'SAVING',
  FIXED_EXPENSE = 'FIXED_EXPENSE'
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  INVESTMENT = 'INVESTMENT',
  LOAN = 'LOAN'
}

export type RecurrenceFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  nextDate: string; // ISO Date string (YYYY-MM-DD)
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: string;
  color: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Changed to string for serialization (lookup key in constants)
  types: TransactionType[]; // Which transaction types this category belongs to
  subCategories?: string[]; // Optional list of subcategories
  isCustom?: boolean;
}

export interface BudgetItem {
  id: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  type: TransactionType;
  category: string;
  subCategory?: string;
  note?: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  recurrence?: RecurrenceConfig;
  accountId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  initialAmount: number;
  deadline?: string;
  category: string;
  subCategory?: string;
  color: string;
}

export interface SummaryData {
  totalIncome: number;
  totalSavings: number;
  totalExpenses: number;
  variableExpenses: number;
  balance: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AppSettings {
  startDate: string;
  endDate: string;
  baseCurrency: string;
}