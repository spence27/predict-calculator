import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  MAX_BPS,
  MIN_BPS,
  MIN_CONTACTS,
  MIN_LOAN_SIZE,
} from './lib/calculator';
import { calculateLoss } from './lib/loss-calculator';
import { formatCurrency, formatNumber } from './lib/format';

type Step = 'contacts' | 'loanSize' | 'bps' | 'results';

const stepOrder: Step[] = ['contacts', 'loanSize', 'bps', 'results'];

export default function LossCalculator() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('contacts');
  const [contacts, setContacts] = useState('');
  const [loanSize, setLoanSize] = useState('');
  const [bps, setBps] = useState('');
  const [touched, setTouched] = useState<Record<Step, boolean>>({
    contacts: false,
    loanSize: false,
    bps: false,
    results: false
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const contactNumber = Number(contacts || 0);
  const loanSizeNumber = Number(loanSize || 0);
  const bpsNumber = Number(bps || 0);

  const contactValid = contactNumber >= MIN_CONTACTS;
  const loanValid = loanSizeNumber > MIN_LOAN_SIZE;
  const bpsValid = bpsNumber >= MIN_BPS && bpsNumber <= MAX_BPS;

  const result = useMemo(() => {
    if (contactValid && loanValid && bpsValid) {
      return calculateLoss({ contacts: contactNumber, loanSize: loanSizeNumber, bps: bpsNumber });
    }
    return null;
  }, [contactNumber, loanSizeNumber, bpsNumber, contactValid, loanValid, bpsValid]);

  const canGoToStep = (target: Step) => {
    if (target === 'contacts') return true;
    if (target === 'loanSize') return contactValid;
    if (target === 'bps') return contactValid && loanValid;
    if (target === 'results') return contactValid && loanValid && bpsValid;
    return false;
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select?.();
    }
  }, [step]);

  const goToStep = (next: Step) => {
    setStep(next);
    setTouched((prev) => ({ ...prev, [next]: false }));
  };

  const markTouched = (key: Step) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const handleContactAdvance = () => {
    markTouched('contacts');
    if (!contactValid) return;
    goToStep('loanSize');
  };

  const handleLoanAdvance = () => {
    markTouched('loanSize');
    if (!loanValid) return;
    goToStep('bps');
  };

  const handleBpsAdvance = () => {
    markTouched('bps');
    if (!bpsValid) return;
    goToStep('results');
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex <= 0) return;
    const prev = stepOrder[currentIndex - 1];
    goToStep(prev);
  };

  const renderStep = () => {
    switch (step) {
      case 'contacts':
        return (
          <InputScreen
            title="How many contacts are in your database?"
            subtitle="We'll show you how many borrowers are slipping through the cracks."
            label="Contacts in database"
            help="Enter a whole number. Minimum 1 contact."
            error={touched.contacts && !contactValid ? 'Please enter at least 1 contact.' : ''}
            onNext={handleContactAdvance}
            fieldId="contacts-input"
            helpId="contacts-help"
            nextDisabled={!contactValid}
          >
            <NumericFormat
              id="contacts-input"
              getInputRef={inputRef}
              value={contacts}
              onValueChange={(values) => setContacts(values.value)}
              thousandSeparator
              allowNegative={false}
              placeholder="e.g., 2,500"
              inputMode="numeric"
              className={clsx('input', touched.contacts && !contactValid && 'error')}
              onBlur={handleContactAdvance}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleContactAdvance();
              }}
              aria-invalid={touched.contacts && !contactValid}
              aria-describedby="contacts-help"
            />
          </InputScreen>
        );
      case 'loanSize':
        return (
          <InputScreen
            title="What is your average loan size?"
            subtitle="This helps us estimate the dollar value of lost opportunities."
            label="Average loan size"
            help="Must be greater than $50,000."
            error={touched.loanSize && !loanValid ? 'Enter a loan size above $50,000.' : ''}
            onNext={handleLoanAdvance}
            onBack={handleBack}
            fieldId="loan-size-input"
            helpId="loan-help"
            nextDisabled={!loanValid}
          >
            <NumericFormat
              id="loan-size-input"
              getInputRef={inputRef}
              value={loanSize}
              onValueChange={(values) => setLoanSize(values.value)}
              thousandSeparator
              allowNegative={false}
              prefix="$"
              decimalScale={0}
              placeholder="$400,000"
              inputMode="numeric"
              className={clsx('input', touched.loanSize && !loanValid && 'error')}
              onBlur={handleLoanAdvance}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLoanAdvance();
              }}
              aria-invalid={touched.loanSize && !loanValid}
              aria-describedby="loan-help"
            />
          </InputScreen>
        );
      case 'bps':
        return (
          <InputScreen
            title="How many basis points (BPS) do you earn per loan?"
            subtitle="We'll calculate exactly how much commission is walking out the door."
            label="Basis points (BPS)"
            help="Enter a number between 0 and 500."
            error={touched.bps && !bpsValid ? 'BPS must be between 0 and 500.' : ''}
            onNext={handleBpsAdvance}
            onBack={handleBack}
            fieldId="bps-input"
            helpId="bps-help"
            nextDisabled={!bpsValid}
          >
            <NumericFormat
              id="bps-input"
              getInputRef={inputRef}
              value={bps}
              onValueChange={(values) => setBps(values.value)}
              thousandSeparator={false}
              allowNegative={false}
              suffix=" bps"
              decimalScale={0}
              placeholder="e.g., 150"
              inputMode="numeric"
              className={clsx('input', touched.bps && !bpsValid && 'error')}
              onBlur={handleBpsAdvance}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBpsAdvance();
              }}
              aria-invalid={touched.bps && !bpsValid}
              aria-describedby="bps-help"
            />
          </InputScreen>
        );
      case 'results':
        return (
          <LossResultScreen
            onBack={handleBack}
            result={result}
            onSeeRoi={() => navigate('/roi')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="page">
      <header className="header">
        <div className="brand">Lendware Predict Loss Calculator</div>
        <div className="progress" aria-label="Step progress">
          {stepOrder.map((item) => (
            <span
              key={item}
              className={clsx('dot', step === item && 'active')}
              aria-hidden="true"
            />
          ))}
        </div>
      </header>

      <section className="card" aria-live="polite">
        <div className="hero">
          <span className="badge">Database Loss Calculator</span>
          <h1 className="hero-title">What Is Your Database Costing You?</h1>
          <p className="hero-subtitle">
            Most loan officers lose over 60% of in-market borrowers without knowing it.
          </p>
        </div>
        <Stepper
          step={step}
          onSelectStep={(target) => {
            if (canGoToStep(target)) {
              goToStep(target);
            }
          }}
          canGoToStep={canGoToStep}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

function Stepper({
  step,
  onSelectStep,
  canGoToStep
}: {
  step: Step;
  onSelectStep: (target: Step) => void;
  canGoToStep: (target: Step) => boolean;
}) {
  const items: Record<Step, string> = {
    contacts: 'Contacts',
    loanSize: 'Loan size',
    bps: 'BPS',
    results: 'Results'
  };

  return (
    <div className="stepper" aria-label="Stepper">
      {stepOrder.map((item, idx) => (
        <button
          key={item}
          type="button"
          className={clsx('step', step === item && 'active')}
          onClick={() => onSelectStep(item)}
          disabled={!canGoToStep(item)}
          aria-current={step === item}
        >
          {idx + 1}. {items[item]}
        </button>
      ))}
    </div>
  );
}

type InputScreenProps = {
  title: string;
  subtitle: string;
  label: string;
  help: string;
  fieldId: string;
  helpId: string;
  error?: string;
  onNext: () => void;
  nextDisabled?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
};

function InputScreen({
  title,
  subtitle,
  label,
  help,
  fieldId,
  helpId,
  error,
  onNext,
  nextDisabled,
  onBack,
  children
}: InputScreenProps) {
  return (
    <div>
      <div className="title">{title}</div>
      <p className="subtitle">{subtitle}</p>
      <div className="input-block">
        <label className="label" htmlFor={fieldId}>
          {label}
        </label>
        {children}
        <p id={helpId} className={error ? 'error-text' : 'help'}>
          {error || help}
        </p>
      </div>
      <div className="actions">
        {onBack && (
          <button type="button" className="button ghost" onClick={onBack}>
            ← Back
          </button>
        )}
        <button
          type="button"
          className="button primary"
          onClick={onNext}
          disabled={nextDisabled}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

type LossResultScreenProps = {
  onBack: () => void;
  result: ReturnType<typeof calculateLoss> | null;
  onSeeRoi: () => void;
};

function LossResultScreen({ onBack, result, onSeeRoi }: LossResultScreenProps) {
  const data = result ?? {
    inMarket: 0,
    lostLoans: 0,
    lostLoanVolume: 0,
    lostCommission: 0,
  };

  return (
    <div>
      <div className="result-header">
        <div>
          <div className="title">Here's What You're Losing</div>
          <p className="subtitle">
            Based on your database, here's the opportunity walking out the door every year.
          </p>
        </div>
        <span className="pill">Annual estimate</span>
      </div>

      <div className="loss-hero-metric" aria-live="polite">
        <div className="loss-hero-label">You are losing in commission annually</div>
        <div className="loss-hero-value">{formatCurrency(data.lostCommission)}</div>
      </div>

      <div className="metrics" aria-live="polite">
        <Metric
          label="Contacts in database"
          value={formatNumber(data.inMarket / 0.02)}
        />
        <Metric
          label="In the market today (2%)"
          value={formatNumber(data.inMarket)}
        />
        <Metric
          label="Loans walking out the door (60%)"
          value={formatNumber(data.lostLoans)}
        />
        <Metric
          label="Lost loan volume"
          value={formatCurrency(data.lostLoanVolume)}
        />
      </div>

      <div className="actions" style={{ marginTop: 24 }}>
        <button
          type="button"
          className="button primary"
          onClick={onSeeRoi}
        >
          See What You Could Make Instead →
        </button>
        <a
          className="button secondary"
          href="https://calendly.com/lendware"
          target="_blank"
          rel="noreferrer"
        >
          Book a Call
        </a>
        <button type="button" className="button ghost" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
