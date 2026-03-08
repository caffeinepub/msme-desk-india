import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GovernmentScheme {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    documentChecklist: Array<string>;
    benefits: string;
    eligibilityCriteria: string;
    applicationLink: string;
    ministryName: string;
}
export interface DocumentTemplate {
    id: string;
    name: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    fields: string;
    updatedAt: bigint;
    category: Category;
}
export interface DocumentRecord {
    id: string;
    categoryText: string;
    templateId: string;
    userId: Principal;
    createdAt: bigint;
    fieldValues: string;
    templateName: string;
    category: Category;
}
export interface Shipment {
    id: string;
    status: string;
    trackingNumber: string;
    destination: string;
    userId: Principal;
    origin: string;
    dispatchDate: bigint;
    deliveryDate: bigint;
    orderId: string;
    carrier: string;
}
export interface Contact {
    id: string;
    contactType: string;
    userId: Principal;
    name: string;
    createdAt: bigint;
    email: string;
    company: string;
    gstin: string;
    notes: string;
    category: string;
    phone: string;
}
export interface UserProfileSummary {
    principal: Principal;
    businessName: string;
    email: string;
    profileComplete: boolean;
}
export interface Payment {
    id: string;
    status: string;
    userId: Principal;
    mode: string;
    dueDate: bigint;
    orderId: string;
    paidDate: bigint;
    notes: string;
    amount: number;
}
export interface UsageStats {
    documentsPerDay: Array<[bigint, bigint]>;
    totalActiveUsers: bigint;
    topTemplates: Array<[string, bigint]>;
}
export interface Order {
    id: string;
    status: string;
    userId: Principal;
    deliveryDate: bigint;
    orderDate: bigint;
    totalAmount: number;
    contactId: string;
    items: string;
    orderNumber: string;
}
export interface BusinessProfile {
    pan: string;
    ifscCode: string;
    createdAt: bigint;
    businessName: string;
    logoAssetId?: Uint8Array;
    email: string;
    bankName: string;
    signatoryDesignation: string;
    authorizedSignatory: string;
    updatedAt: bigint;
    signatureAssetId?: Uint8Array;
    gstin: string;
    address: string;
    iecCode: string;
    accountNumber: string;
    branchName: string;
    phone: string;
    profileComplete: boolean;
    udyamNumber: string;
}
export enum Category {
    trade = "trade",
    agreement = "agreement",
    export_ = "export"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkSchemeEligibility(questionnaire: string): Promise<Array<string>>;
    createContact(contact: Contact): Promise<void>;
    createDocumentRecord(record: DocumentRecord): Promise<void>;
    createGovernmentScheme(scheme: GovernmentScheme): Promise<void>;
    createOrder(order: Order): Promise<void>;
    createPayment(payment: Payment): Promise<void>;
    createShipment(shipment: Shipment): Promise<void>;
    createTemplate(template: DocumentTemplate): Promise<void>;
    deleteContact(contactId: string): Promise<void>;
    deleteGovernmentScheme(schemeId: string): Promise<void>;
    deleteOrder(orderId: string): Promise<void>;
    deletePayment(paymentId: string): Promise<void>;
    deleteShipment(shipmentId: string): Promise<void>;
    deleteTemplate(templateId: string): Promise<void>;
    getAllSchemes(): Promise<Array<GovernmentScheme>>;
    getAllTemplates(): Promise<Array<DocumentTemplate>>;
    getCallerUserProfile(): Promise<BusinessProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContact(contactId: string): Promise<Contact | null>;
    getContacts(): Promise<Array<Contact>>;
    getDocumentRecords(page: bigint, pageSize: bigint): Promise<Array<DocumentRecord>>;
    getGovernmentScheme(schemeId: string): Promise<GovernmentScheme | null>;
    getOrder(orderId: string): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getPayment(paymentId: string): Promise<Payment | null>;
    getPayments(): Promise<Array<Payment>>;
    getProfile(): Promise<BusinessProfile | null>;
    getShipment(shipmentId: string): Promise<Shipment | null>;
    getShipments(): Promise<Array<Shipment>>;
    getTemplate(templateId: string): Promise<DocumentTemplate | null>;
    getUsageStats(): Promise<UsageStats>;
    getUserProfile(user: Principal): Promise<BusinessProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<UserProfileSummary>>;
    saveCallerUserProfile(profile: BusinessProfile): Promise<void>;
    updateContact(contactId: string, contact: Contact): Promise<void>;
    updateGovernmentScheme(schemeId: string, scheme: GovernmentScheme): Promise<void>;
    updateOrder(orderId: string, order: Order): Promise<void>;
    updatePayment(paymentId: string, payment: Payment): Promise<void>;
    updateShipment(shipmentId: string, shipment: Shipment): Promise<void>;
    updateTemplate(templateId: string, template: DocumentTemplate): Promise<void>;
    upsertProfile(profile: BusinessProfile): Promise<void>;
}
