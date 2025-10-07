"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle, 
  AlertCircle, 
  Brain,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Loader2
} from 'lucide-react';

interface RecognizedItem {
  id: string;
  name: string;
  amount: number;
  quantity?: number;
  category: string;
  confidence: number;
}

interface ReceiptData {
  merchant: string;
  total: number;
  date: string;
  items: RecognizedItem[];
  location?: string;
  paymentMethod?: string;
  confidence: number;
}

interface ExpenseRecognitionProps {
  onExpenseRecognized: (expense: ReceiptData) => void;
  onCancel: () => void;
}

// Mock AI recognition - would integrate with OCR/AI service
const mockRecognizeReceipt = async (imageData: string): Promise<ReceiptData> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    merchant: "Mario's Italian Restaurant",
    total: 87.45,
    date: new Date().toISOString().split('T')[0],
    location: "123 Main St, Downtown",
    paymentMethod: "Credit Card",
    confidence: 0.94,
    items: [
      {
        id: '1',
        name: 'Margherita Pizza',
        amount: 18.50,
        quantity: 1,
        category: 'Food',
        confidence: 0.96
      },
      {
        id: '2',
        name: 'Caesar Salad',
        amount: 12.00,
        quantity: 1,
        category: 'Food',
        confidence: 0.92
      },
      {
        id: '3',
        name: 'Pasta Carbonara',
        amount: 22.00,
        quantity: 1,
        category: 'Food',
        confidence: 0.95
      },
      {
        id: '4',
        name: 'Wine (Chianti)',
        amount: 28.00,
        quantity: 1,
        category: 'Beverages',
        confidence: 0.89
      },
      {
        id: '5',
        name: 'Tiramisu',
        amount: 8.95,
        quantity: 1,
        category: 'Dessert',
        confidence: 0.91
      }
    ]
  };
};

export function ExpenseRecognition({ onExpenseRecognized, onCancel }: ExpenseRecognitionProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'splitting'>('upload');
  const [recognizedData, setRecognizedData] = useState<ReceiptData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedData, setEditedData] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
      setStep('processing');
      setIsProcessing(true);

      try {
        const recognized = await mockRecognizeReceipt(imageData);
        setRecognizedData(recognized);
        setEditedData(recognized);
        setStep('review');
      } catch (error) {
        console.error('Recognition failed:', error);
        // Handle error
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleItemEdit = (itemId: string, field: string, value: any) => {
    if (!editedData) return;
    
    setEditedData({
      ...editedData,
      items: editedData.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const handleDataEdit = (field: string, value: any) => {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  };

  const recalculateTotal = () => {
    if (!editedData) return;
    const newTotal = editedData.items.reduce((sum, item) => sum + item.amount, 0);
    setEditedData({ ...editedData, total: newTotal });
  };

  const handleConfirm = () => {
    if (editedData) {
      onExpenseRecognized(editedData);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (step === 'upload') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <span>AI Expense Recognition</span>
          </CardTitle>
          <CardDescription>
            Upload a receipt photo and let AI extract expense details automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col space-y-2 border-dashed border-2 hover:border-blue-500"
              onClick={handleCameraCapture}
            >
              <Camera className="h-8 w-8 text-muted-foreground" />
              <span>Take Photo</span>
              <span className="text-xs text-muted-foreground">Use device camera</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col space-y-2 border-dashed border-2 hover:border-blue-500"
              onClick={handleUploadClick}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span>Upload Photo</span>
              <span className="text-xs text-muted-foreground">Choose from gallery</span>
            </Button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* AI Features */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Features</span>
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic text recognition (OCR)</li>
              <li>• Smart item categorization</li>
              <li>• Price and quantity extraction</li>
              <li>• Merchant and date detection</li>
              <li>• Multi-language support</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <Brain className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">Processing Receipt...</h3>
            <p className="text-muted-foreground">
              AI is analyzing your receipt and extracting expense details
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'review' && recognizedData && editedData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-6 w-6 text-green-500" />
              <span>Review & Edit</span>
            </div>
            <Badge className={getConfidenceBadge(recognizedData.confidence)}>
              {Math.round(recognizedData.confidence * 100)}% confidence
            </Badge>
          </CardTitle>
          <CardDescription>
            Review the AI-extracted data and make any necessary corrections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Receipt Preview */}
            {selectedImage && (
              <div className="space-y-2">
                <Label>Receipt Image</Label>
                <div className="border rounded-lg p-2">
                  <img 
                    src={selectedImage} 
                    alt="Receipt" 
                    className="max-w-full max-h-96 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Extracted Data */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant</Label>
                <Input
                  id="merchant"
                  value={editedData.merchant}
                  onChange={(e) => handleDataEdit('merchant', e.target.value)}
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editedData.date}
                    onChange={(e) => handleDataEdit('date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total Amount</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={editedData.total}
                    onChange={(e) => handleDataEdit('total', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {editedData.location && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editedData.location}
                    onChange={(e) => handleDataEdit('location', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Extracted Items</h4>
              <Button variant="outline" size="sm" onClick={recalculateTotal}>
                Recalculate Total
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {editedData.items.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Item Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => handleItemEdit(item.id, 'name', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => handleItemEdit(item.id, 'amount', parseFloat(e.target.value))}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Input
                          value={item.category}
                          onChange={(e) => handleItemEdit(item.id, 'category', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Confidence</Label>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getConfidenceColor(item.confidence)}>
                            {Math.round(item.confidence * 100)}%
                          </Badge>
                          {item.confidence < 0.7 && (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Create Bill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
