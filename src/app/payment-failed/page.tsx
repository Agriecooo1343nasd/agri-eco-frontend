"use client";

import Link from "next/link";
import { XCircle, ArrowRight, RefreshCw, Headphones } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const PaymentFailedPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-12 md:py-20 max-w-xl mx-auto text-center">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground animate-in slide-in-from-top-4 duration-500">
          Payment Failed
        </h1>
        <p className="text-muted-foreground mt-3 text-base animate-in slide-in-from-top-4 duration-700 max-w-sm mx-auto">
          Unfortunately, your payment could not be processed. No charges have
          been made to your account.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-10 text-left space-y-4 shadow-xl shadow-destructive/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="font-heading font-bold text-foreground text-base flex items-center gap-2 border-b border-border pb-3">
            <XCircle className="h-4 w-4 text-destructive" /> Possible reasons:
          </h3>
          <ul className="space-y-3 text-sm text-foreground/80">
            <li className="flex items-start gap-4 p-2 rounded-lg hover:bg-destructive/5 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs mt-0.5">
                1
              </span>
              <div>
                <p className="font-bold text-foreground">Insufficient funds</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your account does not have enough balance for this
                  transaction.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 p-2 rounded-lg hover:bg-destructive/5 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs mt-0.5">
                2
              </span>
              <div>
                <p className="font-bold text-foreground">
                  Incorrect card details
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Double check your card number, CVV, and expiry date.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 p-2 rounded-lg hover:bg-destructive/5 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs mt-0.5">
                3
              </span>
              <div>
                <p className="font-bold text-foreground">Bank decline</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your bank might have blocked the transaction for security
                  reasons.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 p-2 rounded-lg hover:bg-destructive/5 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs mt-0.5">
                4
              </span>
              <div>
                <p className="font-bold text-foreground">Connection error</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A network timeout occurred during processing.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <Button
            asChild
            className="h-12 px-8 rounded-xl font-bold font-heading text-lg shadow-lg shadow-primary/20 flex-1 sm:flex-initial"
          >
            <Link href="/checkout" className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" /> Try Again
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 rounded-xl font-bold font-heading text-lg flex-1 sm:flex-initial"
          >
            <Link href="/cart" className="flex items-center gap-2">
              Back to Cart <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 bg-accent border border-border rounded-xl p-5 flex items-start gap-4 text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Headphones className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-sm font-heading">
              Need Assistance?
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              If your payment continues to fail, please contact our support team
              at{" "}
              <a
                href="mailto:support@agri-eco.com"
                className="text-primary font-bold hover:underline"
              >
                support@agri-eco.com
              </a>{" "}
              or call us at{" "}
              <a
                href="tel:+250785760108"
                className="text-primary font-bold hover:underline"
              >
                0785760108
              </a>
              . We are here to help!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentFailedPage;
