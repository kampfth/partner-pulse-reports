
interface FileUploadResponse {
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

interface ProcessedData {
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
  // Simulate file processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate parsing CSV data
      const mockCSVData = [
        // Header line (would be skipped in real parsing)
        // "productId,productName,lever,transactionDate,transactionAmountUSD",
        
        // Mock data rows that would come from CSV
        { 
          productId: "P-123", 
          productName: "Microsoft Flight Simulator 2024", 
          lever: "Microsoft Flight Simulator", 
          transactionDate: "2023-05-15", 
          transactionAmountUSD: 1249.99 
        },
        { 
          productId: "P-456", 
          productName: "Microsoft Office 365 Enterprise", 
          lever: "Office", 
          transactionDate: "2022-11-03", 
          transactionAmountUSD: 899.50 
        },
        { 
          productId: "P-789", 
          productName: "Azure Cloud Services Premium", 
          lever: "Azure", 
          transactionDate: "2023-02-21", 
          transactionAmountUSD: 2543.75 
        },
        { 
          productId: "P-012", 
          productName: "Windows 11 Pro", 
          lever: "Windows", 
          transactionDate: "2022-09-17", 
          transactionAmountUSD: 321.00 
        },
        { 
          productId: "P-345", 
          productName: "Microsoft Dynamics 365", 
          lever: "Dynamics", 
          transactionDate: "2023-01-09", 
          transactionAmountUSD: 1652.25 
        },
      ];
      
      // Process transaction data according to business rules
      const existingProducts = [
        { productId: "P-123", productName: "Microsoft Flight Simulator 2024", date: "2023-05-15", isEcho: true },
        { productId: "P-789", productName: "Azure Cloud Services Premium", date: "2023-02-21", isEcho: true },
      ];
      
      // Add new products based on transactions
      let updatedProducts = [...existingProducts];
      
      mockCSVData.forEach(transaction => {
        // Check if product exists
        const existingProduct = updatedProducts.find(p => p.productId === transaction.productId);
        
        if (!existingProduct) {
          // Create new product entry
          const newProduct = {
            productId: transaction.productId,
            productName: transaction.productName,
            date: transaction.transactionDate,
            isEcho: false // Default new products to non-echo
          };
          
          // If lever contains "2024" and a product with same name exists, append (2024)
          if (transaction.lever.includes("2024")) {
            const similarProduct = updatedProducts.find(p => 
              p.productName === transaction.productName && !p.productName.includes("(2024)")
            );
            
            if (similarProduct) {
              newProduct.productName += " (2024)";
            }
          }
          
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

