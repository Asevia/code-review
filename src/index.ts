export const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Hello from TypeScript with ES Modules!');
  console.log(greet('World'));
}
