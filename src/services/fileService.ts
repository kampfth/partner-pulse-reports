
export interface FileUploadResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

export async function uploadFile(file: File): Promise<FileUploadResponse> {
  // Simulate file upload process
  return new Promise((resolve) => {
    setTimeout(() => {
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
      
      resolve({
        success: true,
        message: 'File uploaded successfully',
        filePath
      });
    }, 1500);
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
  transactionAmountUSD: number;
  earningDate?: string;
}

// Helper function to parse CSV data - would be replaced by actual CSV parser in production
function parseCSVData(csvContent: string): TransactionItem[] {
  // For demo purposes, we'll simulate parsing CSV
  // In a real implementation, use a proper CSV parser library
  
  // Generate realistic data based on the provided CSV image
  const mockItems: TransactionItem[] = [
    {
      productId: "7403E8B-F1D6-437A-A3CE-0B26FC0700E",
      productName: "A320 v2 Europe",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-16",
      transactionAmountUSD: 100,
      earningDate: "2025-04-16"
    },
    {
      productId: "E31C520F-1855-453C-89E9-73C0A3598FD",
      productName: "Liveries Collection",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "A060DE58-D876-47EF-B1C2-42E0483045",
      productName: "A320 v2 North A",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "CEB7B6C-8065-4D96-911B-FACD45524F19",
      productName: "REALISTIC VFR",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-16",
      transactionAmountUSD: 100,
      earningDate: "2025-04-16"
    },
    {
      productId: "7403E8B-F1D6-437A-A3CE-0B26FC0700E",
      productName: "A320 v2 Europe",
      lever: "Microsoft Flight Simulator 2024",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "5091738E-339E-48AE-AA68-D4370D5F957",
      productName: "A320 v2 NA & E",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "F5F644FB-82EB-49C2-8BCD-260250D1908",
      productName: "Weather Preset",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "E31C520F-1855-453C-89E9-73C0A3598FD",
      productName: "Liveries Collection",
      lever: "Microsoft Flight Simulator 2024",
      transactionDate: "2025-04-16",
      transactionAmountUSD: 100,
      earningDate: "2025-04-16"
    },
    {
      productId: "8EC147BB-4ED7-42C2-80D2-58E8751B020F",
      productName: "Landing Rate",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-16",
      transactionAmountUSD: 100,
      earningDate: "2025-04-16"
    },
    {
      productId: "EBADF32B-2041-4A18-9330-F5E376B80476",
      productName: "B737 Max Amber",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "9CE7D5FD-2527-4E27-A530-1FD339AA6913",
      productName: "Enhanced Taxiw",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-16",
      transactionAmountUSD: 100,
      earningDate: "2025-04-16"
    },
    {
      productId: "C2040AC5-FB56-4711-8957-C7346087D043",
      productName: "A321LR America",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-16",
      transactionAmountUSD: 100,
      earningDate: "2025-04-16"
    },
    {
      productId: "745D37C4-526C-4E5A-A6E2-67C3618F9E09",
      productName: "A320 v2 South A",
      lever: "Microsoft Flight Simulator",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    },
    {
      productId: "DF2FAB05-5ABE-4793-98B3-6B224CC7B381",
      productName: "B737 Max Emer",
      lever: "Microsoft Flight Simulator 2024",
      transactionDate: "2025-04-17",
      transactionAmountUSD: 100,
      earningDate: "2025-04-17"
    }
  ];
  
  return mockItems;
}

export async function processFile(filePath: string): Promise<ProcessedData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would read from the actual CSV file
      // For now, we'll use realistic mock data to demonstrate the CSV processing logic
      
      // Simulate CSV parsing
      const csvContent = "mock csv content"; // In a real app, you'd read this from the file
      const transactions = parseCSVData(csvContent);
      
      // Process transaction data according to business rules
      let updatedProducts: ProductItem[] = [];
      const productMap = new Map<string, boolean>(); // Track product names to avoid duplicates
      
      transactions.forEach(transaction => {
        // Skip rows missing productId or productName
        if (!transaction.productId || !transaction.productName) {
          return;
        }
        
        // Clean date format (remove timezone part)
        const cleanDate = (dateStr: string) => {
          if (dateStr.includes('T')) {
            return dateStr.split('T')[0];
          }
          return dateStr;
        };
        
        let productName = transaction.productName;
        const productKey = `${transaction.productId}-${transaction.productName}`;
        
        // If lever is Microsoft Flight Simulator 2024, append (2024) to name
        if (transaction.lever === "Microsoft Flight Simulator 2024") {
          // Only add (2024) if there's not already a (2024) suffix and if the same product name exists in regular FS
          if (!productName.includes('(2024)')) {
            const productNameWithoutYear = productName;
            const regularFSProductExists = transactions.some(t => 
              t.productName === productNameWithoutYear && 
              t.lever !== "Microsoft Flight Simulator 2024" &&
              t.productId === transaction.productId
            );
            
            if (regularFSProductExists || productMap.has(productKey)) {
              productName = `${productName} (2024)`;
            }
          }
        }
        
        // Create or update product entry if it doesn't already exist
        const existingProductIndex = updatedProducts.findIndex(p => 
          p.productId === transaction.productId && 
          (p.productName === productName || p.productName === transaction.productName || 
           (transaction.lever === "Microsoft Flight Simulator 2024" && 
            p.productName === `${transaction.productName} (2024)`))
        );
        
        if (existingProductIndex === -1) {
          const cleanedEarningDate = transaction.earningDate ? cleanDate(transaction.earningDate) : cleanDate(transaction.transactionDate);
          
          const newProduct = {
            productId: transaction.productId,
            productName: productName,
            date: cleanedEarningDate,
            isEcho: false // Default new products to non-echo
          };
          
          updatedProducts.push(newProduct);
          productMap.set(productKey, true);
        }
      });
      
      // Save processed data to localStorage to simulate persistence
      localStorage.setItem('processedTransactions', JSON.stringify(transactions));
      localStorage.setItem('productDictionary', JSON.stringify(updatedProducts));
      
      resolve({
        products: updatedProducts,
        transactions
      });
    }, 2000);
  });
}
