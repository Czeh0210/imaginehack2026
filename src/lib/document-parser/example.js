'use strict';

/**
 * Example usage of DocumentParserService.
 * Run directly:  node src/lib/document-parser/example.js <path-to-file>
 */

const path = require('path');
const { DocumentParserService } = require('./index');

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node example.js <path-to-document>');
    console.error('Example: node example.js ./sample.pdf');
    process.exit(1);
  }

  const service = new DocumentParserService();

  console.log(`Parsing: ${path.resolve(filePath)}\n`);

  const result = await service.parseDocument(path.resolve(filePath));

  console.log('─'.repeat(60));
  console.log(`Filename  : ${result.filename}`);
  console.log(`File type : ${result.fileType}`);
  console.log(`Char count: ${result.characterCount}`);
  console.log('─'.repeat(60));
  console.log('Markdown preview (first 500 chars):\n');
  console.log(result.markdown.slice(0, 500));

  if (result.markdown.length > 500) {
    console.log(`\n... (${result.markdown.length - 500} more characters)`);
  }
}

main().catch((err) => {
  console.error(`Error [${err.code ?? 'UNKNOWN'}]: ${err.message}`);
  process.exit(1);
});
