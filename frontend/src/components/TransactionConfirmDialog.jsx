import { useState } from 'react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

/**
 * Transaction Confirmation Dialog
 * Shows transaction details and asks for user confirmation before submission
 */
export function TransactionConfirmDialog({ 
  open, 
  onOpenChange, 
  type, 
  amount, 
  details,
  onConfirm,
  loading 
}) {
  const formatAmount = (val) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(val);
  };

  const getTitle = () => {
    switch (type) {
      case 'subscribe':
        return 'Confirm Subscription';
      case 'redeem':
        return 'Confirm Redemption';
      default:
        return 'Confirm Transaction';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'subscribe':
        return `You are about to subscribe ${formatAmount(amount)} USDC to the Renewra fund.`;
      case 'redeem':
        return `You are about to redeem ${formatAmount(amount)} REI tokens.`;
      default:
        return 'Please review the transaction details below.';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          {details?.map((detail, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{detail.label}</span>
              <span className="font-medium">{detail.value}</span>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
