"use client";

import { OrderStatus } from "@/domain/entities/Order";
import { Check, Clock, Package, Truck, Home, XCircle } from "lucide-react";
import { cn } from "@/presentation/utils";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const steps = [
  { status: OrderStatus.PENDING, label: "Chờ xác nhận", icon: Clock },
  { status: OrderStatus.COMPLETED, label: "Đã hoàn thành", icon: Home },
];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
        <XCircle className="w-6 h-6" />
        <span className="font-medium">Đơn hàng này đã bị hủy.</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="relative">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex || currentStatus === OrderStatus.COMPLETED;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center flex-1 relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isCompleted 
                    ? "bg-green-500 border-green-500 text-white" 
                    : isCurrent 
                      ? "bg-white border-primary text-primary shadow-lg shadow-primary/20 scale-110" 
                      : "bg-white border-slate-200 text-slate-300"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={cn(
                  "mt-3 text-[10px] sm:text-xs font-medium text-center transition-colors duration-500",
                  isCompleted || isCurrent ? "text-slate-900" : "text-slate-400"
                )}
              >
                {step.label}
              </span>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-5 left-[50%] w-full h-[2px] -z-10",
                    index < currentIndex ? "bg-green-500" : "bg-slate-100"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
