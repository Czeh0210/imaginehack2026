const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\Victus\\.gemini\\antigravity-ide\\brain\\f2ec330e-5ded-41d5-bace-591d87aaca9c\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  for await (const line of rl) {
    if (line.includes("+ Calendar") || line.includes("Google Calendar") || line.includes("RouteModal") || line.includes("showRoute")) {
      console.log(`--- MATCH ${++count} ---`);
      console.log(line);
    }
  }
}

main();
