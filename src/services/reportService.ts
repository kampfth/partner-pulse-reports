
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
}

// Fetch transactions from Supabase
export async function getTransactions(): Promise<TransactionItem[]> {
  const { data, error } = await supabase
    .from(dbConfig.tables.transactions)
    .select('*');

  if (error) {
    console.error('Error fetching transactions from Supabase:', error);
    return [];
  }
  console.log(`Loaded ${data?.length || 0} transactions from database`);
  return data || [];
}

// Save product dictionary to Supabase
export async function saveProductDictionary(products: ProductItem[]): Promise<boolean> {
  console.log(`Saving ${products.length} products to database`);
  
  // Upsert (insert new and update existing)
  const { error } = await supabase
    .from(dbConfig.tables.products)
    .upsert(products, { onConflict: 'productId', ignoreDuplicates: false });

  if (error) {
    console.error('Error saving products to Supabase:', error);
    return false;
  }

  // Update echo_products table
  const echoProducts = products.filter(product => product.isEcho);
  if (echoProducts.length > 0) {
    console.log(`Saving ${echoProducts.length} echo products to database`);
    
    // First delete any echo products that are no longer marked as echo
    const echoProductIds = echoProducts.map(p => p.productId);
    
    // Remove all echo products not in the current list
    await supabase
      .from(dbConfig.tables.echoProducts)
      .delete()
      .not('productId', 'in', `(${echoProductIds.map(id => `'${id}'`).join(',')})`);
    
    // Then upsert current echo products
    const { error: echoError } = await supabase
      .from(dbConfig.tables.echoProducts)
      .upsert(
        echoProducts.map(p => ({
          productId: p.productId,
          productName: p.productName,
          date: p.date
        })),
        { onConflict: 'productId' }
      );
    
    if (echoError) {
      console.error('Error saving echo products to Supabase:', echoError);
      return false;
    }
  }

  return true;
}

// Save transactions to Supabase
export async function saveTransactions(transactions: TransactionItem[]): Promise<boolean> {
  console.log(`Saving ${transactions.length} transactions to database`);
  
  const { error } = await supabase
    .from(dbConfig.tables.transactions)
    .upsert(transactions, { onConflict: 'productId,transactionDate' });
  
  if (error) {
    console.error('Error saving transactions to Supabase:', error);
    return false;
  }
  
  return true;
}

// Update product dictionary and transactions when processing CSV
export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Get existing dictionary
  const existingDictionary = await getProductDictionary();
  const existingProductMap = new Map<string, ProductItem>();
  existingDictionary.forEach(product => {
    existingProductMap.set(product.productId, product);
  });
  
  // Merge existing products with new ones
  const mergedProducts: ProductItem[] = [...existingDictionary];

  // Add only NEW products
  processedData.products.forEach(newProduct => {
    if (!existingProductMap.has(newProduct.productId)) {
      mergedProducts.push(newProduct);
    }
  });

  // Save merged products and transactions
  const productsSaved = await saveProductDictionary(mergedProducts);
  const transactionsSaved = await saveTransactions(processedData.transactions);

  return productsSaved && transactionsSaved;
}

// Generate report from database
export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  console.log(`Generating report with filters: startDate=${startDate}, endDate=${endDate}, echoOnly=${echoOnly}`);
  
  // Get product dictionary
  const dictionary = await getProductDictionary();
  
  // Build transactions query
  let query = supabase.from(dbConfig.tables.transactions).select('*');
  
  // Apply date filters
  if (startDate) {
    query = query.gte('transactionDate', startDate);
  }
  if (endDate) {
    query = query.lte('transactionDate', endDate);
  }
  
  // Apply echo filter if needed
  if (echoOnly) {
    const echoIds = dictionary.filter(p => p.isEcho).map(p => p.productId);
    if (echoIds.length > 0) {
      query = query.in('productId', echoIds);
    } else {
      // If no echo products exist, return empty report
      console.log('No echo products found in dictionary, returning empty report');
      return [];
    }
  }
  
  // Execute query
  const { data: transactions, error } = await query;
  
  if (error) {
    console.error('Error fetching transactions for report:', error);
    return [];
  }
  
  console.log(`Loaded ${transactions?.length || 0} transactions for report`);
  
  // Process transactions to calculate report data
  const productTotals = new Map<string, { amount: number; name: string }>();
  
  (transactions || []).forEach(transaction => {
    if (!transaction.productId || !transaction.productName) return;
    
    const key = transaction.productId;
    const currentEntry = productTotals.get(key) || { amount: 0, name: transaction.productName };
    const transactionAmount = transaction.transactionAmount;
    
    currentEntry.amount += typeof transactionAmount === 'number'
      ? transactionAmount
      : parseFloat(String(transactionAmount).replace(/[^0-9.-]+/g, '')) || 0;

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
}
