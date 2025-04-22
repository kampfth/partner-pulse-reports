
export interface ReportItem {
  name: string;
  total: number;
}

export async function generateReport(
  startDate?: string,
  endDate?: string,
  echoOnly?: boolean
): Promise<ReportItem[]> {
  // Simulate API call to get report data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ReportItem[] = [
        { name: "Microsoft Flight Simulator 2024", total: 15249.99 },
        { name: "Microsoft Office 365 Enterprise", total: 8732.50 },
        { name: "Azure Cloud Services Premium", total: 6543.75 },
        { name: "Windows 11 Pro", total: 4321.00 },
        { name: "Microsoft Dynamics 365", total: 3652.25 },
        { name: "Visual Studio Enterprise", total: 2987.99 },
        { name: "Microsoft Teams Premium", total: 1876.50 },
        { name: "Xbox Game Pass Ultimate", total: 1543.25 },
        { name: "Microsoft Power BI Pro", total: 987.75 },
        { name: "Microsoft Surface Pro 9", total: 876.50 },
      ];
      
      resolve(mockData);
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
