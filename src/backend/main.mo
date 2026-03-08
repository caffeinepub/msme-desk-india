import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

//  Main actor.
actor {
  // =====================
  // State
  // =====================
  let storage = Map.empty<Text, Blob>();
  let businessProfiles = Map.empty<Principal, BusinessProfile>();
  include MixinStorage();
  let templates = Map.empty<Text, DocumentTemplate>();
  let schemes = Map.empty<Text, GovernmentScheme>();
  let documentRecords = Map.empty<Text, DocumentRecord>();
  let contacts = Map.empty<Text, Contact>();
  let orders = Map.empty<Text, Order>();
  let shipments = Map.empty<Text, Shipment>();
  let payments = Map.empty<Text, Payment>();
  let eligibilityResults = Map.empty<Text, SchemeEligibilityResult>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // =====================
  // Types
  // =====================
  type Category = {
    #trade;
    #export;
    #agreement;
  };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      switch (category1, category2) {
        case (#trade, #trade) { #equal };
        case (#trade, _) { #less };
        case (#export, #trade) { #greater };
        case (#export, #export) { #equal };
        case (#export, #agreement) { #less };
        case (#agreement, _) { #greater };
      };
    };

    public func toText(category : Category) : Text {
      switch (category) {
        case (#trade) { "Trade" };
        case (#export) { "Export" };
        case (#agreement) { "Agreement" };
      };
    };
  };

  type DocumentRecord = {
    id : Text;
    userId : Principal;
    templateId : Text;
    templateName : Text;
    category : Category;
    fieldValues : Text;
    createdAt : Int;
    categoryText : Text;
  };

  type DocumentTemplate = {
    id : Text;
    name : Text;
    category : Category;
    description : Text;
    fields : Text;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type GovernmentScheme = {
    id : Text;
    name : Text;
    description : Text;
    ministryName : Text;
    eligibilityCriteria : Text;
    benefits : Text;
    documentChecklist : [Text];
    applicationLink : Text;
    isActive : Bool;
  };

  type Contact = {
    id : Text;
    userId : Principal;
    contactType : Text;
    name : Text;
    company : Text;
    email : Text;
    phone : Text;
    gstin : Text;
    category : Text;
    notes : Text;
    createdAt : Int;
  };

  type Order = {
    id : Text;
    userId : Principal;
    contactId : Text;
    orderNumber : Text;
    items : Text;
    totalAmount : Float;
    status : Text;
    orderDate : Int;
    deliveryDate : Int;
  };

  type Shipment = {
    id : Text;
    userId : Principal;
    orderId : Text;
    carrier : Text;
    trackingNumber : Text;
    origin : Text;
    destination : Text;
    status : Text;
    dispatchDate : Int;
    deliveryDate : Int;
  };

  type Payment = {
    id : Text;
    userId : Principal;
    orderId : Text;
    amount : Float;
    mode : Text;
    status : Text;
    dueDate : Int;
    paidDate : Int;
    notes : Text;
  };

  type BusinessProfile = {
    businessName : Text;
    address : Text;
    phone : Text;
    email : Text;
    gstin : Text;
    pan : Text;
    iecCode : Text;
    udyamNumber : Text;
    bankName : Text;
    accountNumber : Text;
    ifscCode : Text;
    branchName : Text;
    authorizedSignatory : Text;
    signatoryDesignation : Text;
    logoAssetId : ?Blob;
    signatureAssetId : ?Blob;
    profileComplete : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type SchemeEligibilityResult = {
    id : Text;
    userId : Principal;
    questionnaire : Text;
    eligibleSchemeIds : [Text];
    createdAt : Int;
  };

  type UserProfileSummary = {
    principal : Principal;
    businessName : Text;
    email : Text;
    profileComplete : Bool;
  };

  type UsageStats = {
    documentsPerDay : [(Int, Nat)];
    topTemplates : [(Text, Nat)];
    totalActiveUsers : Nat;
  };

  // ===============================
  // User Profile Functions (Required by Frontend)
  // ===============================
  public query ({ caller }) func getCallerUserProfile() : async ?BusinessProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    businessProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?BusinessProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    businessProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : BusinessProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    businessProfiles.add(caller, profile);
  };

  // ===============================
  // Business Profile Management
  // ===============================
  public shared ({ caller }) func upsertProfile(profile : BusinessProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    businessProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile() : async ?BusinessProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    businessProfiles.get(caller);
  };

  // ===============================
  // Document Management
  // ===============================
  public shared ({ caller }) func createDocumentRecord(record : DocumentRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };
    if (record.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create documents for other users");
    };
    documentRecords.add(record.id, record);
  };

  func persistentSlice(array : [DocumentRecord], start : Nat, end : Nat) : [DocumentRecord] {
    var list = List.empty<DocumentRecord>();
    for (i in Nat.range(start, end)) {
      if (i < array.size()) {
        list.add(array[i]);
      };
    };
    list.reverse().toArray();
  };

  public query ({ caller }) func getDocumentRecords(page : Nat, pageSize : Nat) : async [DocumentRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };

    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let allRecords = documentRecords.values().toArray();

    let filteredRecords = if (isAdminUser) {
      allRecords;
    } else {
      allRecords.filter(func(record) { record.userId == caller });
    };

    let startIdx = page * pageSize;
    let endIdx = Nat.min(startIdx + pageSize, filteredRecords.size());

    if (startIdx >= filteredRecords.size()) {
      return [];
    };

    persistentSlice(filteredRecords, startIdx, endIdx);
  };

  // ===============================
  // Template Management (Admin Only)
  // ===============================
  public shared ({ caller }) func createTemplate(template : DocumentTemplate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create templates");
    };
    templates.add(template.id, template);
  };

  public shared ({ caller }) func updateTemplate(templateId : Text, template : DocumentTemplate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update templates");
    };
    templates.add(templateId, template);
  };

  public shared ({ caller }) func deleteTemplate(templateId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete templates");
    };
    templates.remove(templateId);
  };

  public query ({ caller }) func getTemplate(templateId : Text) : async ?DocumentTemplate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    templates.get(templateId);
  };

  public query ({ caller }) func getAllTemplates() : async [DocumentTemplate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    templates.values().toArray();
  };

  // ===============================
  // Government Scheme Management (Admin Only)
  // ===============================
  public shared ({ caller }) func createGovernmentScheme(scheme : GovernmentScheme) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create schemes");
    };
    schemes.add(scheme.id, scheme);
  };

  public shared ({ caller }) func updateGovernmentScheme(schemeId : Text, scheme : GovernmentScheme) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update schemes");
    };
    schemes.add(schemeId, scheme);
  };

  public shared ({ caller }) func deleteGovernmentScheme(schemeId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete schemes");
    };
    schemes.remove(schemeId);
  };

  public query ({ caller }) func getGovernmentScheme(schemeId : Text) : async ?GovernmentScheme {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view schemes");
    };
    schemes.get(schemeId);
  };

  public query ({ caller }) func getAllSchemes() : async [GovernmentScheme] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view schemes");
    };
    schemes.values().toArray();
  };

  // ===============================
  // Scheme Eligibility Check
  // ===============================
  public shared ({ caller }) func checkSchemeEligibility(questionnaire : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check eligibility");
    };

    let eligibleIds : [Text] = [];
    let result : SchemeEligibilityResult = {
      id = caller.toText() # "-" # Int.toText(Time.now());
      userId = caller;
      questionnaire = questionnaire;
      eligibleSchemeIds = eligibleIds;
      createdAt = Time.now();
    };

    eligibilityResults.add(result.id, result);
    eligibleIds;
  };

  // ===============================
  // CRM - Contact Management
  // ===============================
  public shared ({ caller }) func createContact(contact : Contact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create contacts");
    };
    if (contact.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create contacts for other users");
    };
    contacts.add(contact.id, contact);
  };

  public shared ({ caller }) func updateContact(contactId : Text, contact : Contact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update contacts");
    };

    switch (contacts.get(contactId)) {
      case null { Runtime.trap("Contact not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot update other users' contacts");
        };
        contacts.add(contactId, contact);
      };
    };
  };

  public shared ({ caller }) func deleteContact(contactId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete contacts");
    };

    switch (contacts.get(contactId)) {
      case null { Runtime.trap("Contact not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete other users' contacts");
        };
        contacts.remove(contactId);
      };
    };
  };

  public query ({ caller }) func getContact(contactId : Text) : async ?Contact {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contacts");
    };

    switch (contacts.get(contactId)) {
      case null { null };
      case (?contact) {
        if (contact.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view other users' contacts");
        };
        ?contact;
      };
    };
  };

  public query ({ caller }) func getContacts() : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view contacts");
    };

    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let allContacts = contacts.values().toArray();

    if (isAdminUser) {
      allContacts;
    } else {
      allContacts.filter<Contact>(func(contact) { contact.userId == caller });
    };
  };

  // ===============================
  // CRM - Order Management
  // ===============================
  public shared ({ caller }) func createOrder(order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    if (order.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create orders for other users");
    };
    orders.add(order.id, order);
  };

  public shared ({ caller }) func updateOrder(orderId : Text, order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update orders");
    };

    switch (orders.get(orderId)) {
      case null { Runtime.trap("Order not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot update other users' orders");
        };
        orders.add(orderId, order);
      };
    };
  };

  public shared ({ caller }) func deleteOrder(orderId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete orders");
    };

    switch (orders.get(orderId)) {
      case null { Runtime.trap("Order not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete other users' orders");
        };
        orders.remove(orderId);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case null { null };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view other users' orders");
        };
        ?order;
      };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let allOrders = orders.values().toArray();

    if (isAdminUser) {
      allOrders;
    } else {
      allOrders.filter<Order>(func(order) { order.userId == caller });
    };
  };

  // ===============================
  // CRM - Shipment Management
  // ===============================
  public shared ({ caller }) func createShipment(shipment : Shipment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create shipments");
    };
    if (shipment.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create shipments for other users");
    };
    shipments.add(shipment.id, shipment);
  };

  public shared ({ caller }) func updateShipment(shipmentId : Text, shipment : Shipment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update shipments");
    };

    switch (shipments.get(shipmentId)) {
      case null { Runtime.trap("Shipment not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot update other users' shipments");
        };
        shipments.add(shipmentId, shipment);
      };
    };
  };

  public shared ({ caller }) func deleteShipment(shipmentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete shipments");
    };

    switch (shipments.get(shipmentId)) {
      case null { Runtime.trap("Shipment not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete other users' shipments");
        };
        shipments.remove(shipmentId);
      };
    };
  };

  public query ({ caller }) func getShipment(shipmentId : Text) : async ?Shipment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view shipments");
    };

    switch (shipments.get(shipmentId)) {
      case null { null };
      case (?shipment) {
        if (shipment.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view other users' shipments");
        };
        ?shipment;
      };
    };
  };

  public query ({ caller }) func getShipments() : async [Shipment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view shipments");
    };

    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let allShipments = shipments.values().toArray();

    if (isAdminUser) {
      allShipments;
    } else {
      allShipments.filter<Shipment>(func(shipment) { shipment.userId == caller });
    };
  };

  // ===============================
  // CRM - Payment Management
  // ===============================
  public shared ({ caller }) func createPayment(payment : Payment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create payments");
    };
    if (payment.userId != caller) {
      Runtime.trap("Unauthorized: Cannot create payments for other users");
    };
    payments.add(payment.id, payment);
  };

  public shared ({ caller }) func updatePayment(paymentId : Text, payment : Payment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payments");
    };

    switch (payments.get(paymentId)) {
      case null { Runtime.trap("Payment not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot update other users' payments");
        };
        payments.add(paymentId, payment);
      };
    };
  };

  public shared ({ caller }) func deletePayment(paymentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete payments");
    };

    switch (payments.get(paymentId)) {
      case null { Runtime.trap("Payment not found") };
      case (?existing) {
        if (existing.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot delete other users' payments");
        };
        payments.remove(paymentId);
      };
    };
  };

  public query ({ caller }) func getPayment(paymentId : Text) : async ?Payment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    switch (payments.get(paymentId)) {
      case null { null };
      case (?payment) {
        if (payment.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view other users' payments");
        };
        ?payment;
      };
    };
  };

  public query ({ caller }) func getPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    let allPayments = payments.values().toArray();

    if (isAdminUser) {
      allPayments;
    } else {
      allPayments.filter<Payment>(func(payment) { payment.userId == caller });
    };
  };

  // ===============================
  // Admin Functions
  // ===============================
  public query ({ caller }) func listAllUsers() : async [UserProfileSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };

    let profiles = businessProfiles.entries().toArray();
    profiles.map<(Principal, BusinessProfile), UserProfileSummary>(
      func((principal, profile)) {
        {
          principal = principal;
          businessName = profile.businessName;
          email = profile.email;
          profileComplete = profile.profileComplete;
        };
      }
    );
  };

  public query ({ caller }) func getUsageStats() : async UsageStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view usage stats");
    };

    {
      documentsPerDay = [];
      topTemplates = [];
      totalActiveUsers = businessProfiles.size();
    };
  };
};
