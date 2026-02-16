// Simple test to check if TensorFlow.js works
const tf = require('@tensorflow/tfjs');

console.log('🔍 Testing TensorFlow.js...\n');

// Test 1: Check TensorFlow.js version
console.log(`✅ TensorFlow.js version: ${tf.version.tfjs}`);

// Test 2: Create a simple tensor
const tensor = tf.tensor([1, 2, 3, 4]);
console.log(`✅ Created tensor: ${tensor.shape}`);
tensor.dispose();

// Test 3: Simple computation
const a = tf.tensor2d([[1, 2], [3, 4]]);
const b = tf.tensor2d([[5, 6], [7, 8]]);
const c = a.add(b);
console.log('✅ Matrix addition works');
c.print();
a.dispose();
b.dispose();
c.dispose();

// Test 4: Check memory
console.log(`\n📊 Memory: ${tf.memory().numTensors} tensors in memory`);

console.log('\n✅ All TensorFlow.js tests passed!');
