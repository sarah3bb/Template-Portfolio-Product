import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import './ReadOnlyBanner.css';

export default function ReadOnlyBanner({ onRestart }) {
  const { isPastDue, normalTrialUsed } = useSubscription();

  let message;
  if (isPastDue) {
    message = 'There was a problem with your last payment. Your portfolio stays live, but editing is locked until it\'s resolved.';
  } else if (normalTrialUsed) {
    message = 'Your subscription has ended. Your portfolio stays live, but editing is locked until you restart your subscription.';
  } else {
    message = 'Start a free trial to unlock editing. Your portfolio stays live either way.';
  }

  return (
    <div className="rob-banner" role="status">
      <p className="rob-text">{message}</p>
      <button className="rob-btn" onClick={onRestart}>
        {isPastDue ? 'Update payment method' : 'Restart subscription'}
      </button>
    </div>
  );
}
