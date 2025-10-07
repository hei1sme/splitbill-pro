"use client";

import React, { useState } from "react";
import {
  QrCode,
  Share2,
  Download,
  Copy,
  Smartphone,
  Mail,
  MessageSquare,
  Printer,
  Eye,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PaymentInfo {
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  reference: string;
  qrUrl?: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

interface EnhancedQRSharingProps {
  billId: string;
  billTitle: string;
  paymentInfo: PaymentInfo;
  totalAmount: number;
  splits: Array<{
    personId: string;
    personName: string;
    amount: number;
    contact?: string;
  }>;
  onShare: (method: string, recipients: string[], customMessage?: string) => void;
}

export function EnhancedQRSharing({
  billId,
  billTitle,
  paymentInfo,
  totalAmount,
  splits,
  onShare,
}: EnhancedQRSharingProps) {
  const [shareDialog, setShareDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [qrSize, setQrSize] = useState("300");
  const [includeInstructions, setIncludeInstructions] = useState(true);

  const generatePaymentMessage = () => {
    return `💰 Payment Request: ${billTitle}

🏦 Bank Details:
• Bank: ${paymentInfo.bankCode}
• Account: ${paymentInfo.accountNumber}
• Name: ${paymentInfo.accountHolder}
• Amount: $${paymentInfo.amount.toFixed(2)}
• Reference: ${paymentInfo.reference}

📱 Quick Pay: Scan the QR code below or use the bank details above.

Thank you! 😊`;
  };

  const generateShareableContent = () => {
    const message = customMessage || generatePaymentMessage();
    const qrImageUrl = paymentInfo.qrUrl || `/api/qr/generate?data=${encodeURIComponent(JSON.stringify(paymentInfo))}`;
    
    return {
      text: message,
      image: qrImageUrl,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">💰 ${billTitle}</h2>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrImageUrl}" alt="Payment QR Code" style="width: ${qrSize}px; height: ${qrSize}px; border: 1px solid #ddd; border-radius: 8px;" />
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">🏦 Bank Details</h3>
            <p style="margin: 5px 0;"><strong>Bank:</strong> ${paymentInfo.bankCode}</p>
            <p style="margin: 5px 0;"><strong>Account:</strong> ${paymentInfo.accountNumber}</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${paymentInfo.accountHolder}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${paymentInfo.amount.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Reference:</strong> ${paymentInfo.reference}</p>
          </div>
          
          ${includeInstructions ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">📱 How to Pay</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Open your banking app</li>
              <li>Scan the QR code above, or</li>
              <li>Enter the bank details manually</li>
              <li>Confirm the payment</li>
              <li>Let me know when it's done!</li>
            </ol>
          </div>
          ` : ''}
          
          <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
            Thank you for splitting the bill! 😊
          </p>
        </div>
      `
    };
  };

  const shareOptions: ShareOption[] = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <MessageSquare className="h-4 w-4" />,
      description: "Share via WhatsApp message",
      action: () => {
        const content = generateShareableContent();
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(content.text)}`;
        window.open(whatsappUrl, '_blank');
        onShare("whatsapp", recipients, content.text);
      }
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="h-4 w-4" />,
      description: "Send via email with QR code",
      action: () => {
        const content = generateShareableContent();
        const emailUrl = `mailto:?subject=${encodeURIComponent(`Payment Request: ${billTitle}`)}&body=${encodeURIComponent(content.text)}`;
        window.open(emailUrl);
        onShare("email", recipients, content.text);
      }
    },
    {
      id: "copy",
      name: "Copy Link",
      icon: <Copy className="h-4 w-4" />,
      description: "Copy payment details to clipboard",
      action: () => {
        const content = generateShareableContent();
        navigator.clipboard.writeText(content.text);
        toast.success("Payment details copied to clipboard!");
        onShare("copy", [], content.text);
      }
    },
    {
      id: "download",
      name: "Download Image",
      icon: <Download className="h-4 w-4" />,
      description: "Download QR code as image",
      action: () => {
        const content = generateShareableContent();
        // Create a download link for the QR image
        const link = document.createElement('a');
        link.href = content.image;
        link.download = `payment-qr-${billTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        onShare("download", [], content.text);
      }
    },
    {
      id: "print",
      name: "Print",
      icon: <Printer className="h-4 w-4" />,
      description: "Print payment slip with QR code",
      action: () => {
        const content = generateShareableContent();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(content.html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
        onShare("print", [], content.text);
      }
    }
  ];

  const handleBulkShare = () => {
    if (!selectedMethod || recipients.length === 0) {
      toast.error("Please select a sharing method and recipients");
      return;
    }

    const method = shareOptions.find(opt => opt.id === selectedMethod);
    if (method) {
      method.action();
      setShareDialog(false);
      toast.success(`Payment details shared with ${recipients.length} people via ${method.name}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Payment QR Code
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDialog(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareDialog(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                {paymentInfo.qrUrl ? (
                  <img
                    src={paymentInfo.qrUrl}
                    alt="Payment QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Scan with banking app to pay
              </p>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-medium">{paymentInfo.bankCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-medium">{paymentInfo.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{paymentInfo.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium text-lg">{formatCurrency(paymentInfo.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-medium">{paymentInfo.reference}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Who needs to pay:</h4>
                <div className="space-y-2">
                  {splits.map((split, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{split.personName}</span>
                      <Badge variant="outline">{formatCurrency(split.amount)}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Share Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Quick Share Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={option.action}
              >
                {option.icon}
                <span className="text-xs">{option.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Payment Request</DialogTitle>
            <DialogDescription>
              Send payment details to multiple people at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sharing Method</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose sharing method" />
                </SelectTrigger>
                <SelectContent>
                  {shareOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Recipients</label>
              <div className="space-y-2">
                {splits.map((split, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={recipients.includes(split.personId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecipients([...recipients, split.personId]);
                          } else {
                            setRecipients(recipients.filter(id => id !== split.personId));
                          }
                        }}
                      />
                      <span>{split.personName}</span>
                    </div>
                    <Badge variant="outline">{formatCurrency(split.amount)}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Custom Message (optional)</label>
              <Textarea
                placeholder="Add a personal message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share with {recipients.length} people
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Request Preview</DialogTitle>
            <DialogDescription>
              This is how your payment request will look
            </DialogDescription>
          </DialogHeader>
          <div 
            className="border rounded-lg p-4 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: generateShareableContent().html }}
          />
          <DialogFooter>
            <Button onClick={() => setPreviewDialog(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
