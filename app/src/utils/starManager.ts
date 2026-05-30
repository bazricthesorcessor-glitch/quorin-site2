type Manager = {
  count: number;
  getCap: () => number;
  requestReserve: (n: number) => number;
  release: (n?: number) => void;
  getCount: () => number;
};

const manager: Manager = {
  count: 0,
  getCap: () => (window.innerWidth <= 768 ? 25 : 100),
  requestReserve: (n: number) => {
    const cap = manager.getCap();
    const allowed = Math.max(0, Math.min(n, cap - manager.count));
    manager.count += allowed;
    return allowed;
  },
  release: (n = 1) => {
    manager.count = Math.max(0, manager.count - n);
  },
  getCount: () => manager.count,
};

// no-op on resize — cap computed dynamically
window.addEventListener('resize', () => {});

export default manager;
