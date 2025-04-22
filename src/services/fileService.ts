
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
      
      // Simulate saving the file to uploads/latest.csv
      const filePath = 'uploads/latest.csv';
      
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
  // This would normally parse the actual CSV file
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is just placeholder data - in a real implementation, 
      // this would come from parsing the actual CSV file
      const mockCSVData = [
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
      
      // Mock existing products - in real implementation this would come from DB_Products.json
      const existingProducts = [
        { productId: "PROD1", productName: "Sample Product 1", date: "2023-05-15", isEcho: true },
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
      
      resolve({
        products: updatedProducts,
        transactions: mockCSVData
      });
    }, 2000);
  });
}
