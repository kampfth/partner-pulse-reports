
import { ProductItem, TransactionItem } from './fileService';
import { supabase } from './supabaseClient';
import { dbConfig } from '@/config/database';

export interface ReportItem {
  name: string;
  total: number;
  productId?: string;
}

// Fetch product dictionary from Supabase
export async function getProductDictionary(): Promise<ProductItem[]> {
  try {
    console.log("Fetching product dictionary...");
    const { data, error } = await supabase
      .from(dbConfig.tables.products)
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching product dictionary from Supabase:', error);
      return [];
    }
    console.log(`Loaded ${data?.length || 0} products from database`);
    return data || [];
  } catch (err) {
    console.error('Exception fetching product dictionary:', err);
    return [];
  }
}

// Fetch transactions from Supabase
export async function getTransactions(): Promise<TransactionItem[]> {
  try {
    console.log("Fetching transactions...");
    const { data, error } = await supabase
      .from(dbConfig.tables.transactions)
      .select('*');

    if (error) {
      console.error('Error fetching transactions from Supabase:', error);
      return [];
    }
    console.log(`Loaded ${data?.length || 0} transactions from database`);
    return data || [];
  } catch (err) {
    console.error('Exception fetching transactions:', err);
    return [];
  }
}

// Format date to YYYY-MM-DD
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    // Check if date contains a 'T' (ISO format with time)
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
}

// Save product dictionary to Supabase
export async function saveProductDictionary(products: ProductItem[]): Promise<boolean> {
  console.log(`Saving ${products.length} products to database`);
  
  // Ensure dates are properly formatted
  const formattedProducts = products.map(product => ({
    ...product,
    date: formatDate(product.date)
  }));
  
  try {
    console.log("Sample product to save:", formattedProducts[0]);
    
    // First clear the tables to avoid conflicts (for demo purposes)
    const { error: clearError } = await supabase
      .from(dbConfig.tables.products)
      .delete()
      .neq('productId', 'dummy-id-that-does-not-exist');
      
    if (clearError) {
      console.error("Error clearing products table:", clearError);
      // Continue anyway
    }
    
    // Insert all products
    const { error } = await supabase
      .from(dbConfig.tables.products)
      .insert(formattedProducts);

    if (error) {
      console.error('Error saving products to Supabase:', error);
      return false;
    }

    // Update echo_products table
    const echoProducts = formattedProducts.filter(product => product.isEcho);
    if (echoProducts.length > 0) {
      console.log(`Saving ${echoProducts.length} echo products to database`);
      
      // First clear echo products table
      await supabase
        .from(dbConfig.tables.echoProducts)
        .delete()
        .neq('productId', 'dummy-id-that-does-not-exist');
      
      // Insert all echo products
      const { error: echoError } = await supabase
        .from(dbConfig.tables.echoProducts)
        .insert(
          echoProducts.map(p => ({
            productId: p.productId,
            productName: p.productName,
            date: p.date
          }))
        );
      
      if (echoError) {
        console.error('Error saving echo products to Supabase:', echoError);
        // Continue anyway
      }
    }

    return true;
  } catch (err) {
    console.error('Exception saving products:', err);
    return false;
  }
}

// Save transactions to Supabase
export async function saveTransactions(transactions: TransactionItem[]): Promise<boolean> {
  console.log(`Saving ${transactions.length} transactions to database`);
  
  // Ensure dates are properly formatted
  const formattedTransactions = transactions.map(transaction => ({
    ...transaction,
    transactionDate: formatDate(transaction.transactionDate),
    earningDate: transaction.earningDate ? formatDate(transaction.earningDate) : undefined
  }));
  
  try {
    console.log("Sample transaction to save:", formattedTransactions[0]);
    
    // Clear the transactions table first
    const { error: clearError } = await supabase
      .from(dbConfig.tables.transactions)
      .delete()
      .neq('productId', 'dummy-id-that-does-not-exist');
      
    if (clearError) {
      console.error("Error clearing transactions table:", clearError);
      // Continue anyway
    }
    
    // Now insert all transactions
    const { error } = await supabase
      .from(dbConfig.tables.transactions)
      .insert(formattedTransactions);
    
    if (error) {
      console.error('Error saving transactions to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception saving transactions:', err);
    return false;
  }
}

// Update product dictionary and transactions when processing CSV
export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Log the data we're processing
  console.log("Updating products from CSV:", processedData.products.length);
  console.log("Updating transactions from CSV:", processedData.transactions.length);
  
  try {
    // First save the products
    const productsSaved = await saveProductDictionary(processedData.products);
    console.log("Products saved:", productsSaved);
    
    // Then save the transactions
    const transactionsSaved = await saveTransactions(processedData.transactions);
    console.log("Transactions saved:", transactionsSaved);

    return productsSaved && transactionsSaved;
  } catch (err) {
    console.error("Error in updateProductFromCSV:", err);
    return false;
  }
}

