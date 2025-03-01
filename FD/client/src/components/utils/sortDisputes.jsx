// src/utils/sortDisputes.js

export const sortDisputes = (disputes, sortType) => {
    if (!disputes) return [];
  
    const sorted = [...disputes];
  
    switch (sortType) {
      case 'date_asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'amount_desc':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'amount_asc':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'unsolved_first':
        return sorted.sort((a, b) => {
          const aIsUnsolved = a.status.toLowerCase() === 'submitted';
          const bIsUnsolved = b.status.toLowerCase() === 'submitted';
          return bIsUnsolved - aIsUnsolved; // Unsolved cases come first
        });
      default:
        return sorted;
    }
  };
  
  export const filterDisputesByName = (disputes, searchQuery) => {
    if (!searchQuery) return disputes;
    return disputes.filter((dispute) =>
      dispute.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };