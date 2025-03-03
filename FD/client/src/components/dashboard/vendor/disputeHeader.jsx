import React from 'react';

function DisputeHeader({ count}) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
    <h2 className="h4 mb-2 mb-md-0">
      Associated Disputes ({count})
    </h2>
    
  </div>
  );
}

export default DisputeHeader;