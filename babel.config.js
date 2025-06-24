module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    // Explicitly define an empty plugins array to prevent Metro from injecting invalid ones
    plugins: []
  };
};