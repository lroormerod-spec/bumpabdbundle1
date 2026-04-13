"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Mail, MessageSquare } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

export default function ShareSheet({ url, title, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = `Take a look at our baby registry! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareEmail() {
    const subject = encodeURIComponent(`${title} — Baby Registry`);
    const body = encodeURIComponent(`Hi! We've created our baby registry. You can view it here:\n\n${url}\n\nThank you for your support! 💕`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
  }

  function shareSMS() {
    const text = `Take a look at our baby registry! ${url}`;
    // sms: works on iOS and Android
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your registry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Share your registry link with family and friends so they can see what you need.
          </p>

          {/* URL copy */}
          <div className="flex gap-2">
            <Input value={url} readOnly className="flex-1 text-xs" />
            <Button variant="outline" size="icon" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={shareWhatsApp} className="bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2">
              <SiWhatsapp className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button onClick={shareFacebook} className="bg-[#1877F2] hover:bg-[#166fe5] text-white gap-2">
              <SiFacebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button variant="outline" onClick={shareEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="outline" onClick={shareSMS} className="gap-2">
              <MessageSquare className="w-4 h-4" />
              SMS
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Anyone with the link can view your registry — no account needed
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
