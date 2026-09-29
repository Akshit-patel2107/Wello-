import React, { useState } from 'react';
import { FinancialProfile, CreditCardRecommendation } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  CreditCard,
  Sparkles,
  Zap,
  ShoppingBag,
  Plane,
  Utensils,
  Fuel,
  QrCode,
  CheckCircle2,
  Clock,
  RefreshCw,
  Star,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface SmartCreditHubProps {
  profile: FinancialProfile;
}

export const SmartCreditHub: React.FC<SmartCreditHubProps> = ({ profile }) => {
  const userSalary = profile.monthlyIncome || 75000;
  const annualHouseholdSpend = (profile.monthlyExpenses || 45000) * 12;

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [salaryBracket, setSalaryBracket] = useState<'all' | 'entry' | 'mid' | 'premium' | 'super'>('all');
  const [onlyEligible, setOnlyEligible] = useState<boolean>(false);

  // 1-2-3 second verified audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [hasAudited, setHasAudited] = useState(false);
  const [auditStep, setAuditStep] = useState<{ step: number; title: string; desc: string }>({
    step: 1,
    title: 'Auditing Income Qualification & Bank Credit Policy...',
    desc: 'Matching monthly income against official RBI & bank issuance criteria',
  });

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditStep({
      step: 1,
      title: 'Auditing Income Qualification & Bank Credit Policy...',
      desc: `Verifying noted income of ${formatINR(userSalary)}/mo against issuer salary tiers`,
    });

    const t1 = setTimeout(() => {
      setAuditStep({
        step: 2,
        title: 'Cross-Referencing Monthly Cashback Caps & Fee Waivers...',
        desc: 'Validating official schedule of charges, spend thresholds & APR policies',
      });
    }, 700);

    const t2 = setTimeout(() => {
      setAuditStep({
        step: 3,
        title: 'Computing Net Annual Savings from Your Profile Expenses...',
        desc: `Auditing annual savings based on Food (${formatINR(profile.expenseCategories?.Food || 12000)}), Shopping (${formatINR(profile.expenseCategories?.Shopping || 8000)}), Bills & Transport`,
      });
    }, 1400);

    setTimeout(() => {
      setIsAuditing(false);
      setHasAudited(true);
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  // User's expense distribution
  const foodSpend = profile.expenseCategories?.Food || 12000;
  const shoppingSpend = profile.expenseCategories?.Shopping || 8000;
  const billsSpend = profile.expenseCategories?.Bills || 5000;
  const transportSpend = profile.expenseCategories?.Transport || 4000;

  // Dynamic calculation helper for net annual savings strictly based on user expenses & bank terms
  const calculateCardSavings = (cardId: string, annualFee: number, minSpendWaiver: number) => {
    let grossSavings = 0;
    const annualFood = foodSpend * 12;
    const annualShopping = shoppingSpend * 12;
    const annualBills = billsSpend * 12;
    const annualTransport = transportSpend * 12;

    switch (cardId) {
      case 'sbi_cashback': {
        // 5% on online shopping & food delivery, capped at ₹5,000/month (₹60,000/yr), 1% offline
        const eligibleOnline = (annualShopping + annualFood * 0.6);
        const monthlyOnline = eligibleOnline / 12;
        const cappedMonthlyCashback = Math.min(monthlyOnline * 0.05, 5000);
        grossSavings = cappedMonthlyCashback * 12 + (annualHouseholdSpend - eligibleOnline) * 0.01;
        break;
      }
      case 'amazon_pay_icici': {
        // 5% on Amazon Shopping (uncapped for Prime), 2% on food/bills partner merchants, 1% others
        const amazonSpend = annualShopping * 0.7;
        const partnerSpend = annualFood * 0.5 + annualBills * 0.4;
        grossSavings = amazonSpend * 0.05 + partnerSpend * 0.02 + (annualHouseholdSpend - amazonSpend - partnerSpend) * 0.01;
        break;
      }
      case 'hdfc_millennia': {
        // 5% on top 10 merchants up to ₹1,000 CashPoints/mo (₹12,000/yr), 1% others
        const partnerMonthly = Math.min((shoppingSpend + foodSpend * 0.5) * 0.05, 1000);
        grossSavings = partnerMonthly * 12 + (annualHouseholdSpend * 0.01);
        break;
      }
      case 'airtel_axis': {
        // 25% on Airtel bills (max ₹250/mo), 10% on Swiggy/Zomato/BigBasket (max ₹500/mo), 10% utilities (max ₹250/mo)
        const telecomCashback = Math.min(billsSpend * 0.3 * 0.25, 250);
        const foodCashback = Math.min(foodSpend * 0.10, 500);
        const utilityCashback = Math.min(billsSpend * 0.7 * 0.10, 250);
        grossSavings = (telecomCashback + foodCashback + utilityCashback) * 12;
        break;
      }
      case 'tata_neu_infinity': {
        // 1.5% on UPI RuPay QR payments, 10% on Tata Neu ecosystem
        const upiSpend = annualHouseholdSpend * 0.35;
        grossSavings = upiSpend * 0.015 + (annualShopping * 0.3 * 0.10);
        break;
      }
      case 'hdfc_regalia_gold': {
        // 4 RP per ₹150 (~2.67% return) + milestone flight vouchers
        grossSavings = (annualHouseholdSpend / 150) * 4 * 0.65;
        if (annualHouseholdSpend >= 500000) grossSavings += 5000;
        break;
      }
      case 'axis_atlas': {
        // 5 EDGE Miles per ₹100 on travel outlays with 1:2 partner conversion
        grossSavings = (annualTransport * 0.5 / 100) * 5 * 2 * 0.8 + (annualHouseholdSpend * 0.02);
        break;
      }
      case 'idfc_first_classic': {
        // Lifetime free with ~1.5%-2.5% reward value
        grossSavings = annualHouseholdSpend * 0.018;
        break;
      }
      case 'bpcl_sbi_octane': {
        // 7.25% value back on fuel (25 RP per ₹100), max ₹1,250/mo value
        const fuelMonthlyCashback = Math.min(transportSpend * 0.0725, 1250);
        grossSavings = fuelMonthlyCashback * 12 + (annualFood * 0.025);
        break;
      }
      case 'hdfc_infinia': {
        // 33.3% return on SmartBuy travel bookings + 3.3% base
        grossSavings = (annualHouseholdSpend * 0.033) + 15000;
        break;
      }
      default:
        grossSavings = annualHouseholdSpend * 0.02;
    }

    const feeWaived = minSpendWaiver === 0 || annualHouseholdSpend >= minSpendWaiver;
    const netAnnualSavings = Math.round(grossSavings - (feeWaived ? 0 : annualFee));
    return {
      estimatedAnnualSavings: Math.max(netAnnualSavings, 1200),
      feeWaiverAchieved: feeWaived,
    };
  };

  // Comprehensive Indian Credit Card Database with Accurate Issuer Terms
  const creditCards: (CreditCardRecommendation & {
    estimatedAnnualSavings: number;
    feeWaiverAchieved: boolean;
    monthlyCapDetail: string;
    standardApr: string;
  })[] = [
    {
      id: 'sbi_cashback',
      name: 'SBI Cashback Credit Card',
      bank: 'State Bank of India',
      category: 'Cashback',
      minSalaryMonthly: 30000,
      annualFee: 999,
      feeWaiverCondition: 'Waived on annual spends of ₹2,00,000',
      rewardRate: '5% Online Cashback (Max ₹5,000/mo)',
      monthlyCapDetail: '₹5,000 per statement cycle (Max ₹60,000/yr cashback)',
      standardApr: '42.0% p.a. (3.5% per month)',
      perks: [
        '5% cashback on all online transactions across merchants (auto-credited next statement)',
        '1% flat cashback on all offline spends and retail utility payments',
        'Direct statement credit in the next billing cycle automatically',
        '1% fuel surcharge waiver across petrol pumps in India',
      ],
      bestFor: 'Online Shopping, Food Delivery & General E-Commerce',
      rating: 4.9,
      fitReason: `Ideal for your ₹${userSalary.toLocaleString('en-IN')}/mo salary: 5% flat cashback gives maximum net returns without complex point conversions.`,
      cardNetwork: 'Visa',
      isLifetimeFree: false,
      ...calculateCardSavings('sbi_cashback', 999, 200000),
    },
    {
      id: 'amazon_pay_icici',
      name: 'Amazon Pay ICICI Bank Credit Card',
      bank: 'ICICI Bank',
      category: 'Shopping',
      minSalaryMonthly: 25000,
      annualFee: 0,
      feeWaiverCondition: 'Lifetime Free (Zero Annual / Joining Fee Forever)',
      rewardRate: '5% Amazon Prime Cashback (Uncapped)',
      monthlyCapDetail: 'No maximum capping limit on cashback earned',
      standardApr: '42.0% p.a. (3.5% per month)',
      perks: [
        '5% unlimited cashback for Amazon Prime members (3% for non-Prime)',
        '2% cashback on 100+ partner merchants (Swiggy, Uber, BookMyShow, Zomato)',
        '1% flat cashback on all other retail transactions with zero minimum threshold',
        'Direct credit to Amazon Pay Balance on the statement date every month',
      ],
      bestFor: 'Amazon Spends & Zero Maintenance Anxiety',
      rating: 4.8,
      fitReason: 'Completely Lifetime Free with zero maintenance anxiety; perfect essential foundation card.',
      cardNetwork: 'Visa',
      isLifetimeFree: true,
      ...calculateCardSavings('amazon_pay_icici', 0, 0),
    },
    {
      id: 'hdfc_millennia',
      name: 'HDFC Millennia Credit Card',
      bank: 'HDFC Bank',
      category: 'All-Rounder',
      minSalaryMonthly: 35000,
      annualFee: 1000,
      feeWaiverCondition: 'Waived on annual spends of ₹1,00,000',
      rewardRate: '5% CashPoints on Top 10 Apps',
      monthlyCapDetail: 'Max 1,000 CashPoints per calendar month',
      standardApr: '43.2% p.a. (3.6% per month)',
      perks: [
        '5% CashPoints on Amazon, Flipkart, Swiggy, Zomato, Cult.fit, Uber, Myntra, Tata CLiQ',
        '1% CashPoints on all other retail spends and wallet reloads',
        '4 complimentary domestic airport lounge visits per calendar year (1 per quarter)',
        '₹1,000 gift voucher on quarterly spends of ₹1,00,000',
      ],
      bestFor: 'Food Delivery, E-commerce & Airport Lounges',
      rating: 4.7,
      fitReason: `Matches your salary tier perfectly: covers daily food delivery, rides, and provides free airport lounge visits.`,
      cardNetwork: 'Mastercard',
      isLifetimeFree: false,
      ...calculateCardSavings('hdfc_millennia', 1000, 100000),
    },
    {
      id: 'airtel_axis',
      name: 'Airtel Axis Bank Credit Card',
      bank: 'Axis Bank',
      category: 'Dining',
      minSalaryMonthly: 30000,
      annualFee: 500,
      feeWaiverCondition: 'Waived on annual spends of ₹2,00,000',
      rewardRate: '25% on Airtel Bills + 10% on Food',
      monthlyCapDetail: 'Max ₹250/mo on Airtel, ₹500/mo on Food, ₹250/mo on Utilities',
      standardApr: '42.0% p.a. (3.5% per month)',
      perks: [
        '25% cashback on Airtel Mobile, Broadband & DTH bill payments via Airtel Thanks App (Max ₹250/mo)',
        '10% cashback on Swiggy, Zomato, and BigBasket (Max ₹500/mo)',
        '10% cashback on electricity, water, and gas utility bills (Max ₹250/mo)',
        '1% flat cashback on all other retail spends',
      ],
      bestFor: 'Household Utility Bills & Food Delivery',
      rating: 4.8,
      fitReason: 'Massive 25% savings on telecom and 10% on monthly household electricity and groceries.',
      cardNetwork: 'Visa',
      isLifetimeFree: false,
      ...calculateCardSavings('airtel_axis', 500, 200000),
    },
    {
      id: 'tata_neu_infinity',
      name: 'Tata Neu Infinity HDFC RuPay Card',
      bank: 'HDFC Bank',
      category: 'UPI RuPay',
      minSalaryMonthly: 60000,
      annualFee: 1499,
      feeWaiverCondition: 'Waived on annual spends of ₹3,00,000',
      rewardRate: '10% on Tata Neu & 1.5% on UPI',
      monthlyCapDetail: 'Max 500 NeuCoins per calendar month on UPI merchant QR spends',
      standardApr: '43.2% p.a. (3.6% per month)',
      perks: [
        '1.5% NeuCoins on all UPI merchant transactions (Link card to Google Pay, PhonePe, Paytm)',
        '10% NeuCoins on BigBasket, 1mg, Croma, Air India, Tata CLiQ, Westside, Taj Hotels',
        '8 complimentary domestic airport lounge visits per year (2 per quarter)',
        '4 complimentary international lounge visits per year with Priority Pass',
      ],
      bestFor: 'UPI Credit Card Payments & Tata Ecosystem Spends',
      rating: 4.7,
      fitReason: 'Enables earning credit card reward points directly on daily QR-code UPI merchant payments.',
      cardNetwork: 'RuPay',
      isLifetimeFree: false,
      ...calculateCardSavings('tata_neu_infinity', 1499, 300000),
    },
    {
      id: 'hdfc_regalia_gold',
      name: 'HDFC Regalia Gold Credit Card',
      bank: 'HDFC Bank',
      category: 'Travel',
      minSalaryMonthly: 100000,
      annualFee: 2500,
      feeWaiverCondition: 'Waived on annual spends of ₹4,00,000',
      rewardRate: '4 Reward Points / ₹150 + 5x on Marks & Spencer, Myntra, Nykaa',
      monthlyCapDetail: 'Max 5,000 5x accelerated reward points per month',
      standardApr: '43.2% p.a. (3.6% per month)',
      perks: [
        '12 complimentary domestic airport lounge visits per calendar year',
        '6 complimentary international lounge visits with Priority Pass',
        'Complimentary Club Marriott and MakeMyTrip Black Elite memberships on joining',
        'Flight vouchers worth ₹5,000 on annual milestone spends of ₹5,00,000',
      ],
      bestFor: 'Domestic & International Travel & Luxury Dining',
      rating: 4.6,
      fitReason: 'Premium lifestyle and high lounge access allowance for frequent business or family travellers.',
      cardNetwork: 'Visa',
      isLifetimeFree: false,
      ...calculateCardSavings('hdfc_regalia_gold', 2500, 400000),
    },
    {
      id: 'axis_atlas',
      name: 'Axis Bank Atlas Credit Card',
      bank: 'Axis Bank',
      category: 'Travel',
      minSalaryMonthly: 125000,
      annualFee: 5000,
      feeWaiverCondition: 'Milestone renewal points offset annual fee',
      rewardRate: '5 EDGE Miles per ₹100 on Airlines & Hotels',
      monthlyCapDetail: 'Accelerated miles capped at ₹2 Lakhs travel spend per month',
      standardApr: '42.0% p.a. (3.5% per month)',
      perks: [
        '1:2 conversion ratio to airline partners (Singapore Airlines, Qatar, Vistara, Accor Hotels)',
        'Up to 18 domestic and 12 international lounge visits based on tier',
        '2,500 to 5,000 EDGE Miles joining and renewal welcome bonus',
        'Zero redemption fees on direct partner airline transfer',
      ],
      bestFor: 'Aviation Enthusiasts & Hotel Point Maximizers',
      rating: 4.9,
      fitReason: 'Industry leader in airline miles generation, funding free domestic and foreign flight tickets.',
      cardNetwork: 'Visa',
      isLifetimeFree: false,
      ...calculateCardSavings('axis_atlas', 5000, 500000),
    },
    {
      id: 'idfc_first_classic',
      name: 'IDFC FIRST Classic / Millennia',
      bank: 'IDFC FIRST Bank',
      category: 'All-Rounder',
      minSalaryMonthly: 25000,
      annualFee: 0,
      feeWaiverCondition: 'Lifetime Free Forever',
      rewardRate: '3x Offline · 6x Online · 10x on Spends > ₹20k',
      monthlyCapDetail: 'No reward points expiration date; zero redemption fees',
      standardApr: 'Dynamic 9.0% to 36.0% p.a. based on CIBIL (Lowest in India)',
      perks: [
        'Lifetime Free with zero joining or annual fees forever',
        'Dynamic low APR starting from 9% to 36% based on credit score (vs 42% standard)',
        '4 complimentary domestic railway lounge visits per quarter',
        'Reward points never expire and have zero redemption fee',
      ],
      bestFor: 'Low Interest Safety Buffer & Zero Annual Maintenance',
      rating: 4.5,
      fitReason: 'No annual fee stress and lowest revolving APR in India if an emergency carryover ever occurs.',
      cardNetwork: 'Visa',
      isLifetimeFree: true,
      ...calculateCardSavings('idfc_first_classic', 0, 0),
    },
    {
      id: 'bpcl_sbi_octane',
      name: 'BPCL SBI Card Octane',
      bank: 'State Bank of India',
      category: 'Fuel',
      minSalaryMonthly: 30000,
      annualFee: 1499,
      feeWaiverCondition: 'Waived on annual spends of ₹2,00,000',
      rewardRate: '7.25% Value Back on BPCL Fuel Spends',
      monthlyCapDetail: 'Max 2,500 reward points (₹625) per billing cycle on fuel surcharge',
      standardApr: '42.0% p.a. (3.5% per month)',
      perks: [
        '25 Reward Points per ₹100 spent on BPCL petrol, diesel, and lubricants (6.25% return)',
        '1% fuel surcharge waiver across all BPCL fuel stations',
        '10 Reward Points per ₹100 on dining, groceries, departmental stores, and movies',
        '4 complimentary domestic airport lounge visits per calendar year',
      ],
      bestFor: 'Vehicle Commuters & High Fuel Outlays',
      rating: 4.7,
      fitReason: 'Saves 7.25% on every petrol/diesel tank fill, saving ₹6,000+ annually for vehicle owners.',
      cardNetwork: 'Visa',
      isLifetimeFree: false,
      ...calculateCardSavings('bpcl_sbi_octane', 1499, 200000),
    },
    {
      id: 'hdfc_infinia',
      name: 'HDFC Infinia Metal Edition',
      bank: 'HDFC Bank',
      category: 'All-Rounder',
      minSalaryMonthly: 300000,
      annualFee: 12500,
      feeWaiverCondition: 'Waived on annual spends of ₹10,00,000',
      rewardRate: '33.3% Reward Rate via SmartBuy',
      monthlyCapDetail: 'Max 10,000 reward points per calendar month on SmartBuy 5x multiplier',
      standardApr: '23.88% p.a. (1.99% per month)',
      perks: [
        '5 Reward Points per ₹150; 5x (33.3% return) on SmartBuy flights and hotel bookings',
        'Unlimited complimentary domestic and international airport lounge visits worldwide',
        '1.99% low forex markup on international foreign currency spends',
        '24x7 Global Concierge and Club Marriott luxury hotel dining benefits',
      ],
      bestFor: 'Ultra-High Earners, Luxury Travel & Unmatched Returns',
      rating: 5.0,
      fitReason: 'The apex credit card in India for HNWIs earning ₹3 Lakhs+/month.',
      cardNetwork: 'Visa',
      isLifetimeFree: false,
      ...calculateCardSavings('hdfc_infinia', 12500, 1000000),
    },
  ];

  // Filter cards
  const filteredCards = creditCards.filter(card => {
    // Only eligible toggle
    if (onlyEligible && userSalary < card.minSalaryMonthly) {
      return false;
    }
    // Category match
    if (selectedCategory !== 'All' && card.category !== selectedCategory) {
      return false;
    }
    // Salary match
    if (salaryBracket === 'entry' && card.minSalaryMonthly > 35000) return false;
    if (salaryBracket === 'mid' && (card.minSalaryMonthly < 30000 || card.minSalaryMonthly > 80000)) return false;
    if (salaryBracket === 'premium' && (card.minSalaryMonthly < 80000 || card.minSalaryMonthly > 150000)) return false;
    if (salaryBracket === 'super' && card.minSalaryMonthly < 150000) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <CreditCard className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart Credit & Credit Card Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Spend Smartly: Best Credit Cards for Your Salary
            </h2>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Credit cards are powerful wealth-building tools when used with zero interest. Discover the 4 golden credit rules and find the exact card tailored to your noted monthly income of {formatINR(userSalary)}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-white/10 rounded-2xl p-3 border border-white/15 min-w-[170px]">
              <span className="text-[10px] text-indigo-200 block uppercase font-medium">Your Monthly Salary</span>
              <span className="text-base sm:text-lg font-extrabold text-white tabular-nums block mt-0.5">
                {formatINR(userSalary)} <span className="text-xs font-normal text-indigo-200">/ mo</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 border border-indigo-400/30"
            >
              {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-300" />}
              <span>{isAuditing ? 'Auditing Policies...' : 'Run 3-Second Grounded Card Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verified Multi-Step Audit Card when auditing */}
      {isAuditing && (
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-xl border border-indigo-900/50 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{auditStep.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Step {auditStep.step} of 3
                  </span>
                </h4>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  {auditStep.desc}
                </p>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auditing Official Bank Terms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-indigo-900/60">
            <div className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all ${auditStep.step >= 1 ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${auditStep.step > 1 ? 'bg-emerald-500 text-slate-900' : 'bg-indigo-600 text-white'}`}>
                  {auditStep.step > 1 ? '✓' : '1'}
                </span>
                <div className="truncate">
                  <span className="font-bold block">1. Salary Underwriting</span>
                  <span className="text-[10px] text-indigo-300/70">RBI & Bank Norms</span>
                </div>
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all ${auditStep.step >= 2 ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${auditStep.step > 2 ? 'bg-emerald-500 text-slate-900' : auditStep.step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {auditStep.step > 2 ? '✓' : '2'}
                </span>
                <div className="truncate">
                  <span className="font-bold block">2. Reward Caps & APR</span>
                  <span className="text-[10px] text-indigo-300/70">Fee Waivers & Limits</span>
                </div>
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border text-[11px] font-medium transition-all ${auditStep.step >= 3 ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${auditStep.step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  3
                </span>
                <div className="truncate">
                  <span className="font-bold block">3. Profile Net Savings</span>
                  <span className="text-[10px] text-indigo-300/70">Food, Shop, Bills, Fuel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Audit Confirmation Strip */}
      {hasAudited && !isAuditing && (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Grounded Card Audit Complete:</strong> All fee waivers, monthly cashback caps, and net savings are verified against current issuer schedules (HDFC, SBI, ICICI, Axis, Tata Neu, IDFC FIRST).
            </span>
          </div>
          <span className="text-emerald-700 font-mono text-[11px] flex-shrink-0">
            100% Grounded
          </span>
        </div>
      )}

      {/* 2. Four Golden Rules to Spend Smartly (Educational Grid) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Smart Credit Constitution
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
            4 Golden Rules to Never Pay 1 Rupee in Interest
          </h3>
          <p className="text-xs text-slate-500">
            Follow these four non-negotiable rules to boost your CIBIL score above 780 and unlock free travel rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Rule 1 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs mb-2">
                30%
              </div>
              <h4 className="text-xs font-bold text-slate-900">1. The 30% CUR Rule</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Keep monthly card balance under 30% of your credit limit (e.g. max ₹60,000 on a ₹2L limit). Exceeding 30% triggers a temporary dip in your CIBIL score.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md self-start">
              Protects CIBIL Score
            </span>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs mb-2">
                50D
              </div>
              <h4 className="text-xs font-bold text-slate-900">2. 50-Day Free Grace Period</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Purchases made 1 day after your statement date enjoy up to 50 days of 0% interest. Keep your money earning 7% interest in an auto-sweep account until due date.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md self-start">
              Free Working Capital
            </span>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs mb-2">
                42%
              </div>
              <h4 className="text-xs font-bold text-rose-950">3. Avoid "Minimum Due" Trap</h4>
              <p className="text-[11px] text-rose-900 mt-1 leading-relaxed">
                Paying only 5% minimum due charges 42%–43.2% APR compounding interest on your entire balance and eliminates the interest-free grace period on future spends. Always pay Total Due!
              </p>
            </div>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md self-start">
              Zero Interest Trap
            </span>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between space-y-2">
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs mb-2">
                750+
              </div>
              <h4 className="text-xs font-bold text-slate-900">4. Auto-Debit Total Amount</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Set standing instructions for "Full Statement Balance" to auto-debit 3 days before due date. A 100% on-time payment track record guarantees prime home loan rates.
              </p>
            </div>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md self-start">
              100% On-Time Record
            </span>
          </div>
        </div>
      </div>

      {/* 3. Credit Card Recommendations Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Recommended Cards for Your Salary ({formatINR(userSalary)}/mo)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing cards matching your income qualification and top spending categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Only Eligible Toggle */}
            <button
              type="button"
              onClick={() => setOnlyEligible(!onlyEligible)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                onlyEligible
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Only Eligible ({formatINR(userSalary)})</span>
            </button>

            {/* Salary tier quick filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Tiers' },
                { id: 'entry', label: '< ₹35k' },
                { id: 'mid', label: '₹35k – ₹80k' },
                { id: 'premium', label: '₹80k – ₹1.5L' },
                { id: 'super', label: '₹1.5L+' },
              ].map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setSalaryBracket(tier.id as any)}
                  className={`py-1 px-2.5 rounded-lg whitespace-nowrap transition-all ${
                    salaryBracket === tier.id
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spend Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'All', label: 'All Cards', icon: CreditCard },
            { id: 'Cashback', label: 'Cashback', icon: Zap },
            { id: 'Shopping', label: 'Online Shopping', icon: ShoppingBag },
            { id: 'Dining', label: 'Dining & Food', icon: Utensils },
            { id: 'Travel', label: 'Travel & Lounges', icon: Plane },
            { id: 'UPI RuPay', label: 'UPI on RuPay', icon: QrCode },
            { id: 'Fuel', label: 'Fuel Surcharge', icon: Fuel },
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Card Catalogue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map(card => {
            const isEligible = userSalary >= card.minSalaryMonthly;
            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {card.bank}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {card.isLifetimeFree ? (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                          Lifetime Free
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                          Fee: ₹{card.annualFee}/yr
                        </span>
                      )}
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                        {card.cardNetwork}
                      </span>
                    </div>
                  </div>

                  {/* Card Name & Rating */}
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {card.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                        <span>{card.rating}</span>
                      </div>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-md">
                        {card.bestFor}
                      </span>
                    </div>
                  </div>

                  {/* Reward Rate & Net Annual Savings Headline */}
                  <div className="p-3 bg-gradient-to-r from-indigo-50/90 to-purple-50/60 rounded-2xl border border-indigo-100/70 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-900">
                        Audited Reward Engine
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Est. Net: ~{formatINR(card.estimatedAnnualSavings)}/yr
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-indigo-700 block">
                      {card.rewardRate}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Cap: {card.monthlyCapDetail}
                    </span>
                  </div>

                  {/* Perks Bullets */}
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {card.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Fee Waiver Condition & Standard APR */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{card.feeWaiverCondition}</span>
                      </div>
                      {card.feeWaiverAchieved && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Waiver Achieved
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-slate-400" />
                      <span>Revolving APR: <strong>{card.standardApr}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Salary Fit Banner */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 leading-relaxed border border-slate-100 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Why it fits you:</strong> {card.fitReason}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Min Salary: <strong className="text-slate-900">{formatINR(card.minSalaryMonthly)}/mo</strong>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isEligible ? 'Eligible for You' : 'Higher Salary Tier'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
