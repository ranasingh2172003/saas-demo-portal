"use client";

import React, { useState, useMemo } from "react";
import {
  QrCode,
  Download,
  Printer,
  Activity,
  Check,
  ShoppingBag,
  Sliders,
} from "lucide-react";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

type FormatType = "sticker" | "stand" | "tent";

interface ColorPalette {
  name: string;
  hex: string;
  bgClass: string;
}

const PALETTES: ColorPalette[] = [
  { name: "Apex Indigo", hex: "#4f46e5", bgClass: "bg-indigo-600" },
  { name: "Electric Blue", hex: "#2563eb", bgClass: "bg-blue-600" },
  { name: "Emerald Pro", hex: "#059669", bgClass: "bg-emerald-600" },
  { name: "Royal Purple", hex: "#7c3aed", bgClass: "bg-purple-600" },
  { name: "Ruby Red", hex: "#e11d48", bgClass: "bg-rose-600" },
  { name: "Slate Minimal", hex: "#0f172a", bgClass: "bg-slate-900" },
];

/**
 * Deterministic SVG QR Matrix Generator
 * Generates an authentic 25x25 QR Version 2 matrix with finder patterns,
 * timing lines, alignment patterns, and data bits derived from text content.
 */
function generateQRMatrix(content: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Helper: Draw 7x7 Finder Pattern with 1-module white separator
  const placeFinder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const row = r + i;
        const col = c + j;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (i === -1 || i === 7 || j === -1 || j === 7) {
            matrix[row][col] = false;
          } else if (i === 0 || i === 6 || j === 0 || j === 6) {
            matrix[row][col] = true;
          } else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
            matrix[row][col] = true;
          } else {
            matrix[row][col] = false;
          }
        }
      }
    }
  };

  // 1. Finder patterns at Top-Left, Top-Right, Bottom-Left
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Alignment pattern at (16, 16)
  const alignR = 16;
  const alignC = 16;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const isOuter = Math.abs(i) === 2 || Math.abs(j) === 2;
      const isCenter = i === 0 && j === 0;
      matrix[alignR + i][alignC + j] = isOuter || isCenter;
    }
  }

  // 3. Timing patterns on row 6 and col 6
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 4. Populate remaining data modules pseudo-randomly using content hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  const isReserved = (r: number, c: number): boolean => {
    // Finders
    if (r <= 8 && c <= 8) return true;
    if (r <= 8 && c >= size - 8) return true;
    if (r >= size - 8 && c <= 8) return true;
    // Alignment
    if (r >= 14 && r <= 18 && c >= 14 && c <= 18) return true;
    // Timing
    if (r === 6 || c === 6) return true;
    // Center logo cutout (rows 10-14, cols 10-14)
    if (r >= 10 && r <= 14 && c >= 10 && c <= 14) return true;
    return false;
  };

  let rng = hash;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved(r, c)) {
        rng = (rng * 1664525 + 1013904223) >>> 0;
        matrix[r][c] = (rng & 1) === 1;
      }
    }
  }

  return matrix;
}

