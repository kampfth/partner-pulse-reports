
export interface ReportItem {
  name: string;
  total: number;
  productId?: string;
}

export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  // First get the product dictionary
  const dictionary = await getProductDictionary();
  
  // Simulate API call to get report data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate report data based on the product dictionary
      const mockData: ReportItem[] = dictionary.map(product => ({
        name: product.productName,
        total: Math.random() * 10000 + 500, // Random sales amount between 500 and 10500
        productId: product.productId
      }));
      
      // Filter by echo if needed
      const filteredData = echoOnly 
        ? mockData.filter(item => {
            const dictProduct = dictionary.find(p => p.productId === item.productId);
            return dictProduct?.isEcho;
          })
        : mockData;
      
      resolve(filteredData);
    }, 1000);
  });
}

export async function getProductDictionary(): Promise<any[]> {
  // Simulate fetching the product dictionary
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockDictionary = [
        { productId: "P-123", productName: "Microsoft Flight Simulator 2024", date: "2023-05-15", isEcho: true },
        { productId: "P-456", productName: "Microsoft Office 365 Enterprise", date: "2022-11-03", isEcho: false },
        { productId: "P-789", productName: "Azure Cloud Services Premium", date: "2023-02-21", isEcho: true },
        { productId: "P-012", productName: "Windows 11 Pro", date: "2022-09-17", isEcho: false },
        { productId: "P-345", productName: "Microsoft Dynamics 365", date: "2023-01-09", isEcho: false },
      ];
      
      resolve(mockDictionary);
    }, 800);
  });
}

export async function saveProductDictionary(products: any[]): Promise<boolean> {
  // Simulate saving the product dictionary
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
}
