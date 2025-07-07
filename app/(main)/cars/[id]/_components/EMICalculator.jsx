import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Currency } from "lucide-react";
import React, { useState } from "react";

const calculateEMI = (principal, annualRate, months) => {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return Math.round(
    (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  );
};

const EMICalculator = ({ amount }) => {
  // Use string values to allow clearing and avoid leading 0 bugs
  const [price, setPrice] = useState(amount.toString());
  const [downPayment, setDownPayment] = useState("0");
  const [interestRate, setInterestRate] = useState("4.5");
  const [loanTenure, setLoanTenure] = useState("60");

  const loanAmount = parseFloat(price || "0") - parseFloat(downPayment || "0");

  const emi = calculateEMI(
    loanAmount,
    parseFloat(interestRate || "0"),
    parseInt(loanTenure || "1")
  );

  return (
    <Card className="max-w-md mx-auto mt-10 p-4">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Currency className="h-5 w-5 text-blue-600" /> EMI Calculator
        </div>

        <div className="grid gap-3 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Car Price (USD)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 120000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="downPayment">Down Payment (USD)</Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="e.g. 10000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              step="0.1"
              placeholder="e.g. 4.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanTenure">Loan Tenure (months)</Label>
            <Input
              id="loanTenure"
              type="number"
              value={loanTenure}
              onChange={(e) => setLoanTenure(e.target.value)}
              placeholder="e.g. 60"
            />
          </div>
        </div>

        <div className="text-gray-600 text-sm">
          Estimated Monthly Payment:
          <div className="text-xl font-bold text-blue-700">
            ${isNaN(emi) ? 0 : emi.toLocaleString()}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          * This is an estimate. Actual EMI may vary based on lender terms.
        </div>
      </CardContent>
    </Card>
  );
};

export default EMICalculator;
