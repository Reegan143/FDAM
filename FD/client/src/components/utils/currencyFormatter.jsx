export const formatCurrency = (amount, currency = "USD") => {
    if (isNaN(amount) || amount === null) return "N/A"; // Handle invalid values
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  