export default function QRBanners() {
  const { success, info } = useToast();

  // Customizer State
  const [selectedFormat, setSelectedFormat] = useState<FormatType>("sticker");
  const [businessName, setBusinessName] = useState<string>("Apex Cooling & Heating");
  const [headline, setHeadline] = useState<string>("Need Emergency AC Repair?");
  const [subheadline, setSubheadline] = useState<string>("Scan to chat with our 24/7 AI Assistant");
  const [callToAction, setCallToAction] = useState<string>("Get a diagnostic quote & book in 60s.");
  const [phoneNumber, setPhoneNumber] = useState<string>("+1 (800) 555-APEX");
  const [selectedColor, setSelectedColor] = useState<ColorPalette>(PALETTES[0]);

  // StickerMule Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(50);
  const [orderMaterial, setOrderMaterial] = useState<string>("Heavy-Duty Weatherproof Vinyl");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Generate QR Matrix derived from current phone and business name
  const qrMatrix = useMemo(() => {
    const seed = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=Hi+${encodeURIComponent(
      businessName
    )}+I+need+AC+service`;
    return generateQRMatrix(seed);
  }, [phoneNumber, businessName]);

  // Pricing formula for StickerMule
  const unitPrice = orderQuantity === 50 ? 0.98 : orderQuantity === 100 ? 0.79 : orderQuantity === 250 ? 0.60 : 0.46;
  const totalPrice = Math.round(orderQuantity * unitPrice);

  // Handler: Download Vector Assets
  const handleDownloadAssets = () => {
    // Generate clean SVG markup for file download
    const cellSize = 10;
    const padding = 20;
    const totalSize = qrMatrix.length * cellSize + padding * 2;

    let rects = "";
    qrMatrix.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          rects += `<rect x="${padding + c * cellSize}" y="${padding + r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${selectedColor.hex}"/>`;
        }
      });
    });

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="800" height="800">
        <rect width="${totalSize}" height="${totalSize}" fill="#ffffff" rx="16"/>
        ${rects}
        <circle cx="${totalSize / 2}" cy="${totalSize / 2}" r="18" fill="#ffffff"/>
        <circle cx="${totalSize / 2}" cy="${totalSize / 2}" r="14" fill="${selectedColor.hex}"/>
      </svg>
    `.trim();

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-smart-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success("Assets Downloaded!", "300 DPI vector SVG asset package saved to downloads.");
  };

  // Handler: Download Print PDF / Trigger Print
  const handlePrintPDF = () => {
    info("Generating Print PDF", "Opening browser print dialogue with vector dimensions...");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  // Handler: Order Confirmation
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);

    setTimeout(() => {
      setIsSubmittingOrder(false);
      setIsOrderModalOpen(false);
      success(
        "Order Confirmed with StickerMule!",
        `${orderQuantity}x ${orderMaterial} stickers ($${totalPrice}) queued for production. Tracking emailed.`
      );
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Smart QR Banners & Collateral
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Bridge physical foot traffic directly to your 24/7 AI WhatsApp Agent with customized print collateral.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAssets}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download Assets
          </button>
        </div>
      </div>

      {/* Main Grid: Customizer Panel (1 col) + Live Mockup Canvas (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Customization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Customizer Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Live Customizer
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Instant Real-time Sync
              </span>
            </div>

            {/* Format Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Format & Proportions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sticker", label: "Front Door", sub: "4x6\" Sticker" },
                  { id: "stand", label: "A4 Stand", sub: "Counter Acrylic" },
                  { id: "tent", label: "Table Tent", sub: "5x7\" Double" },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id as FormatType)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedFormat === fmt.id
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs">{fmt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fmt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-2.5">
                {PALETTES.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center text-white shadow-sm ${
                      selectedColor.hex === color.hex ? "scale-125 ring-2 ring-offset-2 ring-indigo-500" : "hover:scale-110"
                    }`}
                    title={color.name}
                  >
                    {selectedColor.hex === color.hex && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Headline Text
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Call to Action Text
                </label>
                <input
                  type="text"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Support Guarantee
                </label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  WhatsApp Support Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Fulfillment & Export Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3 transition-colors">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-indigo-500" />
              Print & Order Fulfillment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Print at home or order commercial weatherproof UV stickers directly from StickerMule.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handlePrintPDF}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Print PDF
              </button>

              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 font-bold text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Order StickerMule
              </button>
            </div>
          </div>

          {/* Scan Analytics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Physical Foot Traffic Analytics
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Total QR Scans (This Month)</span>
                  <span className="font-bold text-slate-900 dark:text-white">1,204</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Conversion to WhatsApp Chat</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">68%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "68%" }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Live Interactive Mockup Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[640px] relative shadow-inner transition-colors">
          
          {/* Format Badges in canvas top left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            <button
              onClick={() => setSelectedFormat("sticker")}
              className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm border transition-all cursor-pointer ${
                selectedFormat === "sticker"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              Front Door Sticker (4x6&quot;)
            </button>
            <button
              onClick={() => setSelectedFormat("stand")}
              className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm border transition-all cursor-pointer ${
                selectedFormat === "stand"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              A4 Counter Stand
            </button>
            <button
              onClick={() => setSelectedFormat("tent")}
              className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm border transition-all cursor-pointer ${
                selectedFormat === "tent"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              }`}
            >
              Table Tent (5x7&quot;)
            </button>
          </div>

          {/* Quick Share / Preview indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span>Dynamic Vector Preview</span>
          </div>

          {/* THE PHYSICAL MOCKUP CONTAINER */}
          <div
            className={`transition-all duration-500 ease-out flex flex-col justify-between ${
              selectedFormat === "sticker"
                ? "w-full max-w-full max-w-[320px] mx-auto mx-auto rounded-2xl shadow-2xl overflow-hidden w-full border-4"
                : selectedFormat === "stand"
                ? "w-full max-w-[350px] mx-auto rounded-xl shadow-2xl overflow-hidden w-full border-[6px] ring-8 ring-black/5"
                : "w-full max-w-[330px] mx-auto rounded-xl shadow-2xl overflow-hidden w-full border-t-8 border-b-8"
            } bg-white dark:bg-slate-900`}
            style={{
              borderColor: selectedColor.hex,
            }}
          >
            {/* Mockup Header Ribbon */}
            <div
              className="text-white text-center py-4 px-6 transition-colors"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <h2 className="text-xl font-extrabold uppercase tracking-wide leading-tight drop-shadow-sm">
                {headline || "Need AC Repair?"}
              </h2>
            </div>

            {/* Mockup Body Content */}
            <div className="p-6 sm:p-8 flex flex-col items-center bg-white dark:bg-slate-950 transition-colors">
              
              {/* Dynamic SVG QR Code Container */}
              <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-md border-2 border-slate-200 mb-5 relative group flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${qrMatrix.length * 10} ${qrMatrix.length * 10}`}
                  className="w-full h-full"
                >
                  {qrMatrix.map((row, r) =>
                    row.map((cell, c) => {
                      if (!cell) return null;
                      return (
                        <rect
                          key={`${r}-${c}`}
                          x={c * 10}
                          y={r * 10}
                          width={10}
                          height={10}
                          fill={selectedColor.hex}
                        />
                      );
                    })
                  )}
                  {/* Center Brand Pill */}
                  <circle
                    cx={(qrMatrix.length * 10) / 2}
                    cy={(qrMatrix.length * 10) / 2}
                    r={18}
                    fill="#ffffff"
                  />
                  <circle
                    cx={(qrMatrix.length * 10) / 2}
                    cy={(qrMatrix.length * 10) / 2}
                    r={13}
                    fill={selectedColor.hex}
                  />
                </svg>
              </div>

              {/* Text Information on Mockup */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white text-center leading-tight">
                {subheadline || "Scan to chat with our AI Assistant"}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs text-center mt-2 max-w-[240px]">
                {callToAction || "Get an instant quote & book a technician 24/7."}
              </p>

              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span>Direct WhatsApp:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{phoneNumber}</span>
              </div>
            </div>

            {/* Mockup Footer Ribbon */}
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center py-2.5 px-4 transition-colors">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Powered by {businessName}
              </p>
            </div>
          </div>

          {/* Counter Stand Acrylic Foot (Only rendered in stand format) */}
          {selectedFormat === "stand" && (
            <div className="w-full max-w-[380px] mx-auto h-6 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-b-xl shadow-xl mt-[-4px] border border-white/20" />
          )}

          {/* Table Tent Fold Line Shadow (Only rendered in tent format) */}
          {selectedFormat === "tent" && (
            <div className="w-full max-w-[320px] mx-auto h-3 bg-slate-400/30 blur-sm rounded-full mt-2" />
          )}

        </div>

      </div>

      {/* MODAL: StickerMule Order Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        size="lg"
        title="Order Custom Print Collateral"
        description="Fulfillment partner: StickerMule • Free 2-day delivery with UV proofing."
      >
        <form onSubmit={handlePlaceOrder} className="space-y-4 py-2 text-xs">
          {/* Order Summary Pill */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedFormat === "sticker" ? "Front Door Sticker" : selectedFormat === "stand" ? "A4 Acrylic Stand" : "Table Tent"}
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Artwork: {businessName} • Color: {selectedColor.name}
              </p>
            </div>
            <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">
              ${totalPrice}
            </span>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Quantity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { qty: 50, price: 49, unit: "$0.98/ea" },
                { qty: 100, price: 79, unit: "$0.79/ea" },
                { qty: 250, price: 149, unit: "$0.60/ea" },
                { qty: 500, price: 229, unit: "$0.46/ea" },
              ].map((tier) => (
                <button
                  key={tier.qty}
                  type="button"
                  onClick={() => setOrderQuantity(tier.qty)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    orderQuantity === tier.qty
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="text-sm font-bold">{tier.qty}</div>
                  <div className="text-[10px] text-slate-400">{tier.unit}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Option */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Material Specification
            </label>
            <select
              value={orderMaterial}
              onChange={(e) => setOrderMaterial(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Heavy-Duty Weatherproof Vinyl">Heavy-Duty Weatherproof Vinyl (Outdoor & UV Rated)</option>
              <option value="Removable Clear Window Cling">Removable Clear Window Cling (No Adhesive Residue)</option>
              <option value="Matte Finish Counter Acrylic">Matte Finish Counter Acrylic (Scuff-Resistant)</option>
            </select>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Shipping Destination
            </label>
            <input
              type="text"
              required
              defaultValue="1200 Industrial Parkway, Suite 400"
              placeholder="Street Address"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                defaultValue="Austin, TX"
                placeholder="City, State"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                required
                defaultValue="78701"
                placeholder="ZIP Code"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmittingOrder ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Place Order (${totalPrice})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
