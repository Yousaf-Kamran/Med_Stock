"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export function NotificationToggle() {
  const [permission, setPermission] = useState('default');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      const localPermission = window.localStorage.getItem('notification_permission');
      if (localPermission === 'granted' && Notification.permission === 'granted') {
          setPermission('granted');
      } else if (localPermission === 'denied') {
          setPermission('denied');
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser does not support desktop notifications.",
        variant: "destructive",
      });
      return;
    }

    if (permission === 'granted') {
       toast({
        title: "Notifications are already enabled.",
      });
      return;
    }

    if (permission === 'denied' && window.localStorage.getItem('notification_permission') === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    window.localStorage.setItem('notification_permission', result);

    if (result === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive low-stock alerts.",
      });
      new Notification("MedStock Tracker", {
          body: "Notifications have been successfully enabled!",
          icon: "/favicon.ico",
      });
    } else {
      toast({
        title: "Notifications Not Enabled",
        description: "You won't receive low-stock alerts.",
        variant: "destructive",
      });
    }
  };
  
  const getTooltipText = () => {
      switch (permission) {
          case 'granted':
              return 'Notifications are enabled';
          case 'denied':
              return 'Notifications are blocked';
          default:
              return 'Enable notifications';
      }
  }

  if (!mounted) {
    return (
       <Button variant="outline" size="icon" disabled>
          <BellOff className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Enable notifications</span>
        </Button>
    )
  }
  
  if (!('Notification' in window)) return null;

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={requestPermission} disabled={permission === 'denied'}>
                    {permission === 'granted' ? (
                        <Bell className="h-[1.2rem] w-[1.2rem]" />
                    ) : (
                        <BellOff className="h-[1.2rem] w-[1.2rem]" />
                    )}
                    <span className="sr-only">{getTooltipText()}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{getTooltipText()}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
