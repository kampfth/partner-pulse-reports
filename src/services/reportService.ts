
// Utilizando Supabase ao invés de localStorage

import { ProductItem, TransactionItem } from './fileService';
import { supabase } from './supabaseClient';

export interface ReportItem {
  name: string;
  total: number;
  productId?: string;
}

// Buscar dicionário de produtos do Supabase
export async function getProductDictionary(): Promise<ProductItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar dicionário de produtos do Supabase:', error);
    return [];
  }
  return data || [];
}

// Buscar transações do Supabase
export async function getTransactions(): Promise<TransactionItem[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');

  if (error) {
    console.error('Erro ao buscar transações do Supabase:', error);
    return [];
  }
  return data || [];
}

// Salvar dicionário de produtos no Supabase
export async function saveProductDictionary(products: ProductItem[]): Promise<boolean> {
  // Upsert (inseri novos e atualiza existentes)
  const { error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'productId', ignoreDuplicates: false });

  // Atualiza tabela de echoProducts
  const echoProducts = products.filter(product => product.isEcho);
  if (echoProducts.length > 0) {
    // Coloque sua lógica aqui se desejar manter uma tabela separada, exemplo: "echo_products"
    await supabase.from('echo_products').upsert(echoProducts, { onConflict: 'productId' });
  }

  return !error;
}

// Salvar transações (substituindo ou inserindo)
export async function saveTransactions(transactions: TransactionItem[]): Promise<boolean> {
  const { error } = await supabase
    .from('transactions')
    .upsert(transactions, { onConflict: 'productId,transactionDate' });
  return !error;
}

// Atualiza dicionário de produtos e transactions ao processar CSV
export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Pega dicionário existente
  const existingDictionary = await getProductDictionary();
  const existingProductMap = new Map<string, ProductItem>();
  existingDictionary.forEach(product => {
    existingProductMap.set(product.productId, product);
  });
  const mergedProducts: ProductItem[] = [...existingDictionary];

  // Adiciona só produtos NOVOS
  processedData.products.forEach(newProduct => {
    if (!existingProductMap.has(newProduct.productId)) {
      mergedProducts.push(newProduct);
    }
  });

  await saveProductDictionary(mergedProducts);
  await saveTransactions(processedData.transactions);

  return true;
}

// Geração do relatório
export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  const dictionary = await getProductDictionary();
  let transactions = await getTransactions();

  // Filtrar conforme data e echoOnly
  if (startDate) {
    transactions = transactions.filter(t => t.transactionDate >= startDate);
  }
  if (endDate) {
    transactions = transactions.filter(t => t.transactionDate <= endDate);
  }
  if (echoOnly) {
    const echoIds = dictionary.filter(p => p.isEcho).map(p => p.productId);
    transactions = transactions.filter(t => echoIds.includes(t.productId));
  }

  const productTotals = new Map<string, { amount: number; name: string }>();
  transactions.forEach(transaction => {
    if (!transaction.productId || !transaction.productName) return;
    const key = transaction.productId;
    const currentEntry = productTotals.get(key) || { amount: 0, name: transaction.productName };
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

  const reportData: ReportItem[] = Array.from(productTotals.entries()).map(([productId, data]) => ({
    name: data.name,
    total: parseFloat(data.amount.toFixed(2)),
    productId
  }));
  reportData.sort((a, b) => b.total - a.total);

  return reportData;
}
