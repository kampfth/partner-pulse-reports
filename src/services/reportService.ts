
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
  
  const productTotals = new Map<string, { amount: number; name: string }>();
  
  filteredTransactions.forEach(transaction => {
    const key = transaction.productId;
    const currentEntry = productTotals.get(key) || { amount: 0, name: transaction.productName };
    
    // USE SPECIFICALLY transactionAmount FOR CALCULATION
    const transactionAmount = transaction.transactionAmount;
    
    currentEntry.amount += typeof transactionAmount === 'number' 
      ? transactionAmount 
      : parseFloat(String(transactionAmount).replace(/[^0-9.-]+/g, '')) || 0;
    
    const dictProduct = dictionary.find(p => p.productId === transaction.productId);
    if (dictProduct) {
      currentEntry.name = dictProduct.productName;
    }
    
    productTotals.set(key, currentEntry);
  });
  
  console.log("Unique products after grouping:", productTotals.size);
  
  const reportData: ReportItem[] = Array.from(productTotals.entries()).map(([productId, data]) => ({
    name: data.name,
    total: parseFloat(data.amount.toFixed(2)),
    productId
  }));
  
  reportData.sort((a, b) => b.total - a.total);
  
  console.log("Final report data items:", reportData.length);
  return reportData;
}

export async function getProductDictionary(): Promise<ProductItem[]> {
  return new Promise((resolve) => {
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
    
    // No fallback mock data - return empty array instead
    console.log("No product dictionary found in localStorage, returning empty array");
    resolve([]);
  });
}

export async function getTransactions(): Promise<TransactionItem[]> {
  return new Promise((resolve) => {
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
    
    // No fallback mock data - return empty array
    console.log("No transactions found in localStorage, returning empty array");
    resolve([]);
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
    }, 500);
  });
}

export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Get existing product dictionary first
  const existingDictionary = await getProductDictionary();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Updating product dictionary with processed CSV data');
      console.log('Existing dictionary items:', existingDictionary.length);
      console.log('New products from CSV:', processedData.products.length);
      
      // Create a map of existing products for fast lookup
      const existingProductMap = new Map<string, ProductItem>();
      existingDictionary.forEach(product => {
        existingProductMap.set(product.productId, product);
      });
      
      // Merge new products with existing ones (preserving existing entries)
      const mergedProducts: ProductItem[] = [...existingDictionary];
      
      // Only add new products that don't exist in the dictionary
      processedData.products.forEach(newProduct => {
        if (!existingProductMap.has(newProduct.productId)) {
          mergedProducts.push(newProduct);
        }
      });
      
      console.log('Merged dictionary size:', mergedProducts.length);
      
      // Store the merged products
      localStorage.setItem('productDictionary', JSON.stringify(mergedProducts));
      
      // Still store all transactions as before
      if (processedData.transactions && Array.isArray(processedData.transactions)) {
        localStorage.setItem('processedTransactions', JSON.stringify(processedData.transactions));
      }
      
      resolve(true);
    }, 500);
  });
}
