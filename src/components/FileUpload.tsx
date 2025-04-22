
import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { uploadFile } from '@/services/fileService';
import { toast } from 'sonner';

const FileUpload = () => {
  const { fileStatus, setFileStatus, setActiveSection, setUploadedFilePath } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploading(true);

    try {
      const response = await uploadFile(file);
      
      if (response.success) {
        setFileStatus('uploaded');
        if (response.filePath) {
          setUploadedFilePath(response.filePath);
        }
        toast.success('File uploaded successfully');
      } else {
        toast.error(response.message || 'Error uploading file');
      }
    } catch (error) {
      toast.error('Error uploading file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    // Trigger click on hidden file input
    fileInputRef.current?.click();
  };

  const handleReportClick = () => {
    if (fileStatus === 'processed') {
      setActiveSection('reports');
    } else {
      toast.info('Please process the file first before viewing reports');
    }
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Upload File</h2>
      
      {fileStatus === 'none' || fileStatus === 'uploaded' ? (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
          <Upload className="mb-3 text-gray-400" size={36} />
          
          <Button 
            variant="outline" 
            disabled={uploading}
            className="mb-2"
            onClick={handleButtonClick}
          >
            {uploading ? 'Uploading...' : 'Select Partner Center Export'}
          </Button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv,.zip" 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          <p className="text-sm text-gray-400 mt-2 text-center">
            Send here the Partner Center export (.csv or .zip)
          </p>
          
          {selectedFile && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-400 font-medium">
                {selectedFile.name} selected
              </p>
              <p className="text-xs text-gray-400">
                {fileStatus === 'uploaded' ? 'File uploaded. You can proceed' : ''}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
          <p className="text-green-400 font-medium mb-2">
            {fileStatus === 'processing' ? 'Processing...' : 'Processing concluded'}
          </p>
          
          {fileStatus === 'processed' && (
            <Button 
              variant="link"
              className="text-sm text-blue-400 cursor-pointer hover:underline"
              onClick={handleReportClick}
            >
              Click here to see report
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
