
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
}

export async function processFile(filePath: string): Promise<ProcessedData> {
  // Parse the file data
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would read from the actual CSV file
      // For now, we'll use realistic mock data
      const mockCSVData: TransactionItem[] = [
        { 
          productId: "FS001", 
          productName: "Weather Preset Pack", 
          lever: "Flight Simulator Marketplace", 
          transactionDate: "2023-05-15", 
          transactionAmountUSD: 239.94 
        },
        { 
          productId: "FS002", 
          productName: "City Landmarks", 
          lever: "Flight Simulator Marketplace", 
          transactionDate: "2023-06-20", 
          transactionAmountUSD: 89.97 
        },
        { 
          productId: "FS003", 
          productName: "Livery Collection", 
          lever: "Microsoft Flight Simulator 2024", 
          transactionDate: "2023-06-25", 
          transactionAmountUSD: 124.95 
        },
        { 
          productId: "FS004", 
          productName: "Livery Collection", 
          lever: "Flight Simulator Marketplace", 
          transactionDate: "2023-07-10", 
          transactionAmountUSD: 149.95 
        }
      ];
      
      // Mock existing products - in real implementation this would come from DB_Products.json
      const existingProducts: ProductItem[] = [
        { productId: "FS001", productName: "Weather Preset Pack", date: "2023-05-15", isEcho: true },
        { productId: "FS004", productName: "Livery Collection", date: "2023-07-10", isEcho: false },
      ];
      
      // Process transaction data according to business rules
      let updatedProducts = [...existingProducts];
      
      mockCSVData.forEach(transaction => {
        // Skip rows missing productId or productName
        if (!transaction.productId || !transaction.productName) {
          return;
        }
        
        // Check if product exists
        const existingProduct = updatedProducts.find(p => p.productId === transaction.productId);
        
        if (!existingProduct) {
          // Create new product entry
          let newProductName = transaction.productName;
          
          // If lever contains "Microsoft Flight Simulator 2024" and a product with same name exists, append (2024)
          if (transaction.lever === "Microsoft Flight Simulator 2024") {
            const similarProduct = updatedProducts.find(p => 
              p.productName === transaction.productName && p.productId !== transaction.productId
            );
            
            if (similarProduct) {
              newProductName += " (2024)";
            }
          }
          
          const newProduct = {
            productId: transaction.productId,
            productName: newProductName,
            date: transaction.transactionDate,
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
