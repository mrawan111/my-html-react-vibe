import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useFiles() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('voucher_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      // Map database fields to FileEntry interface
      const mappedFiles: FileEntry[] = (data || []).map(file => ({
        id: file.id,
        routerNumber: file.router_number || '',
        quantity: file.quantity || 0,
        remaining: file.remaining || 0,
        fileName: file.name,
        caption: file.description || '',
        expiry: file.duration_days?.toString() || '',
        created: file.created_at,
        pdfUrl: file.pdf_url || undefined,
        pdfBlob: undefined, // Will be set when downloading
      }));

      setFiles(mappedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPdfToStorage = async (file: File, fileName: string) => {
    const fileExt = fileName.split('.').pop();
    const timestamp = Date.now();
    const filePath = `${timestamp}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    console.log('Uploaded file path:', filePath);
    console.log('Generated public URL:', publicUrl);

    return publicUrl;
  };

  const addFile = async (file: Omit<FileEntry, 'id' | 'created'>) => {
    let pdfUrl = file.pdfUrl;

    if (file.pdfBlob) {
      const pdfFile = new File([file.pdfBlob], `${file.fileName}.pdf`, { type: 'application/pdf' });
      pdfUrl = await uploadPdfToStorage(pdfFile, `${file.fileName}.pdf`);
    }

    const newFile: FileEntry = {
      ...file,
      id: Date.now().toString(),
      created: new Date().toISOString().split('T')[0],
      pdfUrl,
      pdfBlob: undefined, // Remove blob after upload
    };

    const { data, error } = await supabase
      .from('voucher_packages')
      .insert([{
        name: newFile.fileName,
        description: newFile.caption,
        duration_days: parseInt(newFile.expiry) || null,
        data_limit_gb: newFile.quantity,
        price: 0, // Default price since it's required
        router_number: newFile.routerNumber,
        quantity: newFile.quantity,
        remaining: newFile.remaining,
        pdf_url: newFile.pdfUrl,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding file:', error);
      return null;
    }

    const mappedData: FileEntry = {
      id: data.id,
      routerNumber: data.router_number || '',
      quantity: data.quantity || 0,
      remaining: data.remaining || 0,
      fileName: data.name,
      caption: data.description || '',
      expiry: data.duration_days?.toString() || '',
      created: data.created_at,
      pdfUrl: data.pdf_url || undefined,
      pdfBlob: undefined,
    };

    setFiles(prev => [mappedData, ...prev]);
    return mappedData;
  };

  const removeFile = async (id: string) => {
    const fileToDelete = files.find(f => f.id === id);
    if (fileToDelete?.pdfUrl) {
      // Extract file path from URL and delete from storage
      const urlParts = fileToDelete.pdfUrl.split('/');
      const filePath = urlParts[urlParts.length - 1]; // Get the last part (filename)
      console.log('Deleting file path:', filePath);
      await supabase.storage.from('files').remove([filePath]);
    }

    const { error } = await supabase
      .from('voucher_packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing file:', error);
      return;
    }

    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFile = async (id: string, updates: Partial<FileEntry>) => {
    let pdfUrl = updates.pdfUrl;

    if (updates.pdfBlob) {
      const pdfFile = new File([updates.pdfBlob], `${updates.fileName || 'file'}.pdf`, { type: 'application/pdf' });
      pdfUrl = await uploadPdfToStorage(pdfFile, `${updates.fileName || 'file'}.pdf`);
      updates.pdfBlob = undefined;
    }

    // Map FileEntry fields to database fields
    const dbUpdates: any = {};
    if (updates.routerNumber !== undefined) dbUpdates.router_number = updates.routerNumber;
    if (updates.quantity !== undefined) {
      dbUpdates.quantity = updates.quantity;
      dbUpdates.data_limit_gb = updates.quantity;
    }
    if (updates.remaining !== undefined) dbUpdates.remaining = updates.remaining;
    if (updates.fileName !== undefined) dbUpdates.name = updates.fileName;
    if (updates.caption !== undefined) dbUpdates.description = updates.caption;
    if (updates.expiry !== undefined) dbUpdates.duration_days = parseInt(updates.expiry) || null;
    if (updates.created !== undefined) dbUpdates.created_at = updates.created;
    if (pdfUrl !== undefined) dbUpdates.pdf_url = pdfUrl;

    const { data, error } = await supabase
      .from('voucher_packages')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating file:', error);
      return;
    }

    const mappedData: FileEntry = {
      id: data.id,
      routerNumber: data.router_number || '',
      quantity: data.quantity || 0,
      remaining: data.remaining || 0,
      fileName: data.name,
      caption: data.description || '',
      expiry: data.duration_days?.toString() || '',
      created: data.created_at,
      pdfUrl: data.pdf_url || undefined,
      pdfBlob: undefined,
    };

    setFiles(prev => prev.map(f => f.id === id ? mappedData : f));
  };

  const getFileById = (id: string) => {
    return files.find(file => file.id === id);
  };

  return {
    files,
    loading,
    addFile,
    removeFile,
    updateFile,
    getFileById,
  };
}
