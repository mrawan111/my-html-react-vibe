import { useState, useEffect } from 'react';

export interface FileEntry {
  id: string;
  routerNumber: string;
  quantity: number;
  remaining: number;
  fileName: string;
  caption: string;
  expiry: string;
  created: string;
  pdfBlob?: Blob;
  pdfUrl?: string;
}

const STORAGE_KEY = 'voucher-files';

export function useFiles() {
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    // Load files from localStorage on mount
    const storedFiles = localStorage.getItem(STORAGE_KEY);
    if (storedFiles) {
      try {
        const parsedFiles = JSON.parse(storedFiles);
        // Convert stored data back to FileEntry format
        const filesWithBlobs = parsedFiles.map((file: any) => ({
          ...file,
          pdfBlob: file.pdfUrl ? undefined : undefined, // We'll handle blob restoration separately
        }));
        setFiles(filesWithBlobs);
      } catch (error) {
        console.error('Error parsing stored files:', error);
      }
    }
  }, []);

 // In useFiles.ts, update the saveFilesToStorage function:

const saveFilesToStorage = (filesToSave: FileEntry[]) => {
  // Convert blobs to data URLs for storage
  const filesForStorage = filesToSave.map(file => {
    if (file.pdfBlob) {
      // Create a URL for the blob that we can store
      const pdfUrl = URL.createObjectURL(file.pdfBlob);
      return {
        ...file,
        pdfBlob: undefined,
        pdfUrl
      };
    }
    return file;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filesForStorage));
};

  const addFile = (file: Omit<FileEntry, 'id' | 'created'>) => {
    const newFile: FileEntry = {
      ...file,
      id: Date.now().toString(),
      created: new Date().toISOString().split('T')[0],
    };

    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);

    return newFile;
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
  };

  const updateFile = (id: string, updates: Partial<FileEntry>) => {
    const updatedFiles = files.map(file =>
      file.id === id ? { ...file, ...updates } : file
    );
    setFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
  };

  const getFileById = (id: string) => {
    return files.find(file => file.id === id);
  };

  return {
    files,
    addFile,
    removeFile,
    updateFile,
    getFileById,
  };
}
