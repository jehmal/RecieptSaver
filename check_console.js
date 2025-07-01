// Script to inject into the page to capture console errors
(function() {
    const errors = [];
    const warnings = [];
    
    // Capture existing console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Override console.error
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // Override console.warn
    console.warn = function(...args) {
        warnings.push(args.join(' '));
        originalWarn.apply(console, args);
    };
    
    // Export function to get logs
    window.getConsoleLogs = function() {
        return { errors, warnings };
    };
})();
EOF < /dev/null
