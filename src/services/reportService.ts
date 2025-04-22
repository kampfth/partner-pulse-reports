
import { ProcessedData, TransactionItem, ProductItem } from './fileService';

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
  // First get the product dictionary
  const dictionary = await getProductDictionary();
  
  // Get transactions data
  const transactions = await getTransactions();
  
  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    if (startDate && transaction.transactionDate < startDate) {
      return false;
    }
    if (endDate && transaction.transactionDate > endDate) {
      return false;
    }
    return true;
  });
  
  // Group transactions by productId and sum amounts
  const productTotals = new Map<string, number>();
  
  filteredTransactions.forEach(transaction => {
    const currentTotal = productTotals.get(transaction.productId) || 0;
    productTotals.set(transaction.productId, currentTotal + transaction.transactionAmountUSD);
  });
  
  // Create report data
  const reportData: ReportItem[] = [];
  
  // Add product data to report
  dictionary.forEach(product => {
    // Skip non-echo products if echoOnly is true
    if (echoOnly && !product.isEcho) {
      return;
    }
    
    // Get total amount for this product
    const total = productTotals.get(product.productId) || 0;
    
    reportData.push({
      name: product.productName,
      total,
      productId: product.productId
    });
  });
  
  // Sort by total in descending order
  reportData.sort((a, b) => b.total - a.total);
  
  return reportData;
}

export async function getProductDictionary(): Promise<ProductItem[]> {
  // Simulate fetching the product dictionary from DB_Products.json
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockDictionary = [
        { productId: "P-123", productName: "Microsoft Flight Simulator 2024", date: "2023-05-15", isEcho: true },
        { productId: "P-456", productName: "Microsoft Office 365 Enterprise", date: "2022-11-03", isEcho: false },
        { productId: "P-789", productName: "Azure Cloud Services Premium", date: "2023-02-21", isEcho: true },
        { productId: "P-012", productName: "Windows 11 Pro", date: "2022-09-17", isEcho: false },
        { productId: "P-345", productName: "Microsoft Dynamics 365", date: "2023-01-09", isEcho: false },
      ];
      
      resolve(mockDictionary);
    }, 800);
  });
}

// New function to get transaction data
export async function getTransactions(): Promise<TransactionItem[]> {
  // Simulate fetching transaction data from uploads/latest.csv
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockTransactions = [
        { 
          productId: "P-123", 
          productName: "Microsoft Flight Simulator 2024", 
          lever: "Microsoft Flight Simulator", 
          transactionDate: "2023-05-15", 
          transactionAmountUSD: 1249.99 
        },
        { 
          productId: "P-456", 
          productName: "Microsoft Office 365 Enterprise", 
          lever: "Office", 
          transactionDate: "2022-11-03", 
          transactionAmountUSD: 899.50 
        },
        { 
          productId: "P-789", 
          productName: "Azure Cloud Services Premium", 
          lever: "Azure", 
          transactionDate: "2023-02-21", 
          transactionAmountUSD: 2543.75 
        },
        { 
          productId: "P-012", 
          productName: "Windows 11 Pro", 
          lever: "Windows", 
          transactionDate: "2022-09-17", 
          transactionAmountUSD: 321.00 
        },
        { 
          productId: "P-345", 
          productName: "Microsoft Dynamics 365", 
          lever: "Dynamics", 
          transactionDate: "2023-01-09", 
          transactionAmountUSD: 1652.25 
        },
      ];
      
      resolve(mockTransactions);
    }, 800);
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
      
      resolve(true);
    }, 1000);
  });
}

export async function updateProductFromCSV(processedData: ProcessedData): Promise<boolean> {
  // Simulate updating the product dictionary with new data from CSV
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Updating product dictionary with processed CSV data:', processedData);
      resolve(true);
    }, 1000);
  });
}
