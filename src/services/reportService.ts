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
  // First get the product dictionary
  const dictionary = await getProductDictionary();
  
  // Get transactions data
  const transactions = await getTransactions();
  
  // Filter transactions based on date range
  const filteredTransactions = transactions.filter(transaction => {
    // Skip rows missing productId or productName
    if (!transaction.productId || !transaction.productName) {
      return false;
    }
    
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
  // In a real implementation, this would fetch from DB_Products.json
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is just placeholder data
      const mockDictionary = [
        { productId: "PROD1", productName: "Sample Product 1", date: "2023-05-15", isEcho: true },
        { productId: "PROD2", productName: "Sample Product 2", date: "2023-06-20", isEcho: false },
      ];
      
      resolve(mockDictionary);
    }, 800);
  });
}

export async function getTransactions(): Promise<TransactionItem[]> {
  // In a real implementation, this would fetch from uploads/latest.csv
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is just placeholder data
      const mockTransactions = [
        { 
          productId: "PROD1", 
          productName: "Sample Product 1", 
          lever: "Sample Category", 
          transactionDate: "2023-05-15", 
          transactionAmountUSD: 150.00 
        },
        { 
          productId: "PROD2", 
          productName: "Sample Product 2", 
          lever: "Microsoft Flight Simulator 2024", 
          transactionDate: "2023-06-20", 
          transactionAmountUSD: 75.50 
        }
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

export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Simulate updating the product dictionary with new data from CSV
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Updating product dictionary with processed CSV data:', processedData);
      resolve(true);
    }, 1000);
  });
}
