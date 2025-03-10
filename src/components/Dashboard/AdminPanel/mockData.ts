export const mockUsers = [
  {
    id: '0',
    name: 'Dallas Reynolds',
    email: 'dallas@prophone.io',
    plan: 'god_mode',
    status: 'owner', // Special status for owner that cannot be changed
    joinDate: '2025-01-01',
    lastLogin: new Date().toLocaleDateString(),
    avatar: 'https://dallasreynoldstn.com/wp-content/uploads/2025/02/26F25F1E-C8E9-4DE6-BEE2-300815C83882.png',
    role: 'owner'
  },
  {
    id: '1',
    name: 'Sophia Martinez',
    email: 'sophia@example.com',
    plan: 'enterprise',
    status: 'active',
    joinDate: '2025-01-15',
    lastLogin: '2025-09-10',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'james@example.com',
    plan: 'pro',
    status: 'active',
    joinDate: '2025-02-28',
    lastLogin: '2025-09-11',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma@example.com',
    plan: 'starter',
    status: 'active',
    joinDate: '2025-03-17',
    lastLogin: '2025-09-08',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael@example.com',
    plan: 'pro',
    status: 'suspended',
    suspensionReason: 'Payment Issue',
    suspendedAt: new Date().toISOString(),
    billingStatus: 'failed',
    joinDate: '2025-02-15',
    lastLogin: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '5',
    name: 'Lisa Johnson',
    email: 'lisa@example.com',
    plan: 'starter',
    status: 'active',
    joinDate: '2025-05-12',
    lastLogin: '2025-09-12',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  }
];