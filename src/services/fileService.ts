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

export async function processFile(filePath: string): Promise<ProcessedData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would read from the actual CSV file
      // For now, we'll use realistic mock data to demonstrate the CSV processing logic
      const mockCSVData: TransactionItem[] = [
        { 
          productId: "59FFGY-F28HVF2", // Column 1AG
          productName: "Weather Pack", // Column 1AF
          lever: "Microsoft Flight Simulator 2024", // Column M1
          transactionDate: "2025-04-16", // Column I1 (cleaned date)
          transactionAmountUSD: 239.94, // Column K1
          earningDate: "2025-04-16" // Column U1 (cleaned date)
        },
        { 
          productId: "XKHY78-P23MNB4",
          productName: "Weather Pack",
          lever: "Flight Simulator Marketplace",
          transactionDate: "2025-04-16",
          transactionAmountUSD: 89.97,
          earningDate: "2025-04-16"
        }
      ];
      
      // Process transaction data according to business rules
      let updatedProducts: ProductItem[] = [];
      
      mockCSVData.forEach(transaction => {
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
        
        // If lever is Microsoft Flight Simulator 2024, append (2024) to name
        if (transaction.lever === "Microsoft Flight Simulator 2024") {
          const existingProduct = updatedProducts.find(p => 
            p.productName === transaction.productName && 
            !p.productName.includes('(2024)')
          );
          
          if (existingProduct || updatedProducts.some(p => p.productName === productName)) {
            productName += " (2024)";
          }
        }
        
        // Create or update product entry
        const existingProduct = updatedProducts.find(p => p.productId === transaction.productId);
        
        if (!existingProduct) {
          const newProduct = {
            productId: transaction.productId,
            productName: productName,
            date: cleanDate(transaction.earningDate), // Use earning date from column U1
            isEcho: false // Default new products to non-echo
          };
          
          updatedProducts.push(newProduct);
        }
      });
      
      // Save processed data to localStorage to simulate persistence
      localStorage.setItem('processedTransactions', JSON.stringify(mockCSVData));
      localStorage.setItem('productDictionary', JSON.stringify(updatedProducts));
      
      resolve({
        products: updatedProducts,
        transactions: mockCSVData
      });
    }, 2000);
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
}
