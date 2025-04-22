
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { authenticate } from '@/services/authService';
import { getProductDictionary, saveProductDictionary } from '@/services/reportService';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';

const ControlPanel = () => {
  const { isAuthenticated, setIsAuthenticated } = useAppContext();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProductDictionary();
    }
  }, [isAuthenticated]);

  const loadProductDictionary = async () => {
    setLoading(true);
    try {
      const data = await getProductDictionary();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load product dictionary');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const result = await authenticate(password);
      
      if (result) {
        setIsAuthenticated(true);
        toast.success('Authentication successful');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      console.error(error);
      toast.error('Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const result = await saveProductDictionary(products);
      
      if (result) {
        toast.success('Product dictionary saved successfully');
      } else {
        toast.error('Failed to save product dictionary');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save product dictionary');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    toast.success('Product removed from dictionary');
  };

  const handleAddProduct = () => {
    const today = new Date().toISOString().split('T')[0];
    const newProduct = {
      productId: `P-${Math.floor(Math.random() * 10000)}`,
      productName: "New Product",
      date: today,
      isEcho: false
    };
    
    setProducts([...products, newProduct]);
  };

  if (!isAuthenticated) {
    return (
      <div className="glass-card rounded-lg p-6 max-w-md mx-auto">
        <h2 className="text-lg font-medium mb-6 text-center">Control Panel Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label htmlFor="password" className="text-sm mb-1 block">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-muted"
              placeholder="Enter control panel password"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-lg text-gray-400">Loading product dictionary...</div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Product Dictionary Management</h2>
        <div className="space-x-2">
          <Button 
            onClick={handleAddProduct}
            variant="outline"
            disabled={saving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Echo</TableHead>
              <TableHead className="w-[50px]">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.productId}>
                <TableCell className="font-mono">
                  {product.productId}
                </TableCell>
                <TableCell>
                  <Input
                    value={product.productName}
                    onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                    className="bg-muted"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={product.date}
                    onChange={(e) => handleProductChange(index, 'date', e.target.value)}
                    className="bg-muted"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Checkbox 
                      checked={product.isEcho}
                      onCheckedChange={(checked) => handleProductChange(index, 'isEcho', !!checked)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No products found in dictionary
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ControlPanel;
