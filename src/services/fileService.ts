
interface FileUploadResponse {
  success: boolean;
  message: string;
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
      
      resolve({
        success: true,
        message: 'File uploaded successfully'
      });
    }, 1500);
  });
}

export async function processFile(): Promise<{ success: boolean }> {
  // Simulate file processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 2000);
  });
}
