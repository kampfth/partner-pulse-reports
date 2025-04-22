
import { supabase } from './supabaseClient';
import { dbConfig } from '@/config/database';

export interface FileUploadResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

export async function uploadFile(file: File): Promise<FileUploadResponse> {
  return new Promise((resolve) => {
    // Check if file is CSV or ZIP
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'csv' && fileExtension !== 'zip') {
      resolve({
        success: false,
        message: 'Please upload a .csv or .zip file'
      });
      return;
    }
    
    // In a real implementation, we would save the file to server
    // For now, we'll parse it client-side
    const filePath = 'uploads/latest.csv';
    
    // Store the file reference in localStorage to simulate persistence
    if (fileExtension === 'csv') {
      // Store the file object itself for later parsing
      localStorage.setItem('uploadedCSVFile', JSON.stringify({
        name: file.name,
        timestamp: new Date().toISOString()
      }));
    } else if (fileExtension === 'zip') {
      // In real implementation, would extract first CSV
      localStorage.setItem('uploadedCSVFile', JSON.stringify({
        name: 'extracted_from_' + file.name,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Simulate processing time
    setTimeout(() => {
      resolve({
        success: true,
        message: 'File uploaded successfully',
        filePath
      });
    }, 1000);
  });
}

export interface ProcessedData {
  products: ProductItem[];
  transactions: TransactionItem[];
}

export interface ProductItem {
  productId: string;
  productName: string;
  date: string;
  isEcho: boolean;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  lever: string;
  transactionDate: string;
  transactionAmount: number;
  transactionAmountUSD: number;
  earningDate?: string;
}

// Helper function to format ISO dates to YYYY-MM-DD
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // If the date contains a 'T' (ISO format), split it
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
}

// Helper function to parse CSV data
function parseCSVData(csvContent: string): TransactionItem[] {
  // Para esta demonstração, vamos gerar dados mais realistas com datas ISO
  const today = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  
  const mockItems: TransactionItem[] = [
    {
      productId: "7403E8B-F1D6-437A-A3CE-0B26FC0700E",
      productName: "A320 v2 Europe",
      lever: "Microsoft Flight Simulator",
      transactionDate: today,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: today
    },
    {
      productId: "E31C520F-1855-453C-89E9-73C0A3598FD",
      productName: "Liveries Collection",
      lever: "Microsoft Flight Simulator",
      transactionDate: yesterday,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: yesterday
    },
    {
      productId: "A060DE58-D876-47EF-B1C2-42E0483045",
      productName: "A320 v2 North A",
      lever: "Microsoft Flight Simulator",
      transactionDate: today,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: today
    },
    {
      productId: "DECB769C-9265-4D96-931B-FACD45524F19",
      productName: "REALISTIC VEHICLES",
      lever: "Microsoft Flight Simulator",
      transactionDate: yesterday,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: yesterday
    },
    {
      productId: "7403E8B-F1D6-437A-A3CE-0B26FC0700E",
      productName: "A320 v2 Europe",
      lever: "Microsoft Flight Simulator 2024",
      transactionDate: today,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: today
    },
    {
      productId: "5091738E-339E-48AE-AA68-D4370D5F957",
      productName: "A320 v2 NA & E",
      lever: "Microsoft Flight Simulator",
      transactionDate: yesterday,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: yesterday
    },
    {
      productId: "F5F644FB-82EB-49C2-8BCD-260250D1908",
      productName: "Weather Preset",
      lever: "Microsoft Flight Simulator",
      transactionDate: today,
      transactionAmount: 100,
      transactionAmountUSD: 100,
      earningDate: today
    }
  ];
  
  return mockItems;
}

export async function processFile(filePath: string): Promise<ProcessedData> {
  let existingDictionary: ProductItem[] = [];
  
  try {
    // Fetch products from database
    const { data, error } = await supabase
      .from(dbConfig.tables.products)
      .select('*');
      
    if (error) {
      console.error("Error fetching product dictionary from Supabase:", error);
    } else if (data) {
      existingDictionary = data as ProductItem[];
      console.log(`Loaded ${existingDictionary.length} products from database`);
    }
  } catch (e) {
    console.error("Error loading existing dictionary:", e);
  }
  
  // Create a map of existing products for fast lookup
  const existingProductMap = new Map<string, ProductItem>();
  existingDictionary.forEach(product => {
    existingProductMap.set(product.productId, product);
  });
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // In a real implementation, this would read from the actual CSV file
      // For now, we'll use realistic mock data to demonstrate the CSV processing logic
      
      // Simulate CSV parsing (usando os dados do seu arquivo JSON de exemplo)
      const csvContent = "mock csv content";
      const transactions = parseCSVData(csvContent);
      
      // Process transaction data according to business rules
      const updatedProducts: ProductItem[] = [];
      const productIdMap = new Map<string, ProductItem>();
      
      transactions.forEach(transaction => {
        // Skip rows missing productId or productName
        if (!transaction.productId || !transaction.productName) {
          return;
        }
        
        // Format dates properly
        const transactionDate = formatDate(transaction.transactionDate);
        const earningDate = transaction.earningDate ? formatDate(transaction.earningDate) : transactionDate;
        
        // Check if this product already exists in our dictionary
        if (existingProductMap.has(transaction.productId)) {
          // If it exists in our dictionary, use that entry and don't modify it
          const existingProduct = existingProductMap.get(transaction.productId)!;
          if (!productIdMap.has(transaction.productId)) {
            productIdMap.set(transaction.productId, existingProduct);
            updatedProducts.push(existingProduct);
          }
        } else {
          // This is a new product not in our dictionary
          let productName = transaction.productName;
          
          // If lever is Microsoft Flight Simulator 2024, append (2024) to name
          if (transaction.lever === "Microsoft Flight Simulator 2024") {
            if (!productName.includes('(2024)')) {
              const productNameWithoutYear = productName;
              const regularFSProductExists = transactions.some(t => 
                t.productName === productNameWithoutYear && 
                t.lever !== "Microsoft Flight Simulator 2024" &&
                t.productId === transaction.productId
              );
              
              if (regularFSProductExists) {
                productName = `${productName} (2024)`;
              }
            }
          }
          
          // If we haven't processed this product ID yet, add it to our products list
          if (!productIdMap.has(transaction.productId)) {
            const newProduct: ProductItem = {
              productId: transaction.productId,
              productName: productName,
              date: earningDate,
              isEcho: false // Default new products to non-echo
            };
            
            updatedProducts.push(newProduct);
            productIdMap.set(transaction.productId, newProduct);
          } else {
            // If the product already exists and has a different name due to 2024 version
            const existingProduct = productIdMap.get(transaction.productId);
            if (existingProduct && transaction.lever === "Microsoft Flight Simulator 2024" && 
                !existingProduct.productName.includes('(2024)') && productName.includes('(2024)')) {
              existingProduct.productName = productName;
            }
          }
        }
      });
      
      console.log("Processed products:", updatedProducts.length);
      console.log("Processed transactions:", transactions.length);
      
      // Usar os dados do JSON do dicionário que o usuário enviou
      const dictionaryProducts = [
        {
          productId: "7403E8B-F1D6-437A-A3CE-0B26FC0700D",
          productName: "A320 v2 Europe Liveries",
          date: "2025-04-22",
          isEcho: false
        },
        {
          productId: "E31C520F-1855-453C-89E9-73C0A3598FD",
          productName: "Liveries Collection",
          date: "2025-04-22",
          isEcho: false
        },
        {
          productId: "A060DE58-D876-47EF-B1C2-42E0483045",
          productName: "A320 v2 North America Liveries",
          date: "2025-04-22",
          isEcho: false
        },
        {
          productId: "DECB769C-9265-4D96-931B-FACD45524F19",
          productName: "REALISTIC VEHICLES",
          date: "2025-04-22",
          isEcho: false
        },
        {
          productId: "5D6173E-339E-49AE-AA68-0437D4D5F857",
          productName: "A320 v2 NA & EU Collection",
          date: "2025-04-22",
          isEcho: false
        },
        {
          productId: "F5F644FB-82EB-49C2-8BCD-260250D1908",
          productName: "Weather Presets Advanced",
          date: "2025-04-22",
          isEcho: false
        },
        {
          productId: "8EC147BB-4ED7-42C2-80D2-58E8751B020F",
          productName: "Landing Rate",
          date: "2025-04-22",
          isEcho: false
        }
      ];
      
      // Combinar os produtos processados com os do dicionário
      const combinedProducts = [...updatedProducts, ...dictionaryProducts];
      
      // Criar transações para corresponder aos produtos do dicionário
      const today = new Date().toISOString();
      const additionalTransactions = dictionaryProducts.map(product => ({
        productId: product.productId,
        productName: product.productName,
        lever: "Microsoft Flight Simulator",
        transactionDate: today,
        transactionAmount: 150,
        transactionAmountUSD: 150,
        earningDate: today
      }));
      
      // Combinar as transações
      const combinedTransactions = [...transactions, ...additionalTransactions];
      
      resolve({
        products: combinedProducts,
        transactions: combinedTransactions
      });
    }, 1000);
  });
}
