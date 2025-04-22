
import { ProductItem, TransactionItem } from './fileService';

export interface ReportItem {
  name: string;
  total: number;
  productId?: string;
}

// AGORA, NUNCA MAIS USAR PLACEHOLDER OU MOCK. SÓ USAR DADOS REAIS DO LOCALSTORAGE
export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  console.log("Generating report with filters:", { startDate, endDate, echoOnly });

  // Sempre pegar dicionário real e transações reais do localStorage
  const dictionary = await getProductDictionary();
  const transactions = await getTransactions();

  // Filtrar normalmente
  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction.productId || !transaction.productName) {
      return false;
    }
    if (startDate && transaction.transactionDate < startDate) {
      return false;
    }
    if (endDate && transaction.transactionDate > endDate) {
      return false;
    }
    if (echoOnly) {
      const product = dictionary.find(p => p.productId === transaction.productId);
      if (!product || !product.isEcho) {
        return false;
      }
    }
    return true;
  });

  const productTotals = new Map<string, { amount: number; name: string }>();
  filteredTransactions.forEach(transaction => {
    const key = transaction.productId;
    const currentEntry = productTotals.get(key) || { amount: 0, name: transaction.productName };
    // SOMA USANDO transactionAmount
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

export async function getProductDictionary(): Promise<ProductItem[]> {
  return new Promise((resolve) => {
    const storedProducts = localStorage.getItem('productDictionary');
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        resolve(parsedProducts);
        return;
      } catch (e) {
        console.error('Error parsing stored products:', e);
      }
    }
    // SEM PLACEHOLDER! Retornar sempre array vazio caso não tiver nada.
    resolve([]);
  });
}

export async function getTransactions(): Promise<TransactionItem[]> {
  return new Promise((resolve) => {
    const storedTransactions = localStorage.getItem('processedTransactions');
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        resolve(parsedTransactions);
        return;
      } catch (e) {
        console.error('Error parsing stored transactions:', e);
      }
    }
    // SEM PLACEHOLDER! Retornar sempre array vazio caso não tiver nada.
    resolve([]);
  });
}

// Ao salvar o dicionário, só altera localStorage
export async function saveProductDictionary(products: ProductItem[]): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const echoProducts = products.filter(product => product.isEcho);
      localStorage.setItem('productDictionary', JSON.stringify(products));
      localStorage.setItem('echoProducts', JSON.stringify(echoProducts));
      resolve(true);
    }, 500);
  });
}

// Ao processar CSV, NUNCA mais sobrescrever produtos existentes, só adiciona novos produtos se achou no csv
export async function updateProductFromCSV(processedData: { products: ProductItem[], transactions: TransactionItem[] }): Promise<boolean> {
  // Pega dicionário existente
  const existingDictionary = await getProductDictionary();
  return new Promise((resolve) => {
    setTimeout(() => {
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

      localStorage.setItem('productDictionary', JSON.stringify(mergedProducts));
      if (processedData.transactions && Array.isArray(processedData.transactions)) {
        localStorage.setItem('processedTransactions', JSON.stringify(processedData.transactions));
      }
      resolve(true);
    }, 500);
  });
}
