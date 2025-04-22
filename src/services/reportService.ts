import { ProductItem, TransactionItem } from './fileService';

export interface ReportItem {
  name: string;
  total: number;
  productId?: string;
}

export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  console.log("Generating report with filters:", { startDate, endDate, echoOnly });
  
  // First get the product dictionary
  const dictionary = await getProductDictionary();
  console.log("Dictionary loaded:", dictionary.length, "products");
  
  // Get transactions data
  const transactions = await getTransactions();
  console.log("Transactions loaded:", transactions.length, "transactions");
  
  // Filter transactions based on date range and other criteria
  const filteredTransactions = transactions.filter(transaction => {
    // Skip rows missing productId or productName
    if (!transaction.productId || !transaction.productName) {
      return false;
    }
    
    // Apply date filters if provided
    if (startDate && transaction.transactionDate < startDate) {
      return false;
    }
    if (endDate && transaction.transactionDate > endDate) {
      return false;
    }
    
    // If echoOnly is true, check if product is in Echo products
    if (echoOnly) {
      const product = dictionary.find(p => p.productId === transaction.productId);
      if (!product || !product.isEcho) {
        return false;
      }
    }
    
    return true;
  });
  
  console.log("Filtered transactions:", filteredTransactions.length);
  
  // Group transactions by productId and sum amounts
  const productTotals = new Map<string, { amount: number; name: string }>();
  
  filteredTransactions.forEach(transaction => {
    const key = transaction.productId;
    const currentEntry = productTotals.get(key) || { amount: 0, name: transaction.productName };
    
    // Ensure we're using the correct numeric value for the transaction amount
    const transactionAmount = typeof transaction.transactionAmountUSD === 'number' 
      ? transaction.transactionAmountUSD 
      : parseFloat(String(transaction.transactionAmountUSD).replace(/[^0-9.-]+/g, '')) || 0;
    
    currentEntry.amount += transactionAmount;
    
    // Get correct product name from dictionary if it exists (handles 2024 suffix)
    const dictProduct = dictionary.find(p => p.productId === transaction.productId);
    if (dictProduct) {
      currentEntry.name = dictProduct.productName;
    }
    
    productTotals.set(key, currentEntry);
  });
  
  console.log("Unique products after grouping:", productTotals.size);
  
  // Create report data
  const reportData: ReportItem[] = Array.from(productTotals.entries()).map(([productId, data]) => ({
    name: data.name,
    total: parseFloat(data.amount.toFixed(2)), // Ensure we have proper 2 decimal places
    productId
  }));
  
  // Sort by total in descending order
  reportData.sort((a, b) => b.total - a.total);
  
  console.log("Final report data items:", reportData.length);
  return reportData;
}

export async function getProductDictionary(): Promise<ProductItem[]> {
  // In a real implementation, this would fetch from DB_Products.json
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if we have stored products in localStorage
      const storedProducts = localStorage.getItem('productDictionary');
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          console.log("Loaded products from localStorage:", parsedProducts.length);
          resolve(parsedProducts);
          return;
        } catch (e) {
          console.error('Error parsing stored products:', e);
        }
      }
      
      // Fallback mock data
      const mockDictionary = [
        { productId: "FS001", productName: "Weather Preset Pack", date: "2023-05-15", isEcho: true },
        { productId: "FS002", productName: "City Landmarks", date: "2023-06-20", isEcho: false },
        { productId: "FS003", productName: "Livery Collection (2024)", date: "2023-06-25", isEcho: false },
        { productId: "FS004", productName: "Livery Collection", date: "2023-07-10", isEcho: false },
      ];
      
      console.log("Using fallback mock product dictionary");
      resolve(mockDictionary);
    }, 300); // Reduced timeout for better UX
  });
}

export async function getTransactions(): Promise<TransactionItem[]> {
  // In a real implementation, this would fetch from uploads/latest.csv
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if we have stored transactions in localStorage
      const storedTransactions = localStorage.getItem('processedTransactions');
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          console.log("Loaded transactions from localStorage:", parsedTransactions.length);
          resolve(parsedTransactions);
          return;
        } catch (e) {
          console.error('Error parsing stored transactions:', e);
        }
      }
      
      // Fallback mock data
      const mockTransactions = [
        { 
          productId: "FS001", 
          productName: "Weather Preset Pack", 
          lever: "Flight Simulator Marketplace", 
          transactionDate: "2023-05-15", 
          transactionAmountUSD: 239.94 
        },
        { 
          productId: "FS002", 
          productName: "City Landmarks", 
          lever: "Flight Simulator Marketplace", 
          transactionDate: "2023-06-20", 
          transactionAmountUSD: 89.97 
        },
        { 
          productId: "FS003", 
          productName: "Livery Collection", 
          lever: "Microsoft Flight Simulator 2024", 
          transactionDate: "2023-06-25", 
          transactionAmountUSD: 124.95 
        },
        { 
          productId: "FS004", 
          productName: "Livery Collection", 
          lever: "Flight Simulator Marketplace", 
          transactionDate: "2023-07-10", 
          transactionAmountUSD: 149.95 
        }
      ];
      
      console.log("Using fallback mock transactions");
      resolve(mockTransactions);
    }, 300); // Reduced timeout for better UX
  });
}

export async function saveProductDictionary(products: ProductItem[]): Promise<boolean> {
  // Simulate saving the product dictionary to DB_Products.json
  return new Promise((resolve) => {
    setTimeout(() => {
      // Also save echo products to DB_EchoProducts.json
      const echoProducts = products.filter(product => product.isEcho);
      console.log('Saving full products dictionary:', products);
      console.log('Saving echo products dictionary:', echoProducts);
      
      // Store in localStorage to simulate persistence
      localStorage.setItem('productDictionary', JSON.stringify(products));
      localStorage.setItem('echoProducts', JSON.stringify(echoProducts));
      
      resolve(true);
    }, 1000);
  });
}

export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Simulate updating the product dictionary with new data from CSV
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Updating product dictionary with processed CSV data:', processedData);
      
      // Store in localStorage to simulate persistence
      localStorage.setItem('productDictionary', JSON.stringify(processedData.products));
      localStorage.setItem('processedTransactions', JSON.stringify(processedData.transactions));
      
      resolve(true);
    }, 1000);
  });
}
