// Portable ERP — Static Data Store
// All data lives here. Session overrides via sessionStorage.

const ERPDATA = (() => {
  const PRODUCTS_KEY = 'erp_products';
  const LEDGER_KEY = 'erp_ledger';
  const PURCHASES_KEY = 'erp_purchases';
  const SALES_KEY = 'erp_sales';
  const JOBS_KEY = 'erp_jobs';
  const USERS_KEY = 'erp_users';

  // Demo user accounts (localStorage). Passwords are demo-only — not for production.
  const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', fullName: 'Admin User', email: 'admin@company.com', department: 'Management', role: 'admin' },
    { id: 2, username: 'manager', password: 'mgr123', fullName: 'Sarah Johnson', email: 'sarah@company.com', department: 'Operations', role: 'manager' },
    { id: 3, username: 'operator', password: 'ops123', fullName: 'Mike Chen', email: 'mike@company.com', department: 'Production', role: 'operator' },
  ];

  function getUsers() {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultUsers));
  }

  function setUsers(arr) {
    localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  }

  function addUser(rec) {
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === rec.username.toLowerCase())) return { ok: false, error: 'Username already exists' };
    const id = nextId(users);
    users.push({ id, ...rec });
    setUsers(users);
    return { ok: true, user: users[users.length - 1] };
  }

  function updateUser(id, patch) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { ok: false, error: 'User not found' };
    if (patch.username && users.some(u => u.id !== id && u.username.toLowerCase() === patch.username.toLowerCase())) {
      return { ok: false, error: 'Username already taken' };
    }
    users[idx] = { ...users[idx], ...patch };
    setUsers(users);
    return { ok: true, user: users[idx] };
  }

  function deleteUser(id) {
    const users = getUsers();
    const next = users.filter(u => u.id !== id);
    if (next.length === users.length) return { ok: false, error: 'User not found' };
    setUsers(next);
    return { ok: true };
  }

  function findUserForLogin(username, password) {
    const users = getUsers();
    return users.find(u => u.username.toLowerCase() === String(username).toLowerCase().trim() && u.password === password) || null;
  }

  function countAdmins() {
    return getUsers().filter(u => u.role === 'admin').length;
  }

  const defaultProducts = [
    { id:1, sku:'RAW-STL-001', name:'Steel Rod (12mm)', category:'Raw Materials', unit:'kg', costPrice:2.50, salePrice:3.80, stockQty:480, reorderPoint:100, location:'Rack A1', description:'Mild steel rod 12mm diameter' },
    { id:2, sku:'RAW-ALM-002', name:'Aluminium Sheet (2mm)', category:'Raw Materials', unit:'kg', costPrice:4.20, salePrice:6.00, stockQty:215, reorderPoint:50, location:'Rack A2', description:'2mm aluminium sheet 1200x2400' },
    { id:3, sku:'RAW-CPR-003', name:'Copper Wire (1.5mm)', category:'Raw Materials', unit:'roll', costPrice:18.00, salePrice:26.00, stockQty:80, reorderPoint:20, location:'Rack B1', description:'Electrical copper wire 1.5mm 100m roll' },
    { id:4, sku:'PKG-BOX-010', name:'Cardboard Box (Large)', category:'Packaging', unit:'pcs', costPrice:0.85, salePrice:1.50, stockQty:620, reorderPoint:200, location:'Rack C1', description:'Large cardboard box 600x400x350mm' },
    { id:5, sku:'PKG-TAP-011', name:'Packing Tape 50mm', category:'Packaging', unit:'roll', costPrice:1.20, salePrice:2.00, stockQty:145, reorderPoint:50, location:'Rack C2', description:'Brown packing tape 50mm x 66m' },
    { id:6, sku:'FIN-MTR-020', name:'Electric Motor 1HP', category:'Finished Goods', unit:'pcs', costPrice:120.00, salePrice:185.00, stockQty:28, reorderPoint:10, location:'Shelf D1', description:'Single phase 1HP electric motor' },
    { id:7, sku:'FIN-PMP-021', name:'Water Pump 0.5HP', category:'Finished Goods', unit:'pcs', costPrice:95.00, salePrice:148.00, stockQty:15, reorderPoint:10, location:'Shelf D2', description:'Centrifugal water pump 0.5HP' },
    { id:8, sku:'CON-LUB-030', name:'Machine Oil (1L)', category:'Consumables', unit:'litre', costPrice:5.50, salePrice:9.00, stockQty:72, reorderPoint:30, location:'Rack E1', description:'ISO VG 68 machine lubricant 1L' },
    { id:9, sku:'CON-GRS-031', name:'Bearing Grease (500g)', category:'Consumables', unit:'tin', costPrice:3.80, salePrice:6.50, stockQty:8, reorderPoint:15, location:'Rack E2', description:'Multipurpose bearing grease 500g tin' },
    { id:10, sku:'TOL-DRL-040', name:'Drill Bit Set (HSS)', category:'Tools', unit:'set', costPrice:22.00, salePrice:38.00, stockQty:32, reorderPoint:10, location:'Tool Room', description:'HSS drill bit set 1-13mm 25pcs' },
  ];

  const defaultLedger = [
    { id:1, productId:1, productName:'Steel Rod (12mm)', productSku:'RAW-STL-001', type:'purchase', qty:200, unitCost:2.50, totalValue:500.00, reference:'PO-2024-001', notes:'Initial stock purchase', createdAt:'2024-12-01T09:00:00', createdBy:'admin' },
    { id:2, productId:2, productName:'Aluminium Sheet (2mm)', productSku:'RAW-ALM-002', type:'purchase', qty:100, unitCost:4.20, totalValue:420.00, reference:'PO-2024-001', notes:'Initial stock purchase', createdAt:'2024-12-01T09:10:00', createdBy:'admin' },
    { id:3, productId:6, productName:'Electric Motor 1HP', productSku:'FIN-MTR-020', type:'sale', qty:-5, unitCost:120.00, totalValue:-600.00, reference:'SO-2024-001', notes:'Customer order', createdAt:'2024-12-05T14:00:00', createdBy:'manager' },
    { id:4, productId:1, productName:'Steel Rod (12mm)', productSku:'RAW-STL-001', type:'job', qty:-30, unitCost:2.50, totalValue:-75.00, reference:'JOB-2024-001', notes:'Used in motor assembly', createdAt:'2024-12-08T10:30:00', createdBy:'operator' },
    { id:5, productId:3, productName:'Copper Wire (1.5mm)', productSku:'RAW-CPR-003', type:'purchase', qty:40, unitCost:18.00, totalValue:720.00, reference:'PO-2024-002', notes:'Restock order', createdAt:'2024-12-10T11:00:00', createdBy:'admin' },
    { id:6, productId:7, productName:'Water Pump 0.5HP', productSku:'FIN-PMP-021', type:'sale', qty:-3, unitCost:95.00, totalValue:-285.00, reference:'SO-2024-002', notes:'Bulk order', createdAt:'2024-12-12T15:30:00', createdBy:'manager' },
    { id:7, productId:9, productName:'Bearing Grease (500g)', productSku:'CON-GRS-031', type:'adjustment', qty:-2, unitCost:3.80, totalValue:-7.60, reference:'ADJ-001', notes:'Damaged stock write-off', createdAt:'2024-12-15T09:00:00', createdBy:'admin' },
    { id:8, productId:4, productName:'Cardboard Box (Large)', productSku:'PKG-BOX-010', type:'purchase', qty:500, unitCost:0.85, totalValue:425.00, reference:'PO-2024-003', notes:'Packaging restock', createdAt:'2025-01-02T10:00:00', createdBy:'admin' },
    { id:9, productId:6, productName:'Electric Motor 1HP', productSku:'FIN-MTR-020', type:'sale', qty:-8, unitCost:120.00, totalValue:-960.00, reference:'SO-2024-003', notes:'Dealer order', createdAt:'2025-01-10T13:00:00', createdBy:'manager' },
    { id:10, productId:2, productName:'Aluminium Sheet (2mm)', productSku:'RAW-ALM-002', type:'job', qty:-20, unitCost:4.20, totalValue:-84.00, reference:'JOB-2024-002', notes:'Used in pump casing', createdAt:'2025-01-15T11:00:00', createdBy:'operator' },
  ];

  const defaultPurchases = [
    { id:1, poNumber:'PO-2024-001', supplier:'MetalMart Supplies', status:'received', orderDate:'2024-12-01', expectedDate:'2024-12-08', receivedDate:'2024-12-06', totalAmount:920.00, notes:'Initial raw material order', items:[{id:1,productId:1,productName:'Steel Rod (12mm)',productSku:'RAW-STL-001',qty:200,unitCost:2.50,totalCost:500.00},{id:2,productId:2,productName:'Aluminium Sheet (2mm)',productSku:'RAW-ALM-002',qty:100,unitCost:4.20,totalCost:420.00}] },
    { id:2, poNumber:'PO-2024-002', supplier:'ElectroParts Ltd', status:'received', orderDate:'2024-12-10', expectedDate:'2024-12-17', receivedDate:'2024-12-15', totalAmount:720.00, notes:'Copper wire restock', items:[{id:3,productId:3,productName:'Copper Wire (1.5mm)',productSku:'RAW-CPR-003',qty:40,unitCost:18.00,totalCost:720.00}] },
    { id:3, poNumber:'PO-2024-003', supplier:'PackPro Packaging', status:'received', orderDate:'2025-01-02', expectedDate:'2025-01-09', receivedDate:'2025-01-07', totalAmount:597.00, notes:'Packaging materials', items:[{id:4,productId:4,productName:'Cardboard Box (Large)',productSku:'PKG-BOX-010',qty:500,unitCost:0.85,totalCost:425.00},{id:5,productId:5,productName:'Packing Tape 50mm',productSku:'PKG-TAP-011',qty:144,unitCost:1.20,totalCost:172.00}] },
    { id:4, poNumber:'PO-2025-004', supplier:'MetalMart Supplies', status:'pending', orderDate:'2025-03-15', expectedDate:'2025-03-25', receivedDate:null, totalAmount:650.00, notes:'Quarterly steel restock', items:[{id:6,productId:1,productName:'Steel Rod (12mm)',productSku:'RAW-STL-001',qty:200,unitCost:2.50,totalCost:500.00},{id:7,productId:8,productName:'Machine Oil (1L)',productSku:'CON-LUB-030',qty:30,unitCost:5.00,totalCost:150.00}] },
    { id:5, poNumber:'PO-2025-005', supplier:'ToolSource Direct', status:'pending', orderDate:'2025-03-28', expectedDate:'2025-04-05', receivedDate:null, totalAmount:440.00, notes:'Tool replenishment', items:[{id:8,productId:10,productName:'Drill Bit Set (HSS)',productSku:'TOL-DRL-040',qty:20,unitCost:22.00,totalCost:440.00}] },
  ];

  const defaultSales = [
    { id:1, soNumber:'SO-2024-001', customer:'Buildex Construction', status:'delivered', orderDate:'2024-12-05', deliveryDate:'2024-12-07', totalAmount:925.00, notes:'Urgent delivery', items:[{id:1,productId:6,productName:'Electric Motor 1HP',productSku:'FIN-MTR-020',qty:5,unitPrice:185.00,totalPrice:925.00}] },
    { id:2, soNumber:'SO-2024-002', customer:'AquaTech Solutions', status:'delivered', orderDate:'2024-12-12', deliveryDate:'2024-12-16', totalAmount:444.00, notes:'Regular monthly order', items:[{id:2,productId:7,productName:'Water Pump 0.5HP',productSku:'FIN-PMP-021',qty:3,unitPrice:148.00,totalPrice:444.00}] },
    { id:3, soNumber:'SO-2024-003', customer:'PowerGrid Dealers', status:'delivered', orderDate:'2025-01-10', deliveryDate:'2025-01-14', totalAmount:1480.00, notes:'Dealer bulk order', items:[{id:3,productId:6,productName:'Electric Motor 1HP',productSku:'FIN-MTR-020',qty:8,unitPrice:185.00,totalPrice:1480.00}] },
    { id:4, soNumber:'SO-2025-004', customer:'Buildex Construction', status:'shipped', orderDate:'2025-03-20', deliveryDate:'2025-03-26', totalAmount:592.00, notes:'Follow-up order', items:[{id:4,productId:7,productName:'Water Pump 0.5HP',productSku:'FIN-PMP-021',qty:4,unitPrice:148.00,totalPrice:592.00}] },
    { id:5, soNumber:'SO-2025-005', customer:'Sigma Tools & Equipment', status:'pending', orderDate:'2025-04-01', deliveryDate:null, totalAmount:950.00, notes:'New customer first order', items:[{id:5,productId:10,productName:'Drill Bit Set (HSS)',productSku:'TOL-DRL-040',qty:25,unitPrice:38.00,totalPrice:950.00}] },
  ];

  const defaultJobs = [
    { id:1, jobNumber:'JOB-2024-001', title:'Motor Assembly Batch #1', description:'Assemble 10 units of 1HP electric motors for Q4 delivery', status:'completed', priority:'high', assignedTo:'Ravi Patel', startDate:'2024-12-05', dueDate:'2024-12-20', completedDate:'2024-12-18', totalMaterialCost:375.00, notes:'Completed ahead of schedule', materials:[{id:1,productId:1,productName:'Steel Rod (12mm)',productSku:'RAW-STL-001',qtyRequired:30,qtyUsed:30,unitCost:2.50},{id:2,productId:3,productName:'Copper Wire (1.5mm)',productSku:'RAW-CPR-003',qtyRequired:10,qtyUsed:10,unitCost:18.00},{id:3,productId:8,productName:'Machine Oil (1L)',productSku:'CON-LUB-030',qtyRequired:5,qtyUsed:5,unitCost:5.50}] },
    { id:2, jobNumber:'JOB-2024-002', title:'Pump Casing Fabrication', description:'Fabricate aluminium casings for water pump series', status:'completed', priority:'medium', assignedTo:'Suresh Kumar', startDate:'2025-01-10', dueDate:'2025-01-25', completedDate:'2025-01-22', totalMaterialCost:288.60, notes:'Minor rework on 2 units', materials:[{id:4,productId:2,productName:'Aluminium Sheet (2mm)',productSku:'RAW-ALM-002',qtyRequired:20,qtyUsed:20,unitCost:4.20},{id:5,productId:9,productName:'Bearing Grease (500g)',productSku:'CON-GRS-031',qtyRequired:6,qtyUsed:6,unitCost:3.80},{id:6,productId:8,productName:'Machine Oil (1L)',productSku:'CON-LUB-030',qtyRequired:4,qtyUsed:4,unitCost:5.50}] },
    { id:3, jobNumber:'JOB-2025-003', title:'Motor Assembly Batch #2', description:'Assemble 15 units of 1HP motors for Q1 pipeline', status:'in_progress', priority:'high', assignedTo:'Ravi Patel', startDate:'2025-03-10', dueDate:'2025-04-05', completedDate:null, totalMaterialCost:562.50, notes:'50% complete, on track', materials:[{id:7,productId:1,productName:'Steel Rod (12mm)',productSku:'RAW-STL-001',qtyRequired:45,qtyUsed:20,unitCost:2.50},{id:8,productId:3,productName:'Copper Wire (1.5mm)',productSku:'RAW-CPR-003',qtyRequired:15,qtyUsed:8,unitCost:18.00},{id:9,productId:8,productName:'Machine Oil (1L)',productSku:'CON-LUB-030',qtyRequired:8,qtyUsed:3,unitCost:5.50}] },
    { id:4, jobNumber:'JOB-2025-004', title:'Maintenance Kit Assembly', description:'Assemble 50 maintenance kits with grease, oil and drill bits', status:'planned', priority:'low', assignedTo:'Meera Nair', startDate:'2025-04-10', dueDate:'2025-04-20', completedDate:null, totalMaterialCost:465.00, notes:'Awaiting material confirmation', materials:[{id:10,productId:9,productName:'Bearing Grease (500g)',productSku:'CON-GRS-031',qtyRequired:50,qtyUsed:0,unitCost:3.80},{id:11,productId:8,productName:'Machine Oil (1L)',productSku:'CON-LUB-030',qtyRequired:50,qtyUsed:0,unitCost:5.50},{id:12,productId:10,productName:'Drill Bit Set (HSS)',productSku:'TOL-DRL-040',qtyRequired:10,qtyUsed:0,unitCost:22.00}] },
    { id:5, jobNumber:'JOB-2025-005', title:'Custom Motor (500W) Prototype', description:'Prototype custom 500W motor for client specs', status:'planned', priority:'high', assignedTo:'Ravi Patel', startDate:'2025-04-15', dueDate:'2025-05-01', completedDate:null, totalMaterialCost:210.00, notes:'Client specs received, awaiting engineering sign-off', materials:[{id:13,productId:1,productName:'Steel Rod (12mm)',productSku:'RAW-STL-001',qtyRequired:20,qtyUsed:0,unitCost:2.50},{id:14,productId:2,productName:'Aluminium Sheet (2mm)',productSku:'RAW-ALM-002',qtyRequired:10,qtyUsed:0,unitCost:4.20},{id:15,productId:3,productName:'Copper Wire (1.5mm)',productSku:'RAW-CPR-003',qtyRequired:5,qtyUsed:0,unitCost:18.00}] },
  ];

  const defaultActivities = [
    { id:1, type:'sale', action:'created', description:'New sales order SO-2025-005 from Sigma Tools & Equipment', user:'manager', createdAt:'2025-04-01T10:30:00', reference:'SO-2025-005' },
    { id:2, type:'purchase', action:'created', description:'Purchase order PO-2025-005 placed with ToolSource Direct', user:'admin', createdAt:'2025-03-28T09:15:00', reference:'PO-2025-005' },
    { id:3, type:'job', action:'updated', description:'Job JOB-2025-003 status updated to in_progress', user:'operator', createdAt:'2025-03-10T08:00:00', reference:'JOB-2025-003' },
    { id:4, type:'purchase', action:'created', description:'Purchase order PO-2025-004 placed with MetalMart Supplies', user:'admin', createdAt:'2025-03-15T11:00:00', reference:'PO-2025-004' },
    { id:5, type:'sale', action:'updated', description:'Sales order SO-2025-004 status updated to shipped', user:'manager', createdAt:'2025-03-22T14:00:00', reference:'SO-2025-004' },
    { id:6, type:'job', action:'created', description:'New job JOB-2025-004 planned for maintenance kit assembly', user:'manager', createdAt:'2025-03-18T16:00:00', reference:'JOB-2025-004' },
    { id:7, type:'ledger', action:'created', description:'Stock adjustment ADJ-001: 2 units of Bearing Grease written off', user:'admin', createdAt:'2024-12-15T09:00:00', reference:'ADJ-001' },
    { id:8, type:'product', action:'updated', description:'Reorder point updated for CON-GRS-031 (Bearing Grease)', user:'admin', createdAt:'2024-12-16T10:00:00', reference:'CON-GRS-031' },
  ];

  function getProducts() {
    const stored = sessionStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultProducts));
  }
  function setProducts(arr) {
    sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify(arr));
  }
  function getLedger() {
    const stored = sessionStorage.getItem(LEDGER_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultLedger));
  }
  function setLedger(arr) {
    sessionStorage.setItem(LEDGER_KEY, JSON.stringify(arr));
  }
  function getPurchases() {
    const stored = sessionStorage.getItem(PURCHASES_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultPurchases));
  }
  function setPurchases(arr) {
    sessionStorage.setItem(PURCHASES_KEY, JSON.stringify(arr));
  }
  function getSales() {
    const stored = sessionStorage.getItem(SALES_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultSales));
  }
  function setSales(arr) {
    sessionStorage.setItem(SALES_KEY, JSON.stringify(arr));
  }
  function getJobs() {
    const stored = sessionStorage.getItem(JOBS_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultJobs));
  }
  function setJobs(arr) {
    sessionStorage.setItem(JOBS_KEY, JSON.stringify(arr));
  }
  function getActivities() {
    return JSON.parse(JSON.stringify(defaultActivities));
  }

  // Admin: full activity log (audit-style; production would append on each action)
  const defaultActivityLog = [
    { id:1, createdAt:'2025-04-02T16:45:00', user:'admin', userRole:'admin', action:'Login', module:'Auth', details:'Successful sign-in from web client', reference:'—', ip:'192.168.1.10' },
    { id:2, createdAt:'2025-04-02T15:20:00', user:'manager', userRole:'manager', action:'Update', module:'Sales', details:'SO-2025-004 marked as shipped', reference:'SO-2025-004', ip:'192.168.1.22' },
    { id:3, createdAt:'2025-04-02T14:05:00', user:'operator', userRole:'operator', action:'View', module:'Jobs', details:'Opened job JOB-2025-003', reference:'JOB-2025-003', ip:'192.168.1.45' },
    { id:4, createdAt:'2025-04-02T11:30:00', user:'admin', userRole:'admin', action:'Create', module:'Purchase', details:'Created PO-2025-005', reference:'PO-2025-005', ip:'192.168.1.10' },
    { id:5, createdAt:'2025-04-01T10:35:00', user:'manager', userRole:'manager', action:'Create', module:'Sales', details:'New order SO-2025-005', reference:'SO-2025-005', ip:'192.168.1.22' },
    { id:6, createdAt:'2025-04-01T09:00:00', user:'admin', userRole:'admin', action:'Export', module:'Reports', details:'Inventory valuation PDF export', reference:'—', ip:'192.168.1.10' },
    { id:7, createdAt:'2025-03-28T09:18:00', user:'admin', userRole:'admin', action:'Create', module:'Purchase', details:'PO-2025-005 placed with ToolSource Direct', reference:'PO-2025-005', ip:'192.168.1.10' },
    { id:8, createdAt:'2025-03-25T13:40:00', user:'manager', userRole:'manager', action:'Update', module:'Inventory', details:'Viewed low-stock report', reference:'—', ip:'192.168.1.22' },
    { id:9, createdAt:'2025-03-22T14:02:00', user:'manager', userRole:'manager', action:'Update', module:'Sales', details:'Status change on SO-2025-004', reference:'SO-2025-004', ip:'192.168.1.22' },
    { id:10, createdAt:'2025-03-18T16:05:00', user:'manager', userRole:'manager', action:'Create', module:'Jobs', details:'New job JOB-2025-004 created', reference:'JOB-2025-004', ip:'192.168.1.22' },
    { id:11, createdAt:'2025-03-15T11:02:00', user:'admin', userRole:'admin', action:'Create', module:'Purchase', details:'PO-2025-004 with MetalMart Supplies', reference:'PO-2025-004', ip:'192.168.1.10' },
    { id:12, createdAt:'2025-03-10T08:01:00', user:'operator', userRole:'operator', action:'Update', module:'Jobs', details:'JOB-2025-003 set to in progress', reference:'JOB-2025-003', ip:'192.168.1.45' },
    { id:13, createdAt:'2025-03-08T17:22:00', user:'admin', userRole:'admin', action:'Update', module:'Inventory', details:'Reorder point edit CON-GRS-031', reference:'CON-GRS-031', ip:'192.168.1.10' },
    { id:14, createdAt:'2025-02-14T10:00:00', user:'manager', userRole:'manager', action:'Login', module:'Auth', details:'Successful sign-in', reference:'—', ip:'10.0.0.5' },
    { id:15, createdAt:'2025-02-01T09:15:00', user:'admin', userRole:'admin', action:'Config', module:'System', details:'Session storage cleared (demo reset)', reference:'—', ip:'192.168.1.10' },
    { id:16, createdAt:'2025-01-20T12:00:00', user:'operator', userRole:'operator', action:'View', module:'Ledger', details:'Access denied — redirected (role)', reference:'—', ip:'192.168.1.45' },
    { id:17, createdAt:'2025-01-15T11:05:00', user:'operator', userRole:'operator', action:'Update', module:'Jobs', details:'Material usage logged for JOB-2024-002', reference:'JOB-2024-002', ip:'192.168.1.45' },
    { id:18, createdAt:'2025-01-10T13:10:00', user:'manager', userRole:'manager', action:'Update', module:'Sales', details:'SO-2024-003 delivered', reference:'SO-2024-003', ip:'192.168.1.22' },
    { id:19, createdAt:'2025-01-07T10:00:00', user:'admin', userRole:'admin', action:'Receive', module:'Purchase', details:'PO-2024-003 goods received', reference:'PO-2024-003', ip:'192.168.1.10' },
    { id:20, createdAt:'2024-12-20T08:30:00', user:'admin', userRole:'admin', action:'Backup', module:'System', details:'Scheduled backup completed (demo)', reference:'—', ip:'192.168.1.10' },
    { id:21, createdAt:'2024-12-16T10:02:00', user:'admin', userRole:'admin', action:'Adjust', module:'Ledger', details:'Stock adjustment ADJ-001', reference:'ADJ-001', ip:'192.168.1.10' },
    { id:22, createdAt:'2024-12-12T15:35:00', user:'manager', userRole:'manager', action:'Create', module:'Sales', details:'SO-2024-002 created', reference:'SO-2024-002', ip:'192.168.1.22' },
    { id:23, createdAt:'2024-12-05T14:05:00', user:'manager', userRole:'manager', action:'Create', module:'Sales', details:'SO-2024-001', reference:'SO-2024-001', ip:'192.168.1.22' },
    { id:24, createdAt:'2024-12-01T09:12:00', user:'admin', userRole:'admin', action:'Create', module:'Purchase', details:'Initial PO-2024-001', reference:'PO-2024-001', ip:'192.168.1.10' },
    { id:25, createdAt:'2024-11-28T11:00:00', user:'admin', userRole:'admin', action:'Login', module:'Auth', details:'First login after deployment', reference:'—', ip:'192.168.1.10' },
  ];

  const defaultErrorLog = [
    { id:1, createdAt:'2025-04-02T16:12:33', level:'warning', source:'API.Sync', message:'Supplier catalog sync skipped — offline mode', detail:'Endpoint https://api.vendor.example/unavailable returned ECONNREFUSED', user:'system' },
    { id:2, createdAt:'2025-04-02T08:01:02', level:'error', source:'Import.CSV', message:'Row 14 failed validation', detail:'Column qty: expected positive integer, got "12.5.0"', user:'manager' },
    { id:3, createdAt:'2025-04-01T22:45:00', level:'warning', source:'Scheduler', message:'Nightly report job delayed 12 min', detail:'Queue depth 3; completed at 22:57', user:'system' },
    { id:4, createdAt:'2025-03-30T14:20:11', level:'error', source:'Print.Label', message:'Barcode printer not reachable', detail:'Device 192.168.1.88:9100 timeout after 5s', user:'operator' },
    { id:5, createdAt:'2025-03-28T10:05:00', level:'warning', source:'Auth', message:'Multiple failed login attempts', detail:'User "unknown" — 5 attempts from 203.0.113.10', user:'system' },
    { id:6, createdAt:'2025-03-25T09:33:44', level:'error', source:'Email', message:'PO approval email bounced', detail:'SMTP 550 Mailbox unavailable for admin@legacy-supplier.in', user:'admin' },
    { id:7, createdAt:'2025-03-22T18:00:00', level:'warning', source:'Cache', message:'Redis fallback to in-memory', detail:'Connection refused localhost:6379 — using LRU cache', user:'system' },
    { id:8, createdAt:'2025-03-18T11:15:22', level:'error', source:'Integration.ERP', message:'Webhook delivery failed', detail:'HTTP 500 from partner callback URL', user:'system' },
    { id:9, createdAt:'2025-03-10T07:59:01', level:'warning', source:'Jobs', message:'Material reservation partial', detail:'SKU RAW-CPR-003 short by 2 units for JOB-2025-003', user:'operator' },
    { id:10, createdAt:'2025-02-28T23:59:00', level:'error', source:'Backup', message:'Incremental backup verification failed', detail:'Checksum mismatch on block 0x4a2f', user:'system' },
    { id:11, createdAt:'2025-02-14T16:40:00', level:'warning', source:'Browser', message:'Deprecated API usage', detail:'localStorage quota 80% — recommend archive', user:'admin' },
    { id:12, createdAt:'2025-02-01T13:22:00', level:'error', source:'Payment', message:'Gateway timeout', detail:'Txn ref PENDING-8821 — status unknown', user:'manager' },
    { id:13, createdAt:'2025-01-25T08:00:00', level:'warning', source:'Inventory', message:'Negative stock prevented', detail:'SO line blocked — FIN-PMP-021 insufficient qty', user:'manager' },
    { id:14, createdAt:'2025-01-10T12:11:00', level:'error', source:'File.Upload', message:'Attachment rejected', detail:'File type .exe not allowed for PO scan', user:'admin' },
    { id:15, createdAt:'2024-12-20T06:00:00', level:'warning', source:'Update', message:'Client bundle v1.0.0 behind latest', detail:'Recommend refresh — cached assets from CDN', user:'system' },
    { id:16, createdAt:'2024-12-15T09:05:00', level:'error', source:'Ledger', message:'Double-entry validation warning', detail:'Batch ADJ-001 imbalance 0.01 — auto-corrected', user:'admin' },
    { id:17, createdAt:'2024-12-01T10:00:00', level:'warning', source:'Network', message:'Intermittent latency to DB replica', detail:'Read query 2.4s > SLA 1s', user:'system' },
  ];

  function getActivityLog() {
    return JSON.parse(JSON.stringify(defaultActivityLog)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  function getErrorLog() {
    return JSON.parse(JSON.stringify(defaultErrorLog)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function resetAll() {
    sessionStorage.removeItem(PRODUCTS_KEY);
    sessionStorage.removeItem(LEDGER_KEY);
    sessionStorage.removeItem(PURCHASES_KEY);
    sessionStorage.removeItem(SALES_KEY);
    sessionStorage.removeItem(JOBS_KEY);
  }

  function resetUsersToDefault() {
    localStorage.removeItem(USERS_KEY);
  }
  function nextId(arr) {
    return arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1;
  }

  return {
    getProducts, setProducts, getLedger, setLedger, getPurchases, setPurchases, getSales, setSales, getJobs, setJobs, getActivities, getActivityLog, getErrorLog, resetAll, nextId,
    getUsers, setUsers, addUser, updateUser, deleteUser, findUserForLogin, countAdmins, resetUsersToDefault,
  };
})();
