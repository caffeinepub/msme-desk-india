import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DocumentRecord, DocumentTemplate } from "../backend.d";
import { Category } from "../backend.d";
import { useActor } from "./useActor";

export function useTemplates() {
  const { actor, isFetching } = useActor();

  return useQuery<DocumentTemplate[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return getDefaultTemplates();
      try {
        const templates = await actor.getAllTemplates();
        return templates.length > 0 ? templates : getDefaultTemplates();
      } catch {
        return getDefaultTemplates();
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: getDefaultTemplates(),
  });
}

export function useDocumentRecords(page = 0, pageSize = 20) {
  const { actor, isFetching } = useActor();

  return useQuery<DocumentRecord[]>({
    queryKey: ["documentRecords", page, pageSize],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDocumentRecords(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDocumentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: DocumentRecord) => {
      if (!actor) throw new Error("No actor available");
      await actor.createDocumentRecord(record);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["documentRecords"] });
    },
  });
}

function getDefaultTemplates(): DocumentTemplate[] {
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  return [
    // Trade Documents
    {
      id: "tpl-proforma-invoice",
      name: "Proforma Invoice",
      category: Category.trade,
      description: "Pre-shipment invoice sent before goods are dispatched",
      fields: JSON.stringify([
        { key: "buyerName", label: "Buyer Name", type: "text", required: true },
        {
          key: "buyerAddress",
          label: "Buyer Address",
          type: "textarea",
          required: true,
        },
        {
          key: "invoiceNumber",
          label: "Invoice Number",
          type: "text",
          required: true,
        },
        {
          key: "invoiceDate",
          label: "Invoice Date",
          type: "date",
          required: true,
        },
        {
          key: "items",
          label: "Items Description",
          type: "textarea",
          required: true,
        },
        {
          key: "totalAmount",
          label: "Total Amount (₹)",
          type: "number",
          required: true,
        },
        {
          key: "currency",
          label: "Currency",
          type: "select",
          required: false,
          options: ["INR", "USD", "EUR", "GBP"],
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: false,
        },
        {
          key: "deliveryTerms",
          label: "Delivery Terms",
          type: "text",
          required: false,
        },
        {
          key: "placeOfSupply",
          label: "Place of Supply",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-commercial-invoice",
      name: "Commercial Invoice",
      category: Category.trade,
      description: "Official invoice for customs and trade purposes",
      fields: JSON.stringify([
        { key: "buyerName", label: "Buyer Name", type: "text", required: true },
        {
          key: "buyerAddress",
          label: "Buyer Address",
          type: "textarea",
          required: true,
        },
        {
          key: "invoiceNumber",
          label: "Invoice Number",
          type: "text",
          required: true,
        },
        {
          key: "invoiceDate",
          label: "Invoice Date",
          type: "date",
          required: true,
        },
        {
          key: "items",
          label: "Items / HS Code",
          type: "textarea",
          required: true,
        },
        {
          key: "totalAmount",
          label: "Total Amount",
          type: "number",
          required: true,
        },
        {
          key: "currency",
          label: "Currency",
          type: "select",
          required: true,
          options: ["INR", "USD", "EUR", "GBP"],
        },
        {
          key: "countryOfOrigin",
          label: "Country of Origin",
          type: "text",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: false,
        },
        {
          key: "shippingMarks",
          label: "Shipping Marks & Numbers",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-packing-list",
      name: "Packing List",
      category: Category.trade,
      description: "Itemized list of contents in each package",
      fields: JSON.stringify([
        { key: "buyerName", label: "Buyer Name", type: "text", required: true },
        {
          key: "buyerAddress",
          label: "Buyer Address",
          type: "textarea",
          required: true,
        },
        {
          key: "invoiceRef",
          label: "Invoice Reference No.",
          type: "text",
          required: true,
        },
        {
          key: "packageCount",
          label: "Number of Packages",
          type: "number",
          required: true,
        },
        {
          key: "contents",
          label: "Contents Description",
          type: "textarea",
          required: true,
        },
        {
          key: "grossWeight",
          label: "Gross Weight (kg)",
          type: "number",
          required: true,
        },
        {
          key: "netWeight",
          label: "Net Weight (kg)",
          type: "number",
          required: true,
        },
        {
          key: "shippingMarks",
          label: "Shipping Marks",
          type: "text",
          required: false,
        },
        {
          key: "portOfLoading",
          label: "Port of Loading",
          type: "text",
          required: false,
        },
        {
          key: "portOfDischarge",
          label: "Port of Discharge",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-sales-order",
      name: "Sales Order",
      category: Category.trade,
      description: "Confirmation of a customer's purchase order",
      fields: JSON.stringify([
        {
          key: "customerName",
          label: "Customer Name",
          type: "text",
          required: true,
        },
        {
          key: "customerAddress",
          label: "Customer Address",
          type: "textarea",
          required: true,
        },
        {
          key: "soNumber",
          label: "Sales Order Number",
          type: "text",
          required: true,
        },
        { key: "orderDate", label: "Order Date", type: "date", required: true },
        {
          key: "deliveryDate",
          label: "Expected Delivery Date",
          type: "date",
          required: true,
        },
        {
          key: "items",
          label: "Items / Products",
          type: "textarea",
          required: true,
        },
        {
          key: "totalAmount",
          label: "Total Amount (₹)",
          type: "number",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: false,
        },
        {
          key: "deliveryAddress",
          label: "Delivery Address",
          type: "textarea",
          required: false,
        },
        {
          key: "specialInstructions",
          label: "Special Instructions",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-purchase-order",
      name: "Purchase Order",
      category: Category.trade,
      description: "Order sent to suppliers for procurement of goods",
      fields: JSON.stringify([
        {
          key: "supplierName",
          label: "Supplier Name",
          type: "text",
          required: true,
        },
        {
          key: "supplierAddress",
          label: "Supplier Address",
          type: "textarea",
          required: true,
        },
        { key: "poNumber", label: "PO Number", type: "text", required: true },
        { key: "poDate", label: "PO Date", type: "date", required: true },
        {
          key: "deliveryDate",
          label: "Required Delivery Date",
          type: "date",
          required: true,
        },
        {
          key: "items",
          label: "Items / Products",
          type: "textarea",
          required: true,
        },
        {
          key: "totalAmount",
          label: "Total Amount (₹)",
          type: "number",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: false,
        },
        {
          key: "deliveryAddress",
          label: "Delivery Address",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-quotation",
      name: "Quotation",
      category: Category.trade,
      description: "Formal price quote for products or services",
      fields: JSON.stringify([
        {
          key: "buyerName",
          label: "Buyer / Client Name",
          type: "text",
          required: true,
        },
        {
          key: "buyerAddress",
          label: "Buyer Address",
          type: "textarea",
          required: true,
        },
        {
          key: "quoteNumber",
          label: "Quotation Number",
          type: "text",
          required: true,
        },
        { key: "quoteDate", label: "Quote Date", type: "date", required: true },
        {
          key: "validUntil",
          label: "Valid Until",
          type: "date",
          required: true,
        },
        {
          key: "items",
          label: "Items / Services",
          type: "textarea",
          required: true,
        },
        {
          key: "totalAmount",
          label: "Total Amount (₹)",
          type: "number",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: false,
        },
        {
          key: "notes",
          label: "Notes / Terms",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    // Export Documents
    {
      id: "tpl-fco",
      name: "FCO (Full Corporate Offer)",
      category: Category.export_,
      description: "Full corporate offer for commodity exports",
      fields: JSON.stringify([
        {
          key: "buyerName",
          label: "Buyer / Receiver Name",
          type: "text",
          required: true,
        },
        {
          key: "buyerAddress",
          label: "Buyer Address",
          type: "textarea",
          required: true,
        },
        { key: "commodity", label: "Commodity", type: "text", required: true },
        {
          key: "quantity",
          label: "Quantity (MT)",
          type: "number",
          required: true,
        },
        {
          key: "price",
          label: "Price per MT (USD)",
          type: "number",
          required: true,
        },
        {
          key: "deliveryTerms",
          label: "Delivery Terms (Incoterms)",
          type: "select",
          required: true,
          options: ["FOB", "CIF", "CFR", "EXW", "DDP"],
        },
        {
          key: "portOfLoading",
          label: "Port of Loading",
          type: "text",
          required: true,
        },
        {
          key: "portOfDischarge",
          label: "Port of Discharge",
          type: "text",
          required: true,
        },
        {
          key: "validity",
          label: "Offer Validity",
          type: "text",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: true,
        },
        {
          key: "shippingSchedule",
          label: "Shipping Schedule",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-sco",
      name: "SCO (Soft Corporate Offer)",
      category: Category.export_,
      description: "Preliminary offer for export commodities",
      fields: JSON.stringify([
        { key: "buyerName", label: "Buyer Name", type: "text", required: true },
        { key: "commodity", label: "Commodity", type: "text", required: true },
        { key: "quantity", label: "Quantity", type: "text", required: true },
        {
          key: "price",
          label: "Indicative Price",
          type: "text",
          required: true,
        },
        {
          key: "deliveryTerms",
          label: "Delivery Terms",
          type: "text",
          required: true,
        },
        {
          key: "validity",
          label: "Offer Validity",
          type: "text",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: false,
        },
        {
          key: "specifications",
          label: "Product Specifications",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-loi",
      name: "LOI (Letter of Intent)",
      category: Category.export_,
      description: "Letter expressing intent to purchase or supply",
      fields: JSON.stringify([
        {
          key: "recipientName",
          label: "Recipient Name / Company",
          type: "text",
          required: true,
        },
        {
          key: "recipientAddress",
          label: "Recipient Address",
          type: "textarea",
          required: true,
        },
        {
          key: "subject",
          label: "Subject / Reference",
          type: "text",
          required: true,
        },
        {
          key: "commodity",
          label: "Commodity / Product",
          type: "text",
          required: true,
        },
        { key: "quantity", label: "Quantity", type: "text", required: true },
        {
          key: "price",
          label: "Price Indication",
          type: "text",
          required: true,
        },
        {
          key: "terms",
          label: "Terms & Conditions",
          type: "textarea",
          required: true,
        },
        {
          key: "validity",
          label: "LOI Validity",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-ncnda",
      name: "NCNDA",
      category: Category.export_,
      description: "Non-Circumvention Non-Disclosure Agreement for trade",
      fields: JSON.stringify([
        {
          key: "party1Name",
          label: "First Party Name",
          type: "text",
          required: true,
        },
        {
          key: "party1Address",
          label: "First Party Address",
          type: "textarea",
          required: true,
        },
        {
          key: "party2Name",
          label: "Second Party Name",
          type: "text",
          required: true,
        },
        {
          key: "party2Address",
          label: "Second Party Address",
          type: "textarea",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        {
          key: "duration",
          label: "Duration (years)",
          type: "number",
          required: true,
        },
        {
          key: "commodity",
          label: "Commodity / Business Area",
          type: "text",
          required: true,
        },
        {
          key: "jurisdiction",
          label: "Jurisdiction / Governing Law",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-export-contract",
      name: "Export Sales Contract",
      category: Category.export_,
      description: "Binding contract for international sales",
      fields: JSON.stringify([
        {
          key: "buyerName",
          label: "Buyer Company Name",
          type: "text",
          required: true,
        },
        {
          key: "buyerAddress",
          label: "Buyer Address & Country",
          type: "textarea",
          required: true,
        },
        {
          key: "commodity",
          label: "Commodity / Products",
          type: "text",
          required: true,
        },
        { key: "quantity", label: "Quantity", type: "text", required: true },
        { key: "price", label: "Contract Price", type: "text", required: true },
        {
          key: "currency",
          label: "Currency",
          type: "select",
          required: true,
          options: ["USD", "EUR", "GBP", "INR"],
        },
        {
          key: "deliveryTerms",
          label: "Delivery Terms",
          type: "select",
          required: true,
          options: ["FOB", "CIF", "CFR", "EXW", "DDP"],
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "text",
          required: true,
        },
        {
          key: "shipmentDate",
          label: "Shipment Date",
          type: "date",
          required: true,
        },
        {
          key: "portOfLoading",
          label: "Port of Loading",
          type: "text",
          required: true,
        },
        {
          key: "portOfDischarge",
          label: "Port of Discharge",
          type: "text",
          required: true,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    // Business Agreements
    {
      id: "tpl-sales-agreement",
      name: "Sales Agreement",
      category: Category.agreement,
      description: "Formal agreement for sale of goods or services",
      fields: JSON.stringify([
        {
          key: "buyerName",
          label: "Buyer Name / Company",
          type: "text",
          required: true,
        },
        {
          key: "buyerAddress",
          label: "Buyer Address",
          type: "textarea",
          required: true,
        },
        {
          key: "productService",
          label: "Product / Service Description",
          type: "textarea",
          required: true,
        },
        {
          key: "amount",
          label: "Agreement Amount (₹)",
          type: "number",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        {
          key: "deliveryDate",
          label: "Delivery / Completion Date",
          type: "date",
          required: true,
        },
        {
          key: "paymentTerms",
          label: "Payment Terms",
          type: "textarea",
          required: true,
        },
        {
          key: "warrantyTerms",
          label: "Warranty / Guarantee Terms",
          type: "textarea",
          required: false,
        },
        {
          key: "disputeResolution",
          label: "Dispute Resolution",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-nda",
      name: "Non-Disclosure Agreement",
      category: Category.agreement,
      description: "Protect confidential business information",
      fields: JSON.stringify([
        {
          key: "party1Name",
          label: "Disclosing Party Name",
          type: "text",
          required: true,
        },
        {
          key: "party2Name",
          label: "Receiving Party Name",
          type: "text",
          required: true,
        },
        {
          key: "party2Address",
          label: "Receiving Party Address",
          type: "textarea",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        {
          key: "duration",
          label: "Duration (years)",
          type: "number",
          required: true,
        },
        {
          key: "purposeOfDisclosure",
          label: "Purpose of Disclosure",
          type: "textarea",
          required: true,
        },
        {
          key: "confidentialInfo",
          label: "Types of Confidential Information",
          type: "textarea",
          required: true,
        },
        {
          key: "jurisdiction",
          label: "Governing Law / Jurisdiction",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-agency-agreement",
      name: "Agency Agreement",
      category: Category.agreement,
      description: "Appointment of sales agent or representative",
      fields: JSON.stringify([
        {
          key: "principalName",
          label: "Principal (Company) Name",
          type: "text",
          required: true,
        },
        {
          key: "agentName",
          label: "Agent Name / Company",
          type: "text",
          required: true,
        },
        {
          key: "agentAddress",
          label: "Agent Address",
          type: "textarea",
          required: true,
        },
        {
          key: "territory",
          label: "Territory / Region",
          type: "text",
          required: true,
        },
        {
          key: "products",
          label: "Products / Services",
          type: "textarea",
          required: true,
        },
        {
          key: "commission",
          label: "Commission Rate (%)",
          type: "number",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        { key: "duration", label: "Duration", type: "text", required: true },
        {
          key: "terminationNotice",
          label: "Termination Notice Period",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-commission-agreement",
      name: "Commission Agreement",
      category: Category.agreement,
      description: "Agreement defining commission structure for intermediaries",
      fields: JSON.stringify([
        {
          key: "payerName",
          label: "Payer / Company Name",
          type: "text",
          required: true,
        },
        {
          key: "payeeName",
          label: "Payee / Agent Name",
          type: "text",
          required: true,
        },
        {
          key: "payeeAddress",
          label: "Payee Address",
          type: "textarea",
          required: true,
        },
        {
          key: "serviceDescription",
          label: "Service / Role Description",
          type: "textarea",
          required: true,
        },
        {
          key: "commissionRate",
          label: "Commission Rate (%)",
          type: "number",
          required: true,
        },
        {
          key: "commissionBasis",
          label: "Commission Basis",
          type: "text",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        {
          key: "paymentSchedule",
          label: "Payment Schedule",
          type: "text",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-purchase-agreement",
      name: "Purchase Agreement",
      category: Category.agreement,
      description: "Agreement for purchase of assets or goods",
      fields: JSON.stringify([
        {
          key: "sellerName",
          label: "Seller Name / Company",
          type: "text",
          required: true,
        },
        {
          key: "sellerAddress",
          label: "Seller Address",
          type: "textarea",
          required: true,
        },
        {
          key: "assetDescription",
          label: "Asset / Goods Description",
          type: "textarea",
          required: true,
        },
        {
          key: "purchasePrice",
          label: "Purchase Price (₹)",
          type: "number",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Agreement Date",
          type: "date",
          required: true,
        },
        {
          key: "deliveryDate",
          label: "Delivery / Transfer Date",
          type: "date",
          required: true,
        },
        {
          key: "paymentSchedule",
          label: "Payment Schedule",
          type: "textarea",
          required: true,
        },
        {
          key: "conditions",
          label: "Conditions / Warranties",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tpl-facilitation-agreement",
      name: "Facilitation Agreement",
      category: Category.agreement,
      description: "Agreement for business facilitation services",
      fields: JSON.stringify([
        {
          key: "facilityProviderName",
          label: "Facilitator Name",
          type: "text",
          required: true,
        },
        {
          key: "facilityProviderAddress",
          label: "Facilitator Address",
          type: "textarea",
          required: true,
        },
        {
          key: "clientName",
          label: "Client Name",
          type: "text",
          required: true,
        },
        {
          key: "serviceScope",
          label: "Scope of Facilitation Services",
          type: "textarea",
          required: true,
        },
        {
          key: "fees",
          label: "Facilitation Fee (₹)",
          type: "number",
          required: true,
        },
        {
          key: "effectiveDate",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        { key: "duration", label: "Duration", type: "text", required: true },
        {
          key: "obligations",
          label: "Obligations of Both Parties",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