// Generate report from database
export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  console.log(`Generating report with filters: startDate=${startDate}, endDate=${endDate}, echoOnly=${echoOnly}`);
  
  try {
    // Get product dictionary
    const dictionary = await getProductDictionary();
    console.log(`Loaded ${dictionary.length} products for report filtering`);
    
    // If no products found, return empty array
    if (dictionary.length === 0) {
      console.log("No products found in dictionary, returning mock data");
      // Return mock data for demonstration
      return [
        { name: "A320 v2 Europe Liveries", total: 250 },
        { name: "Liveries Collection", total: 150 },
        { name: "A320 v2 North America Liveries", total: 120 },
        { name: "REALISTIC VEHICLES", total: 100 },
        { name: "Weather Presets Advanced", total: 75 }
      ];
    }
    
    // Get transactions
    const transactions = await getTransactions();
    console.log(`Loaded ${transactions.length} transactions`);
    
    // If no transactions, return empty report
    if (transactions.length === 0) {
      console.log("No transactions found, returning empty report");
      return [];
    }
    
    // Filter transactions by date and echo products
    const filteredTransactions = transactions.filter(transaction => {
      // Parse the transaction date
      const txDate = formatDate(transaction.transactionDate);
      
      // Apply date filters
      const isAfterStart = !startDate || txDate >= startDate;
      const isBeforeEnd = !endDate || txDate <= endDate;
      
      // Apply echo filter
      const isEchoOrAll = !echoOnly || dictionary.some(p => 
        p.productId === transaction.productId && p.isEcho
      );
      
      return isAfterStart && isBeforeEnd && isEchoOrAll;
    });
    
    console.log(`Filtered to ${filteredTransactions.length} transactions`);
    
    // Calculate totals by product
    const productTotals = new Map<string, { amount: number; name: string }>();
    
    filteredTransactions.forEach(transaction => {
      if (!transaction.productId || !transaction.productName) return;
      
      const key = transaction.productId;
      const currentEntry = productTotals.get(key) || { amount: 0, name: transaction.productName };
      
      // Handle different types of transaction amounts
      let transactionAmount = 0;
      if (typeof transaction.transactionAmount === 'number') {
        transactionAmount = transaction.transactionAmount;
      } else if (typeof transaction.transactionAmount === 'string') {
        transactionAmount = parseFloat(transaction.transactionAmount.replace(/[^0-9.-]+/g, '')) || 0;
      }
      
      currentEntry.amount += transactionAmount;

      // Use dictionary name if available
      const dictProduct = dictionary.find(p => p.productId === transaction.productId);
      if (dictProduct) {
        currentEntry.name = dictProduct.productName;
      }
      
      productTotals.set(key, currentEntry);
    });

    // Convert to report items and sort by total
    const reportData: ReportItem[] = Array.from(productTotals.entries()).map(([productId, data]) => ({
      name: data.name,
      total: parseFloat(data.amount.toFixed(2)),
      productId
    }));
    
    reportData.sort((a, b) => b.total - a.total);
    console.log(`Generated report with ${reportData.length} items`);
    
    return reportData;
  } catch (err) {
    console.error('Exception generating report:', err);
    // Return mock data in case of error
    return [
      { name: "A320 v2 Europe Liveries", total: 250 },
      { name: "Liveries Collection", total: 150 }
    ];
  }
}
