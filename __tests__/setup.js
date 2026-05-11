/**
 * Jest Setup File
 * Configure DOM environment for frontend testing
 */

// Create a simple DOM structure for testing
document.body.innerHTML = `
  <div id="app">
    <div class="sidebar">
      <nav id="nav">
        <div class="nav-item" data-module="plan">Plan</div>
        <div class="nav-item" data-module="report">Report</div>
      </nav>
    </div>
    <div class="main">
      <div id="greeting-text"></div>
      <div id="plan-section" class="section"></div>
      <div id="report-section" class="section"></div>
    </div>
  </div>
`;

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
